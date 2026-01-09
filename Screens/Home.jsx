import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import useAppColors from '../Helpers/useAppColors';

export default function Home({ navigation, route }) {
  const colors = useAppColors();
  const isDark = useSelector((state) => state.theme.isDark);
  const styles = createStyles(colors);

  // Get moodFromRoute if passed
  const moodFromRoute = route.params?.moodFromRoute;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>
          Ready to get things done?
        </Text>

        <Pressable onPress={() => navigation.navigate('Settings', { moodFromRoute })}>
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Auth', { moodFromRoute })}>
          <LinearGradient
            colors={colors.gradientSecondary}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Auth</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('MoodPlaylists', { mood: moodFromRoute })}>
          <LinearGradient
            colors={colors.gradientSecondary}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Music</Text>
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
