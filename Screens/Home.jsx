import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import useAppColors from '../Helpers/useAppColors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Home({ navigation, route }) {

  const [count, setCount] = useState(0);

  const colors = useAppColors();
  const isDark = useSelector((state) => state.theme.isDark);
  const styles = createStyles(colors);

  // Get username from Auth
  const authUsername = route.params?.authUsername;

  const countIncr = () => {
    setCount(count + 1);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => countIncr()}
            >
              <Text style={styles.username}>{authUsername || 'Hooman'}</Text>
            </TouchableOpacity>

          </View>
        </View>

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

          {count >= 7 && (
            <Pressable
              onPress={() => navigation.navigate('Easter')}
              style={({ pressed }) => [
                styles.cardContainer,
                { transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
            >
              <LinearGradient
                colors={colors.gradientSecondary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Ionicons name="egg-sharp" size={32} color="white" />
                <Text style={styles.cardTitle}>Mystery Easter Egg</Text>
                <Text style={styles.cardSubtitle}>What could it be???</Text>

              </LinearGradient>
            </Pressable>
          )}

        </View>
      </ScrollView>
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
