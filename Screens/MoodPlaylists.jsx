import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import useAppColors from '../Helpers/useAppColors';
import { searchMoodPlaylists } from '../Helpers/spotify';

export default function MoodPlaylists({ route, navigation }) {
    const colors = useAppColors();
    const isDark = useSelector((state) => state.theme.isDark);
    const styles = createStyles(colors);

    // Get mood from Redux store first, fallback to route params
    const moodFromRedux = useSelector((state) => state.mood.savedMood);
    const moodFromRoute = route.params?.mood || route.params?.moodFromRoute;
    const mood = moodFromRedux || moodFromRoute;

    const [loading, setLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState(null);
    const [cachedMood, setCachedMood] = useState(null);

    useEffect(() => {
        console.log('[MoodPlaylists] useEffect triggered, mood:', mood);
        console.log('[MoodPlaylists] cachedMood:', cachedMood);

        if (mood) {
            // Only fetch if mood changed (avoid re-fetching same mood)
            if (mood !== cachedMood) {
                loadPlaylists();
            } else {
                console.log('[MoodPlaylists] Using cached results for:', mood);
                setLoading(false);
            }
        } else {
            console.log('[MoodPlaylists] No mood provided, stopping loading');
            setLoading(false);
            setError('No mood selected');
        }
    }, [mood]);

    const loadPlaylists = async () => {
        try {
            setLoading(true);
            setError(null);

            const startTime = Date.now();
            console.log('[MoodPlaylists] 🔍 Loading playlists for mood:', mood);

            // Reduced limit to 3 for testing
            const data = await Promise.race([
                searchMoodPlaylists(mood, null, 3),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout - taking too long')), 15000)
                )
            ]);

            const duration = Date.now() - startTime;
            console.log(`[MoodPlaylists] ✅ Loaded ${data?.length || 0} playlists in ${duration}ms`);

            setPlaylists(data || []);
            setCachedMood(mood); // Cache this mood to avoid re-fetching
        } catch (error) {
            console.error('[MoodPlaylists] Failed to load:', error);
            setError(error.message || 'Failed to load playlists');
        } finally {
            setLoading(false);
        }
    };

    const renderPlaylistItem = ({ item }) => (
        <Pressable style={styles.playlistCard}>
            <Image
                source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/100' }}
                style={styles.playlistImage}
            />
            <View style={styles.playlistInfo}>
                <Text style={styles.playlistName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.playlistDescription} numberOfLines={2}>
                    {item.description || 'No description'}
                </Text>
                <Text style={styles.playlistTracks}>
                    {item.tracks?.total || 0} tracks
                </Text>
            </View>
        </Pressable>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            {error ? (
                <>
                    <Text style={styles.emptyText}>⚠️ Error</Text>
                    <Text style={styles.emptySubtext}>{error}</Text>
                    <Pressable onPress={loadPlaylists} style={{ marginTop: 16 }}>
                        <LinearGradient colors={colors.gradientPrimary} style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </LinearGradient>
                    </Pressable>
                </>
            ) : (
                <>
                    <Text style={styles.emptyText}>No playlists found</Text>
                    <Text style={styles.emptySubtext}>
                        Try a different mood or check your connection
                    </Text>
                </>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accentPink} />
                    <Text style={styles.loadingText}>Finding {mood} playlists...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{mood} mood playlists</Text>
                <Text style={styles.headerSubtitle}>
                    {playlists.length} playlists found
                </Text>
            </View>

            {/* Playlists List */}
            <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={(item, index) => item.id || index.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
            />

            {/* Back Button */}
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <LinearGradient colors={colors.gradientSecondary} style={styles.backGradient}>
                    <Text style={styles.backText}>← Back to Settings</Text>
                </LinearGradient>
            </Pressable>
        </SafeAreaView>
    );
}

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: colors.textSecondary,
        },
        header: {
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.accentPink,
            textTransform: 'capitalize',
        },
        headerSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 4,
        },
        listContent: {
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 100,
        },
        playlistCard: {
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        playlistImage: {
            width: 100,
            height: 100,
            borderRadius: 8,
            backgroundColor: colors.border,
        },
        playlistInfo: {
            flex: 1,
            marginLeft: 12,
            justifyContent: 'center',
        },
        playlistName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: 6,
        },
        playlistDescription: {
            fontSize: 13,
            color: colors.textSecondary,
            marginBottom: 6,
        },
        playlistTracks: {
            fontSize: 12,
            color: colors.accentPink,
            fontWeight: '500',
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: 60,
        },
        emptyText: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: 8,
        },
        emptySubtext: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        retryButton: {
            paddingVertical: 10,
            paddingHorizontal: 24,
            borderRadius: 8,
            alignItems: 'center',
        },
        retryButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#FFFFFF',
        },
        backButton: {
            position: 'absolute',
            bottom: 20,
            left: 24,
            right: 24,
        },
        backGradient: {
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
        },
        backText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
        },
    });
