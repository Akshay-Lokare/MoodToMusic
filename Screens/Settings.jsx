import { View, Text, StyleSheet, Pressable, Switch, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useRef } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Snackbar } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/themeSlice';
import { saveMood } from '../redux/moodSlice';
import useAppColors from '../Helpers/useAppColors';
import { Ionicons } from '@expo/vector-icons';

const MOOD_KEY = 'asyMood';

export default function Settings({ navigation, route }) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.theme.isDark);

  const [mood, setMood] = useState('');
  const [savedMood, setSavedMood] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  useEffect(() => {
    console.log('[Settings] Screen mounted');

    const loadStoredData = async () => {
      try {
        console.log('[AsyncStorage] Loading saved mood');

        const storedMood = await AsyncStorage.getItem(MOOD_KEY);

        console.log('[AsyncStorage] Stored mood:', storedMood);

        if (storedMood) {
          setSavedMood(storedMood);
          // Also update Redux store
          dispatch(saveMood({ mood: storedMood }));
        }
      } catch (error) {
        console.error('[AsyncStorage] Failed to load settings', error);
      }
    };

    loadStoredData();
  }, []);

  const showSnackbar = (message) => {
    console.log('[Snackbar]', message);
    setSnackbarText(message);
    setSnackbarVisible(true);
  };

  const handleMoodChange = async (value) => {
    console.log('[Mood Picker] Selected mood:', value);
    setMood(value);

    // Auto-save mood immediately
    if (value) {
      try {
        await AsyncStorage.setItem(MOOD_KEY, value);

        // Save to Redux store
        dispatch(saveMood({ mood: value }));

        setSavedMood(value);
        console.log('[Auto-save] Mood saved:', value);
        showSnackbar(`Mood set to: ${value}`);
      } catch (error) {
        console.error('[Auto-save] Failed:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalization</Text>

          <Text style={styles.label}>Mood</Text>
          <LinearGradient colors={colors.gradientPrimary} style={styles.pickerGradient}>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={mood}
                onValueChange={handleMoodChange}
                dropdownIconColor={colors.accentBlue}
              >
                <Picker.Item label="" value="" style={{ color: 'black' }} />
                <Picker.Item label="Happy" value="happy" style={{ color: 'black' }} />
                <Picker.Item label="Calm" value="calm" style={{ color: 'black' }} />
                <Picker.Item label="Excited" value="excited" style={{ color: 'black' }} />
                <Picker.Item label="Sad" value="sad" style={{ color: 'black' }} />
              </Picker>
            </View>

          </LinearGradient>

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Current mood</Text>
            <Text style={styles.previewValue}>{savedMood || '—'}</Text>
          </View>

        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.row}>
            <Text style={styles.rowText}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={() => {
                console.log('[Theme] Toggle dark mode');
                dispatch(toggleTheme());
              }}
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
    </SafeAreaView >
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
      overflow: 'hidden',
    },
    notesInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      minHeight: 60,
      textAlignVertical: 'top',
      marginBottom: 14,
      color: colors.textPrimary,
    },

    preview: {
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    previewValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: 6,
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
    helper: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 6,
    },
    link: {
      textAlign: 'center',
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 12,
    },
  });
