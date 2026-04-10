import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Snackbar } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/themeSlice';
import { saveMood } from '../redux/moodSlice';

import useAppColors from '../Helpers/useAppColors';
import { detectMoodFun } from '../backend/detectMood';

import data from '../samsung_health_heart_rate_dummy.json';

const readings = data.readings;
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
    loadStoredSettings();
  }, []);

  useEffect(() => {
    if (!isSmartDevice) return;
    if (!readings || readings.length === 0) return;

    const processRandomReading = () => {
      const randomIndex = Math.floor(Math.random() * readings.length);
      const reading = readings[randomIndex];

      if (!reading) return;

      const bpm = reading.bpm;
      const detectedMood = detectMoodFun(bpm);

      console.log('[HeartRate Simulation]', `BPM: ${bpm}`, `→ Detected Mood: ${detectedMood}`);

      setCurrentBPM(bpm);
      setSavedMood(detectedMood);
      setLastUpdatedTime(new Date());

      AsyncStorage.setItem(MOOD_KEY, detectedMood);
      dispatch(saveMood({ mood: detectedMood }));
    };

    // Run immediately so we don't wait 2 mins for the first data
    processRandomReading();

    // Simulate heart rate reading every 2 minutes
    const interval = setInterval(processRandomReading, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isSmartDevice]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const showSnackbar = (message) => {
    setSnackbarText(message);
    setSnackbarVisible(true);
  };

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

    // Clear BPM display if switching to manual mode to avoid confusion
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
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={pickerMood}
                    onValueChange={handleMoodChange}
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
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Live Heart Rate</Text>
              <Text style={styles.previewValue}>
                {currentBPM ? `${currentBPM} BPM` : 'Waiting for data...'}
              </Text>
            </View>
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
      backgroundColor: colors.surface,
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
  });
