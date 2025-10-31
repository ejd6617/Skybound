// mobile/expo/src/nav/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth } from "@src/firebase";
import * as React from "react";

import AccountScreen from "../screens/AccountScreen";
import ComponentTestScreen from "../screens/ComponentTestScreen";
import DashboardScreen from "../screens/DashboardScreen";
import FilterScreen from "../screens/FilterScreen";
import FlightResultsScreen from "../screens/FlightResultsScreen";
import FlightSearchScreen from "../screens/FlightSearchScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

// Login listener
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  ComponentTest: undefined;
  FlightSearch: undefined;
  Account: undefined;
  FlightResults: {
    from?: string;
    to?: string;
    fromCity?: string;
    toCity?: string;
    tripType?: 'one-way' | 'round-trip' | 'multi-city' | 'return';
    outboundFlight?: any;
  } | undefined;
  FilterScreen: undefined;
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
        <Stack.Screen name="FilterScreen" component={FilterScreen} options={{presentation: 'modal'}} />
      </Stack.Navigator>
    </NavContainer>
  );
}