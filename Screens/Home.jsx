import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';

export default function Home({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>
          Ready to get things done?
        </Text>

        <Pressable onPress={() => navigation.navigate('Settings', { mood: 'happy' })}>
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Auth')}>
          <LinearGradient
            colors={colors.gradientSecondary}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Auth</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 26,
  },

  content: {
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 36,
  },

  button: {
    width: 220,
    paddingVertical: 14,
    borderRadius: 12, // cleaner, less playful
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2, // minimal depth
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF', // clean contrast
  },
});
