// mobile/expo/src/nav/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth } from "@src/firebase";
import * as React from "react";

import AccountScreen from "@src/screens/AccountScreen";
import ComponentTestScreen from "@src/screens/ComponentTestScreen";
import DashboardScreen from "@src/screens/DashboardScreen";
import FilterScreen from "@src/screens/FilterScreen";
import FlightConfirmationScreen from "@src/screens/FlightConfirmationScreen";
import FlightResultsScreen, {
  FlightFilters,
  ItineraryPayload,
  SearchDetails,
} from "@src/screens/FlightResultsScreen";
import FlightSearchScreen from "@src/screens/FlightSearchScreen";
import FlightSummaryScreen from "@src/screens/FlightSummaryScreen";
import LoginScreen from "@src/screens/LoginScreen";
import SignupScreen from "@src/screens/SignupScreen";

// Login listener
import { Flight } from "@/skyboundTypes/SkyboundAPI";
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  ComponentTest: undefined;
  FlightSearch: {searchResults: Flight[]};
  Account: undefined;
    FlightResults: {
    flightsByLeg?: Flight[][];
    searchDetails?: SearchDetails;
    legIndex?: number;
    selections?: ItineraryPayload["flights"];
    filters?: FlightFilters;
  } | undefined;
  FlightSummary: { itinerary: ItineraryPayload };
  FlightConfirmation: { itinerary: ItineraryPayload };
  FilterScreen: { filters?: FlightFilters } | undefined;
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
        <Stack.Screen name="FlightSummary" component={FlightSummaryScreen} />
        <Stack.Screen name="FlightConfirmation" component={FlightConfirmationScreen} />
        <Stack.Screen name="FilterScreen" component={FilterScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavContainer>
  );
}