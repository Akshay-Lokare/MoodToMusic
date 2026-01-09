import { View, Text, StyleSheet, Pressable, Switch, TextInput, ScrollView } from 'react-native';
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

const MOOD_KEY = 'asyMood';
const NOTES_KEY = 'asyNotes';



export default function Settings({ navigation, route }) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.theme.isDark);

  // Get moodFromRoute if passed
  const moodFromRoute = route.params?.moodFromRoute;

  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [savedMood, setSavedMood] = useState('');
  const [savedNotes, setSavedNotes] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  useEffect(() => {
    console.log('[Settings] Screen mounted');

    const loadStoredData = async () => {
      try {
        console.log('[AsyncStorage] Loading saved mood & notes');

        const storedMood = await AsyncStorage.getItem(MOOD_KEY);
        const storedNotes = await AsyncStorage.getItem(NOTES_KEY);

        console.log('[AsyncStorage] Stored mood:', storedMood);
        console.log('[AsyncStorage] Stored notes:', storedNotes);

        if (storedMood) {
          setSavedMood(storedMood);
          // Also update Redux store
          dispatch(saveMood({ mood: storedMood, notes: storedNotes || '' }));
        }
        if (storedNotes) setSavedNotes(storedNotes);
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
        await AsyncStorage.setItem(NOTES_KEY, notes);

        // Save to Redux store
        dispatch(saveMood({ mood: value, notes }));

        setSavedMood(value);
        console.log('[Auto-save] Mood saved:', value);
        showSnackbar(`Mood set to: ${value}`);
      } catch (error) {
        console.error('[Auto-save] Failed:', error);
      }
    }
  };

  const handleNotesChange = (text) => {
    console.log('[Notes] Updated notes:', text);
    setNotes(text);
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Personalization */}
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
                <Picker.Item label="Select mood" value="" />
                <Picker.Item label="Happy" value="happy" />
                <Picker.Item label="Calm" value="calm" />
                <Picker.Item label="Excited" value="excited" />
                <Picker.Item label="Sad" value="sad" />
              </Picker>
            </View>
          </LinearGradient>

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Write something..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={handleNotesChange}
            multiline
          />

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Current mood</Text>
            <Text style={styles.previewValue}>{savedMood || '—'}</Text>

            <Text style={styles.previewLabel}>Notes</Text>
            <Text style={styles.previewValue}>{savedNotes || '—'}</Text>
          </View>
        </View>

        {/* Appearance */}
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

          <Text style={styles.helper}>
            Theme is controlled globally using Redux
          </Text>
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
