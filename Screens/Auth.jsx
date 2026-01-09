import { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';
import useAppColors from '../Helpers/useAppColors';
import { LinearGradient } from 'expo-linear-gradient';

export default function Auth({ navigation, route }) {

  const colors = useAppColors();
  const isDark = useSelector((state) => state.theme.isDark);
  const styles = createStyles(colors);

  const [authUsername, setAuthUsername] = useState('');

  // Get moodFromRoute if passed
  const moodFromRoute = route.params?.moodFromRoute;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          placeholder='username...'
          placeholderTextColor={colors.textSecondary}
          onChangeText={setAuthUsername}
          value={authUsername}
          style={styles.textInput}
        />

        <Pressable onPress={() => navigation.navigate('Home', { moodFromRoute })}>
          <LinearGradient
            colors={colors.gradientSecondary}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Home</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 26,
  },
  content: {
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: colors.accentPink,
    borderRadius: 25,
    flexDirection: 'column',
    gap: 10,
    maxWidth: '100%',
  },
  textInput: {
    padding: 14,
    margin: 10,
    borderWidth: 1,
    borderRadius: 6,
    maxWidth: 'auto',
    borderColor: colors.accentPink,
    color: colors.textPrimary,
  },
  button: {
    padding: 12,
    margin: 8,
    alignItems: 'center',
    elevation: 4,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF', // clean contrast
  },
});