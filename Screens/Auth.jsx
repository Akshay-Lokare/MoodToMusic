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
  const [isFocesed, setIsFocused] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.content}>
        <View style={styles.headerContainer}>

          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>What should we call you?</Text>
        </View>

        <TextInput
          placeholder='Nickname...'
          placeholderTextColor={colors.textSecondary}
          onChangeText={setAuthUsername}
          value={authUsername}
          style={[styles.textInput, { borderColor: isFocesed ? colors.accentPurple : 'white' }]}
          onFocus={() => setIsFocused(true)}
        />

        <Pressable
          onPress={() => navigation.navigate('Home', { authUsername })}
          style={({ pressed }) => [
            styles.buttonContainer,
            { transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
        >
          <LinearGradient
            colors={colors.gradientPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    gap: 24,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.accentPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  button: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});