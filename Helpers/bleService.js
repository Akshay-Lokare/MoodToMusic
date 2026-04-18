import { BleManager } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { Platform, PermissionsAndroid } from "react-native";

const manager = new BleManager();

/**
 * Android 12+ requires runtime BLUETOOTH_SCAN / BLUETOOTH_CONNECT or you get
 * BleError: Device is not authorized to use BluetoothLE. Older APIs need
 * ACCESS_FINE_LOCATION to scan for BLE devices.
 */
async function ensureAndroidBlePermissions() {
  if (Platform.OS !== "android") return;

  const api =
    typeof Platform.Version === "number"
      ? Platform.Version
      : parseInt(String(Platform.Version), 10);

  if (api >= 31) {
    const perms = [
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];
    const results = await PermissionsAndroid.requestMultiple(perms);
    const ok = perms.every(
      (p) => results[p] === PermissionsAndroid.RESULTS.GRANTED
    );
    if (!ok) {
      throw new Error(
        "Bluetooth or location permission denied. Allow Nearby devices and location for this app in Settings."
      );
    }
  } else {
    const r = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (r !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error(
        "Location permission is required to scan for Bluetooth devices on this Android version."
      );
    }
  }
}

const SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const TX_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
const RX_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";

/** Optional UI sink (e.g. on-screen log). Set from Settings via setHrDiagLogger. */
let hrDiagSink = null;
export function setHrDiagLogger(fn) {
  hrDiagSink = typeof fn === "function" ? fn : null;
}

function diag(msg) {
  const line = `[HRDebug] ${msg}`;
  console.log(line);
  try {
    if (hrDiagSink) hrDiagSink(line);
  } catch (_) {
    /* ignore */
  }
}

/** Call from UI (e.g. button handlers) so messages also appear in the on-screen log. */
export function hrDebugLog(msg) {
  diag(msg);
}

/** Must match `BLEDevice::init("…")` in esp firmware. Service UUID is often NOT in the advertisement on ESP32. */
export const HEART_SENSOR_DEVICE_NAME = "XIAO_HEART_MONITOR";

function matchesHeartSensor(device, nameOrSubstring) {
  const n = (device?.name || device?.localName || "").trim();
  if (!n) return false;
  const needle = nameOrSubstring.toUpperCase();
  const hay = n.toUpperCase();
  if (hay === needle || hay.includes(needle)) return true;
  // Some phones truncate or alter the advertised local name
  if (hay.includes("XIAO_HEART") || hay.includes("HEART_MONITOR")) return true;
  return false;
}

/**
 * Same as Serial “ENTER”: tells the ESP to call startMeasurement() when idle.
 * Tries write-without-response first — on many Android + ESP stacks, write-with-response can hang.
 */
export async function writeHeartSensorCommand(device, text = "\n") {
  const base64 = Buffer.from(text, "utf8").toString("base64");
  diag(
    `write → ${device?.id ?? "?"} ${device?.name ?? ""} payload ${JSON.stringify(text)}`
  );
  try {
    await device.writeCharacteristicWithoutResponseForService(
      SERVICE_UUID,
      RX_UUID,
      base64
    );
    diag("write OK (without response)");
    return;
  } catch (e1) {
    diag(`write without-response failed: ${e1?.message ?? e1}`);
  }
  try {
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      RX_UUID,
      base64
    );
    diag("write OK (with response)");
  } catch (e2) {
    diag(`write with-response failed: ${e2?.message ?? e2}`);
    throw e2;
  }
}

function extractHeartRateBpm(text) {
  const m = String(text).match(/Heart Rate:\s*(\d+)/i);
  return m ? m[1].trim() : null;
}

export const connectAndListen = async (device, onHeartRate) => {
  diag(`connectAndListen: ${device?.id} ${device?.name ?? ""}`);
  const connected = await device.connect();
  await connected.discoverAllServicesAndCharacteristics();
  diag(`GATT ready, TX ${TX_UUID}`);

  if (typeof connected.requestMTU === "function") {
    try {
      const mtu = await connected.requestMTU(185);
      diag(`requestMTU ${String(mtu)}`);
    } catch (mtuErr) {
      diag(`requestMTU skip ${mtuErr?.message ?? mtuErr}`);
    }
  }

  let uartBuffer = "";

  const subscription = connected.monitorCharacteristicForService(
    SERVICE_UUID,
    TX_UUID,
    (error, characteristic) => {
      if (error) {
        diag(`TX monitor error ${String(error)}`);
        return;
      }

      if (!characteristic?.value) {
        diag("TX notify: empty value");
        return;
      }

      const chunk = Buffer.from(characteristic.value, "base64").toString("utf8");
      diag(`TX chunk len=${chunk.length} ${JSON.stringify(chunk).slice(0, 120)}`);
      uartBuffer += chunk;

      const parts = uartBuffer.split(/\r?\n/);
      uartBuffer = parts.pop() ?? "";

      for (const line of parts) {
        const bpm = extractHeartRateBpm(line);
        if (bpm) {
          diag(`BPM from line → ${bpm}`);
          onHeartRate(bpm);
        } else if (line.trim()) {
          diag(`TX line (no BPM): ${JSON.stringify(line).slice(0, 80)}`);
        }
      }

      const tailBpm = extractHeartRateBpm(uartBuffer);
      if (tailBpm) {
        diag(`BPM from tail → ${tailBpm}`);
        onHeartRate(tailBpm);
        uartBuffer = "";
      } else if (uartBuffer.length > 200) {
        diag(`tail trim len=${uartBuffer.length}`);
        uartBuffer = uartBuffer.slice(-120);
      }
    }
  );

  diag("TX subscription active");
  return { device: connected, subscription };
};

/**
 * Scans for the heart sensor (Nordic UART service), connects, and forwards BPM strings to onHeartRate.
 * Resolves with { disconnect } when the connection and monitor are ready.
 *
 * Scans all BLE devices and matches by name — ESP32 usually does NOT put the UART service UUID in
 * advertisements, so filtering only by service UUID often finds nothing.
 */
export async function startHeartSensorListening(onHeartRate, options = {}) {
  await ensureAndroidBlePermissions();

  const timeoutMs = options.timeoutMs ?? 60000;
  const nameMatch = options.deviceName ?? HEART_SENSOR_DEVICE_NAME;

  const state = await manager.state();
  if (state !== "PoweredOn") {
    throw new Error("Bluetooth is off. Turn it on to use heart rate.");
  }

  let settled = false;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      manager.stopDeviceScan();
      reject(
        new Error(
          `Heart sensor not found (${nameMatch}). Disconnect it in Serial Bluetooth Monitor (or any other app) first — BLE devices often stop advertising while connected. Then tap Connect again.`
        )
      );
    }, timeoutMs);

    // null UUIDs = scan all devices (ESP32 often does NOT advertise the UART service UUID).
    // null scan options avoids Android quirks with allowDuplicates on some builds.
    manager.startDeviceScan(null, null, async (error, device) => {
      if (settled) return;
      if (error) {
        settled = true;
        clearTimeout(timeoutId);
        manager.stopDeviceScan();
        reject(error);
        return;
      }
      if (!device) return;
      if (!matchesHeartSensor(device, nameMatch)) return;

      diag(`scan matched ${device.id} ${device.name ?? ""} ${device.localName ?? ""}`);
      settled = true;
      clearTimeout(timeoutId);
      manager.stopDeviceScan();

      try {
        const { device: connected, subscription } = await connectAndListen(
          device,
          onHeartRate
        );
        resolve({
          device: connected,
          async disconnect() {
            subscription.remove();
            await connected.cancelConnection().catch(() => {});
          },
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}