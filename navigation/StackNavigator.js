import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import useAppColors from "../Helpers/useAppColors";

import Auth from "../Screens/Auth";
import Home from "../Screens/Home";
import Settings from "../Screens/Settings";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const colors = useAppColors();
  const isDark = useSelector((state) => state.theme.isDark);

  return (
    <Stack.Navigator
      initialRouteName="Home"
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
        options={{ title: 'Mood Music 🎧' }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}