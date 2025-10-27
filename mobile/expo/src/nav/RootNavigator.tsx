// mobile/expo/src/nav/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import "../firebase";

import AccountScreen from "../screens/AccountScreen";
import ComponentTestScreen from "../screens/ComponentTestScreen";
import DashboardScreen from "../screens/DashboardScreen";
import FlightResultsScreen from "../screens/FlightResultsScreen";
import FlightSearchScreen from "../screens/FlightSearchScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

// Login listener
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Flight } from "../../../../skyboundTypes/SkyboundAPI";
import { auth } from '..//firebase';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  ComponentTest: undefined;
  FlightSearch: undefined;
  Account: undefined;
  FlightResults: { searchResults: Flight[] };
};

const Stack = createNativeStackNavigator();
const NavContainer = NavigationContainer as unknown as React.ComponentType<React.PropsWithChildren<{}>>;

export default function RootNavigator(): React.JSX.Element 
{
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Dashboard'>('Login');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setInitialRoute(user ? 'Dashboard' : 'Login');
    });
    return () => unsub();
  }, []);
  
  return (
    <NavContainer>
      {/* @ts-ignore - suppress spurious type error on Stack.Navigator props */}
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name ="ComponentTest" component={ComponentTestScreen}/>
        <Stack.Screen name="FlightSearch"  component={FlightSearchScreen}/>
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="FlightResults" component={FlightResultsScreen} />
      </Stack.Navigator>
    </NavContainer>
  );
}