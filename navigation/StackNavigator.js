import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Auth from "../Screens/Auth";
import Home from "../Screens/Home";
import Settings from "../Screens/Settings";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: 'center',
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