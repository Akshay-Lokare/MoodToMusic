import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAppColors from "../Helpers/useAppColors";

import Auth from "../Screens/Auth";
import Home from "../Screens/Home";
import Settings from "../Screens/Settings";
import MoodPlaylists from "../Screens/MoodPlaylists";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const colors = useAppColors();
  const isDark = useSelector((state) => state.theme.isDark);

  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.textPrimary,
        },
      }}
    >
      <Stack.Screen
        name="Auth"
        component={Auth}
        options={{ title: 'Auth' }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={({ navigation }) => ({
          title: 'Mood Music',
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('Auth')}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="log-out-outline" size={24} color={colors.accentRed} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="MoodPlaylists"
        component={MoodPlaylists}
        options={{ title: 'Mood Music' }}
      />
    </Stack.Navigator>
  );
}