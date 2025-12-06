// mobile/expo/src/nav/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth } from "@src/firebase";
import * as React from "react";

import AirportPreference from "@/src/screens/Account/AirportPreference";
import BillingHistory from "@/src/screens/Account/BillingHistory";
import CurrencyScreen from "@/src/screens/Account/Currency";
import EditTraveler from "@/src/screens/Account/EditTraveler";
import ChatScreen from "@/src/screens/Account/GetHelp/ChatScreen";
import ContactScreen from "@/src/screens/Account/GetHelp/ContactScreen";
import FAQscreen from "@/src/screens/Account/GetHelp/FAQscreen";
import GetHelp from "@/src/screens/Account/GetHelp/GetHelp";
import LanguageModal from "@/src/screens/Account/Language";
import ManageSubscription from "@/src/screens/Account/ManageSubscription";
import PaymentDetails from "@/src/screens/Account/PaymentDetails";
import PaymentMethodScreen from "@/src/screens/Account/PaymentMethodScreen";
import TravelerDetails from "@/src/screens/Account/TravelerDetails";
import AirportInfo from "@/src/screens/Account/TripsDetails/AirportInfo";
import FlightInfo from "@/src/screens/Account/TripsDetails/FlightInfo";
import Trips from "@/src/screens/Account/TripsDetails/Trips";
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
import PaymentScreen from "@src/screens/PaymentScreen";
import SignupScreen from "@src/screens/SignupScreen";

// Login listener
import SkyboundNavBar from "@/components/ui/SkyboundNavBar";
import { Flight } from "@/skyboundTypes/SkyboundAPI";
import { createDrawerNavigator } from '@react-navigation/drawer';
import type { TravelerProfile } from '@src/types/travelers';
import type { TripCardData } from '@src/types/trips';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export type AuthSwitchNavigatorParamList = {
  App: undefined;
  ComponentTest: undefined;
  Login: undefined;
  Signup: undefined;
};

export type FlightStackParamList = {
  Dashboard: undefined;
  FilterScreen: { filters?: FlightFilters } | undefined;
  FlightConfirmation: { itinerary: ItineraryPayload };
  FlightResults: {
    flightsByLeg?: Flight[][];
    searchDetails?: SearchDetails;
    legIndex?: number;
    selections?: ItineraryPayload["flights"];
    filters?: FlightFilters;
  } | undefined;
  FlightSearch: {searchResults: Flight[]};
  FlightSummary: { itinerary: ItineraryPayload };
};

export type AccountStackParamList = {
  Account: undefined;
  AirportInfo: { airportCode?: string; airportName?: string } | undefined;
  AirportPreference: undefined;
  BillingHistory: undefined;
  Chat: undefined;
  Contact: undefined;
  Currency: undefined;
  EditTraveler: { traveler?: TravelerProfile } | undefined;
  FAQ: undefined;
  FlightInfo: { trip?: TripCardData } | undefined;
  GetHelp: undefined;
  Language: undefined;
  ManageSubscription: undefined;
  Payment: {
    selectedFlights?: any[];
    tripType?: string;
    fromCode?: string;
    toCode?: string;
    departureDate?: Date | string | null;
    returnDate?: Date | string | null;
  } | undefined;
  PaymentDetails: undefined;
  PaymentMethod: undefined;
  TravelerDetails: undefined;
  Trips: undefined;
};

const Drawer = createDrawerNavigator();
const AuthSwitchStack = createNativeStackNavigator<AuthSwitchNavigatorParamList>();
const FlightStack = createNativeStackNavigator<FlightStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();
const NavContainer = NavigationContainer as unknown as React.ComponentType<React.PropsWithChildren<{}>>;

// 1. PRIMARY APP STACK (Handles history and custom header for logged-in users)
function GenerateFlightStack() {
  return (
    <FlightStack.Navigator
      screenOptions={{
        header: (props) => (<SkyboundNavBar {...props}/>),
      }}
      initialRouteName="Dashboard"
    >
      <FlightStack.Screen name="ComponentTest" component={ComponentTestScreen}/>
      <FlightStack.Screen name="Dashboard" component={DashboardScreen} />
      <FlightStack.Screen name="FilterScreen" component={FilterScreen} options={{ presentation: 'modal' }} />
      <FlightStack.Screen name="FlightConfirmation" component={FlightConfirmationScreen} />
      <FlightStack.Screen name="FlightResults" component={FlightResultsScreen} />
      <FlightStack.Screen name="FlightSearch" component={FlightSearchScreen}/>
      <FlightStack.Screen name="FlightSummary" component={FlightSummaryScreen} />
      <FlightStack.Screen name="Payment" component={PaymentScreen} />
    </FlightStack.Navigator>
  );
}

function GenerateAccountStack() {
  return (
    <AccountStack.Navigator
      screenOptions={{
        header: (props) => (<SkyboundNavBar {...props}/>),
      }}
      initialRouteName="Account"
    >
      <AccountStack.Screen name="Account" component={AccountScreen} />
      <AccountStack.Screen name="AirportInfo" component={AirportInfo} />
      <AccountStack.Screen name="AirportPreference" component={AirportPreference} />
      <AccountStack.Screen name="BillingHistory" component={BillingHistory} />
      <AccountStack.Screen name="Chat" component={ChatScreen} />
      <AccountStack.Screen name="Contact" component={ContactScreen} />
      <AccountStack.Screen name="Currency" component={CurrencyScreen} />
      <AccountStack.Screen name="EditTraveler" component={EditTraveler} />
      <AccountStack.Screen name="FAQ" component={FAQscreen} />
      <AccountStack.Screen name="FlightInfo" component={FlightInfo} />
      <AccountStack.Screen name="GetHelp" component={GetHelp} />
      <AccountStack.Screen name="Language" component={LanguageModal} options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <AccountStack.Screen name="ManageSubscription" component={ManageSubscription} />
      <AccountStack.Screen name="PaymentDetails" component={PaymentDetails} />
      <AccountStack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <AccountStack.Screen name="TravelerDetails" component={TravelerDetails} />
      <AccountStack.Screen name="Trips" component={Trips} />
    </AccountStack.Navigator>
  );
}

// Drawer contains "Flights" and "My Account" flows
function GenerateDrawerRoot() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen
        name="Flights"
        component={GenerateFlightStack}
        options={{ title: 'Flights' }}
      />

      <Drawer.Screen
        name="Accounts"
        component={GenerateAccountStack}
        options={{ title: 'My Account' }}
      />
    </Drawer.Navigator>
  );
}

export default function RootNavigator(): React.JSX.Element
{
  const [initialRoute, setInitialRoute] = useState<'Login' | 'App' | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // Use 'App' to navigate to the DrawerRoot when authenticated
      setInitialRoute(user ? 'App' : 'Login');
    });
    return () => unsub();
  }, []);
 
  if (!initialRoute) return null;

  return (
    <NavContainer>
      <AuthSwitchStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute!}
      >
        <AuthSwitchStack.Screen name="Login" component={LoginScreen} />
        <AuthSwitchStack.Screen name="Signup" component={SignupScreen} />
        <AuthSwitchStack.Screen name="ComponentTest" component={ComponentTestScreen} />

        { /* Auth flow for the actual app (after auth) */}
        <AuthSwitchStack.Screen
          name="App"
          component={GenerateDrawerRoot}
          options={{ headerShown: false }}
        />
      </AuthSwitchStack.Navigator>
    </NavContainer>
  );
}
