import { View, Text, StyleSheet, Pressable, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Snackbar } from 'react-native-paper';

const MOOD_KEY = 'asyMood';
const NOTES_KEY = 'asyNotes';

export default function Settings({ navigation }) {
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [savedMood, setSavedMood] = useState('');
  const [savedNotes, setSavedNotes] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Load saved mood/notes
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedMood = await AsyncStorage.getItem(MOOD_KEY);
        const storedNotes = await AsyncStorage.getItem(NOTES_KEY);
        if (storedMood) {
          setMood(storedMood);
          setSavedMood(storedMood);
        }
        if (storedNotes) {
          setNotes(storedNotes);
          setSavedNotes(storedNotes);
        }
      } catch (e) {
        console.log('Error loading data');
      }
    };
    loadData();
  }, []);

  // Auto-save mood
  const onMoodChange = async (value) => {
    setMood(value);
    if (!value) return;
    try {
      await AsyncStorage.setItem(MOOD_KEY, value);
      setSavedMood(value);
      showSnackbar('Mood saved!');
    } catch (e) {
      console.log('Error saving mood');
    }
  };

  // Auto-save notes
  const onNotesChange = async (text) => {
    setNotes(text);
    try {
      await AsyncStorage.setItem(NOTES_KEY, text);
      setSavedNotes(text);
      showSnackbar('Notes saved!');
    } catch (e) {
      console.log('Error saving notes');
    }
  };

  const showSnackbar = (msg) => {
    setSnackbarMsg(msg);
    setSnackbarVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Personalization Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personalization</Text>

        {/* Mood Picker */}
        <Text style={styles.label}>Your Mood</Text>
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.pickerGradient}
        >
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={mood}
              onValueChange={onMoodChange}
              dropdownIconColor={colors.textPrimary}
            >
              <Picker.Item label="Select mood" value="" />
              <Picker.Item label="Happy 😄" value="happy" />
              <Picker.Item label="Calm 😌" value="calm" />
              <Picker.Item label="Excited 🤩" value="excited" />
              <Picker.Item label="Sad 😔" value="sad" />
            </Picker>
          </View>
        </LinearGradient>

        {/* Optional Notes */}
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Write something..."
          value={notes}
          onChangeText={onNotesChange}
          multiline
        />

        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Saved mood:</Text>
          <Text style={styles.previewValue}>{savedMood || '—'}</Text>
          <Text style={styles.previewLabel}>Saved notes:</Text>
          <Text style={styles.previewValue}>{savedNotes || '—'}</Text>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.row}>
          <Text style={styles.rowText}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: colors.border, true: colors.accentPurple }}
            thumbColor={isDarkMode ? colors.accentPink : '#FFFFFF'}
          />
        </View>
        <Text style={styles.helper}>Dummy toggle (UI only)</Text>
      </View>

      {/* Footer */}
      <Pressable onPress={() => navigation.navigate('Home')}>
        <Text style={styles.link}>Back to Home</Text>
      </Pressable>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        style={{ backgroundColor: colors.accentBlue }}
      >
        {snackbarMsg}
      </Snackbar>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
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
    color: colors.textPrimary,
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
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
  },

  preview: {
    marginTop: 10,
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
