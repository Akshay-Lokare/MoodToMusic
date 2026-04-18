import { View, Text, StyleSheet, Pressable, Switch, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useRef, useCallback } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Snackbar } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/themeSlice';
import { saveMood } from '../redux/moodSlice';

import useAppColors from '../Helpers/useAppColors';
import { detectMoodFun } from '../backend/detectMood';

import {
  startHeartSensorListening,
  writeHeartSensorCommand,
  setHrDiagLogger,
  hrDebugLog,
} from '../Helpers/bleService';

const MOOD_KEY = 'asyMood';
const SMART_DEVICE_KEY = 'isSmartDevice';

export default function Settings({ navigation }) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.theme.isDark);

  const [pickerMood, setPickerMood] = useState('');
  const [savedMood, setSavedMood] = useState('');
  const [isSmartDevice, setIsSmartDevice] = useState(false);
  const [currentBPM, setCurrentBPM] = useState(null);
  const [sensorConnecting, setSensorConnecting] = useState(false);
  const [sensorConnected, setSensorConnected] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [hrDiagText, setHrDiagText] = useState('');
  const [showHrLogs, setShowHrLogs] = useState(false);

  const sensorDisconnectRef = useRef(null);
  const sensorDeviceRef = useRef(null);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  const [lastUpdatedTime, setLastUpdatedTime] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const loadStoredSettings = async () => {
      console.log('Loading stored settings...');
      const storedMood = await AsyncStorage.getItem(MOOD_KEY);
      if (storedMood) {
        setSavedMood(storedMood);
        dispatch(saveMood({ mood: storedMood }));
      }

      const storedSmartDevice = await AsyncStorage.getItem(SMART_DEVICE_KEY);
      if (storedSmartDevice !== null) {
        const isSmart = JSON.parse(storedSmartDevice);
        setIsSmartDevice(isSmart);
        console.log('Settings loaded. Smart Device Mode:', isSmart);
      } else {
        console.log('Settings loaded. Defaulting Smart Device Mode to false.');
      }
    };
    loadStoredSettings().finally(() => setSettingsLoaded(true));
  }, []);

  useEffect(() => {
    setHrDiagLogger((line) => {
      setHrDiagText((prev) => `${line}\n${prev}`.slice(0, 2500));
    });
    return () => setHrDiagLogger(null);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const showSnackbar = useCallback((message) => {
    setSnackbarText(message);
    setSnackbarVisible(true);
  }, []);

  const handleShareHrLogs = async () => {
    const text = hrDiagText?.trim();
    if (!text) {
      showSnackbar('No debug logs yet');
      return;
    }
    try {
      await Share.share({
        title: 'MoodMusic BLE Debug Logs',
        message: text,
      });
    } catch (e) {
      hrDebugLog(`share logs failed: ${e?.message ?? e}`);
      showSnackbar('Could not open share dialog');
    }
  };

  const handleClearHrLogs = () => {
    setHrDiagText('');
    hrDebugLog('debug log cleared');
  };

  const disconnectSensor = useCallback(async () => {
    hrDebugLog('disconnectSensor()');
    const d = sensorDisconnectRef.current;
    sensorDisconnectRef.current = null;
    sensorDeviceRef.current = null;
    if (d) await d();
    setSensorConnected(false);
  }, []);

  const handleConnectSensor = async () => {
    if (sensorConnecting || sensorConnected) return;
    hrDebugLog('Connect button pressed');
    setSensorConnecting(true);
    try {
      const { disconnect: d, device } = await startHeartSensorListening(
        (bpmStr) => {
          hrDebugLog(`onHeartRate raw: ${JSON.stringify(bpmStr)}`);
          const bpm = parseInt(bpmStr, 10);
          if (Number.isNaN(bpm)) {
            hrDebugLog('parseInt failed for BPM');
            return;
          }

          const detectedMood = detectMoodFun(bpm);
          const moodForApp = Array.isArray(detectedMood)
            ? detectedMood[0]
            : detectedMood;
          hrDebugLog(`BPM ${bpm} → mood ${moodForApp}`);

          setCurrentBPM(Number(bpm));
          setSavedMood(moodForApp);
          setLastUpdatedTime(new Date());

          AsyncStorage.setItem(MOOD_KEY, moodForApp);
          dispatch(saveMood({ mood: moodForApp }));
        }
      );
      sensorDisconnectRef.current = d;
      sensorDeviceRef.current = device;
      hrDebugLog(`connected ref ${device?.id} ${device?.name ?? ''}`);
      setSensorConnected(true);
      showSnackbar('Connected to heart sensor');
    } catch (e) {
      hrDebugLog(`connect error: ${e?.message ?? e}`);
      showSnackbar(e?.message || 'Could not connect to heart sensor');
    } finally {
      setSensorConnecting(false);
    }
  };

  const handleStartMeasurement = async () => {
    const device = sensorDeviceRef.current;
    hrDebugLog(
      `Start measurement: hasDevice=${!!device} connected=${sensorConnected} id=${device?.id ?? 'none'}`
    );
    if (!device || !sensorConnected) {
      hrDebugLog('blocked — connect first');
      showSnackbar('Connect to the sensor first');
      return;
    }
    try {
      await writeHeartSensorCommand(device, '\n');
      hrDebugLog('write finished (see lines above)');
      showSnackbar('Measuring — hold still for ~8 s');
    } catch (e) {
      hrDebugLog(`write failed: ${e?.message ?? e}`);
      showSnackbar(e?.message || 'Could not start measurement');
    }
  };

  useEffect(() => {
    if (!settingsLoaded) return;
    if (!isSmartDevice) {
      disconnectSensor();
      setCurrentBPM(null);
    }
  }, [isSmartDevice, disconnectSensor, settingsLoaded]);

  const handleMoodChange = async (value) => {
    console.log('Manual mood selected:', value);
    setPickerMood(value);
    if (!value) return;

    await AsyncStorage.setItem(MOOD_KEY, value);
    dispatch(saveMood({ mood: value }));
    setSavedMood(value);
    setLastUpdatedTime(new Date());

    showSnackbar(`Mood set to: ${value}`);
  };

  const toggleSmartDevice = async (value) => {
    console.log('Toggling Smart Device Mode:', value);
    setIsSmartDevice(value);
    await AsyncStorage.setItem(SMART_DEVICE_KEY, JSON.stringify(value));

    if (!value) {
      setCurrentBPM(null);
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdatedTime) return '—';

    const diffSeconds = Math.floor(
      (now - lastUpdatedTime.getTime()) / 1000
    );

    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds} sec ago`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    return `${diffMinutes} min ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Mood Last Updated</Text>
            <Text style={styles.previewValue}>
              {formatLastUpdated()}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Personalization</Text>

          <View style={[styles.row, { marginBottom: 20 }]}>
            <Text style={styles.rowText}>Smart Device Mode</Text>
            <Switch
              value={isSmartDevice}
              onValueChange={toggleSmartDevice}
              trackColor={{ false: colors.border, true: colors.accentPink }}
              thumbColor={colors.surface}
            />
          </View>

          {!isSmartDevice && (
            <>
              <Text style={styles.label}>Manual Mood Entry</Text>
              <LinearGradient
                colors={colors.gradientPrimary}
                style={styles.pickerGradient}
              >
                <View
                  style={[
                    styles.pickerWrapper,
                    { backgroundColor: colors.moodPickerSurface },
                  ]}
                >
                  <Picker
                    selectedValue={pickerMood}
                    onValueChange={handleMoodChange}
                    style={{ color: colors.moodPickerText }}
                    dropdownIconColor={colors.moodPickerText}
                  >
                    <Picker.Item label="Select mood..." value="" />
                    <Picker.Item label="Happy" value="happy" />
                    <Picker.Item label="Calm" value="calm" />
                    <Picker.Item label="Excited" value="excited" />
                    <Picker.Item label="Sad" value="sad" />
                  </Picker>
                </View>
              </LinearGradient>
            </>
          )}

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Current Mood</Text>
            <Text style={styles.previewValue}>
              {savedMood || '—'}
            </Text>
          </View>

          {isSmartDevice && (
            <>
              <View style={styles.sensorActions}>
                <Pressable
                  style={[
                    styles.sensorButton,
                    { backgroundColor: colors.accentPinkDark },
                    (sensorConnecting || sensorConnected) && styles.sensorButtonDisabled,
                  ]}
                  onPress={handleConnectSensor}
                  disabled={sensorConnecting || sensorConnected}
                >
                  <Text style={styles.sensorButtonText}>
                    {sensorConnecting ? 'Connecting…' : 'Connect to sensor'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.sensorButtonGradientOuter,
                    (!sensorConnected || sensorConnecting) && styles.sensorButtonDisabled,
                  ]}
                  onPress={handleStartMeasurement}
                  disabled={!sensorConnected || sensorConnecting}
                >
                  <LinearGradient
                    colors={
                      isDark
                        ? colors.gradientPrimary
                        : colors.gradientSensorStartLight
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sensorButtonGradientInner}
                  >
                    <Text
                      style={[
                        styles.sensorButtonText,
                        {
                          color: isDark ? '#fff' : '#0A0A0A',
                        },
                      ]}
                    >
                      Start measurement
                    </Text>
                  </LinearGradient>
                </Pressable>

                {sensorConnected && (
                  <Pressable
                    style={[styles.sensorButton, styles.sensorButtonOutline]}
                    onPress={disconnectSensor}
                  >
                    <Text style={[styles.sensorButtonText, { color: colors.textPrimary }]}>
                      Disconnect
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* <Text style={styles.sensorHint}>
                Disconnect the sensor in Serial Bluetooth Monitor (or any other app) before connecting
                here — most BLE devices stop advertising while already connected.
              </Text> */}

              <View style={styles.hrLiveRow}>
                <View style={[styles.preview, styles.hrLivePreview]}>
                  <Text style={styles.previewLabel}>Live Heart Rate</Text>
                  <Text style={styles.previewValue}>
                    {sensorConnecting
                      ? 'Connecting…'
                      : !sensorConnected
                        ? 'Not connected — tap Connect, then Start measurement'
                        : 'Tap Start measurement; keep your finger on the sensor'}
                  </Text>
                </View>
                <View style={styles.bpmMiniBox}>
                  <Text style={styles.bpmMiniLabel}>BPM</Text>
                  <Text style={styles.bpmMiniValue} numberOfLines={1}>
                    {currentBPM != null ? String(currentBPM) : '—'}
                  </Text>
                </View>
              </View>

              <View style={styles.hrDiagToggleRow}>
                <Pressable
                  onPress={() => setShowHrLogs((prev) => !prev)}
                  style={styles.hrDiagToggleButton}
                >
                  <Text style={styles.hrDiagToggleText}>
                    {showHrLogs ? 'Hide debug logs' : 'Show debug logs'}
                  </Text>
                </Pressable>
              </View>

              {showHrLogs && (
                <View style={styles.hrDiagBox}>
                  <Text style={styles.hrDiagTitle}>BLE debug (on device)</Text>
                  <View style={styles.hrDiagActions}>
                    <Pressable style={styles.hrDiagActionButton} onPress={handleShareHrLogs}>
                      <Text style={styles.hrDiagActionText}>Share Logs</Text>
                    </Pressable>
                    <Pressable style={styles.hrDiagActionButton} onPress={handleClearHrLogs}>
                      <Text style={styles.hrDiagActionText}>Clear Logs</Text>
                    </Pressable>
                  </View>
                  <ScrollView
                    style={styles.hrDiagScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
                    <Text style={styles.hrDiagBody} selectable>
                      {hrDiagText || 'Connect, then Start measurement — lines appear here.'}
                    </Text>
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={() => dispatch(toggleTheme())}
              trackColor={{ false: colors.border, true: colors.accentPurple }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={styles.link}>Back to Home</Text>
        </Pressable>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        style={{ backgroundColor: colors.accentBlue }}
      >
        {snackbarText}
      </Snackbar>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.accentPink,
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.accentBlue,
      marginBottom: 8,
    },
    pickerGradient: {
      borderRadius: 14,
      padding: 1.5,
      marginBottom: 14,
    },
    pickerWrapper: {
      borderRadius: 12,
    },
    preview: {
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    previewLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    previewValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    link: {
      textAlign: 'center',
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 12,
    },
    sensorActions: {
      gap: 10,
      marginBottom: 12,
    },
    sensorButton: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    sensorButtonGradientOuter: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    sensorButtonGradientInner: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    sensorButtonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    sensorButtonDisabled: {
      opacity: 0.45,
    },
    sensorButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    sensorHint: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 17,
      marginBottom: 12,
    },
    hrLiveRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 10,
      marginBottom: 12,
    },
    hrLivePreview: {
      flex: 1,
      marginBottom: 0,
    },
    bpmMiniBox: {
      width: 76,
      paddingVertical: 10,
      paddingHorizontal: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bpmMiniLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    bpmMiniValue: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.accentPink,
    },
    hrDiagToggleRow: {
      alignItems: 'flex-end',
      marginBottom: 10,
    },
    hrDiagToggleButton: {
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    hrDiagToggleText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    hrDiagBox: {
      padding: 10,
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    hrDiagTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    hrDiagActions: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    hrDiagActionButton: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    hrDiagActionText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    hrDiagScroll: {
      maxHeight: 200,
    },
    hrDiagBody: {
      fontSize: 10,
      fontFamily: 'monospace',
      color: colors.textPrimary,
      lineHeight: 14,
      paddingBottom: 4,
    },
  });
