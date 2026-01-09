import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';
import useAppColors from '../Helpers/useAppColors';

export default function Easter({ navigation }) {

    const isDark = useSelector((state) => state.theme.isDark)
    const colors = useAppColors();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <View style={styles.centerContent}>
                <Text style={styles.title}>Meow.</Text>
                <Text style={styles.subtitle}>( Just a quiet void )</Text>

                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Escape</Text>
                </Pressable>
            </View>
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 48,
        fontWeight: 'bold',
        opacity: 0.1,
    },
    subtitle: {
        color: 'white',
        fontSize: 18,
        opacity: 0.1,
        marginTop: 10,
    },
    backButton: {
        marginTop: 50,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.accentPurple,
    },
    backText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
