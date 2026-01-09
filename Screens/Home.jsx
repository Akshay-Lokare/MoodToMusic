import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import useAppColors from '../Helpers/useAppColors';
import { Ionicons } from '@expo/vector-icons';

export default function Home({ navigation, route }) {
  const colors = useAppColors();
  const isDark = useSelector((state) => state.theme.isDark);
  const styles = createStyles(colors);

  // Get username from Auth
  const authUsername = route.params?.authUsername;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{authUsername || 'Guest'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>What would you like to do?</Text>

      <View style={styles.grid}>

        <Pressable
          onPress={() => navigation.navigate('MoodPlaylists', { authUsername })}
          style={({ pressed }) => [
            styles.cardContainer,
            { transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
        >
          <LinearGradient
            colors={colors.gradientPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Ionicons name="musical-notes" size={32} color="white" />
            <Text style={styles.cardTitle}>Find Music</Text>
            <Text style={styles.cardSubtitle}>Based on your mood</Text>
          </LinearGradient>
        </Pressable>


        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={({ pressed }) => [
            styles.cardContainer,
            { transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
        >
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Ionicons name="settings-sharp" size={32} color="white" />
            <Text style={styles.cardTitle}>Settings</Text>
            <Text style={styles.cardSubtitle}>Theme & Preferences</Text>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  username: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 20,
  },
  grid: {
    gap: 20,
  },
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  card: {
    padding: 24,
    minHeight: 140,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
});
