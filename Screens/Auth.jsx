import {useState} from 'react';
import { View, Text, Button, TextInput, StyleSheet, Pressable } from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { colors } from '../colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function Auth ({ navigation }) {

const [authUsername, setAuthUsername] = useState('');
const [authPwd, setAuthPwd] = useState('');

return (
    <SafeAreaView style={StyleSheet.container}>
    <View style={styles.content}>
        <TextInput
            placeholder='username...'
            onChangeText={setAuthUsername}
            value={authUsername}
            style={styles.textInput}
        />
        
        <TextInput
            placeholder='password...'
            onChangeText={setAuthPwd}
            value={authPwd}
            style={styles.textInput}
        />

        <Pressable onPress={() => navigation.navigate('Home')}>
          <LinearGradient
            colors={colors.gradientSecondary}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Home</Text>
          </LinearGradient>
        </Pressable>
    </View>
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
    padding: 30, 
    margin: 30,
    borderWidth: 1,
    borderColor: 'black',
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