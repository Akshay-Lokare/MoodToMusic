import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAppColors from "../Helpers/useAppColors";

import Auth from "../Screens/Auth";
import Home from "../Screens/Home";
import Settings from "../Screens/Settings";
import MoodPlaylists from "../Screens/MoodPlaylists";
import Easter from "../Screens/Easter";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const colors = useAppColors();

  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: "600",
          color: colors.textPrimary,
        },
      }}
    >
      <Stack.Screen
        name="Auth"
        component={Auth}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={({ navigation }) => ({
          title: "Mood Music",
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("Auth")}
              style={{ marginRight: 10 }}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={colors.accentRed}
              />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="MoodPlaylists"
        component={MoodPlaylists}
        options={{ title: "Mood Music" }}
      />
      <Stack.Screen
        name="Easter"
        component={Easter}
        options={{ title: "???" }}
      />
    </Stack.Navigator>
  );
}