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
  Login: undefined;
  Signup: undefined;
  // The authenticated flow is one component: the DrawerRoot
  App: undefined; 
};

export type AppStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  ComponentTest: undefined;
  FlightSearch: {searchResults: Flight[]};
  Account: undefined;
  PaymentMethod: undefined;
  Payment: {
    selectedFlights?: any[];
    tripType?: string;
    fromCode?: string;
    toCode?: string;
    departureDate?: Date | string | null;
    returnDate?: Date | string | null;
  } | undefined;
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
  ManageSubscription: undefined;
  BillingHistory: undefined;
  PaymentDetails: undefined;
  TravelerDetails: undefined;
  EditTraveler: { traveler?: TravelerProfile } | undefined;
  Trips: undefined;
  FlightInfo: { trip?: TripCardData } | undefined;
  AirportInfo: { airportCode?: string; airportName?: string } | undefined;
  AirportPreference: undefined;
  Language: undefined;
  Currency: undefined;
  GetHelp: undefined;
  FAQ: undefined;
  Contact: undefined;
  Chat: undefined;
};

const Drawer = createDrawerNavigator();
const AuthSwitchStack = createNativeStackNavigator<AuthSwitchNavigatorParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const NavContainer = NavigationContainer as unknown as React.ComponentType<React.PropsWithChildren<{}>>;

// 1. PRIMARY APP STACK (Handles history and custom header for logged-in users)
function GenerateAppStack() {
  return (
    <AppStack.Navigator
      // Apply the custom header to ALL screens within this stack
      screenOptions={{
        header: (props) => (<SkyboundNavBar {...props}/>),
      }}
      // Set the initial route for the authenticated flow
      initialRouteName="Dashboard" 
    >
      {/* All authenticated screens are moved here. 
        They get stack history (push/pop) and the custom header.
      */}
      <AppStack.Screen name="Dashboard" component={DashboardScreen} />
      <AppStack.Screen name="Account" component={AccountScreen} />
      <AppStack.Screen name="ComponentTest" component={ComponentTestScreen}/>
      <AppStack.Screen name="FlightSearch" component={FlightSearchScreen}/>
      <AppStack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <AppStack.Screen name="Payment" component={PaymentScreen} />
      <AppStack.Screen name="FlightResults" component={FlightResultsScreen} />
      <AppStack.Screen name="FlightSummary" component={FlightSummaryScreen} />
      <AppStack.Screen name="FlightConfirmation" component={FlightConfirmationScreen} />
      <AppStack.Screen name="FilterScreen" component={FilterScreen} options={{ presentation: 'modal' }} />
      <AppStack.Screen name="ManageSubscription" component={ManageSubscription} />
      <AppStack.Screen name="BillingHistory" component={BillingHistory} />
      <AppStack.Screen name="PaymentDetails" component={PaymentDetails} />
      <AppStack.Screen name="TravelerDetails" component={TravelerDetails} />
      <AppStack.Screen name="EditTraveler" component={EditTraveler} />
      <AppStack.Screen name="Trips" component={Trips} />
      <AppStack.Screen name="FlightInfo" component={FlightInfo} />
      <AppStack.Screen name="AirportInfo" component={AirportInfo} />
      <AppStack.Screen name="AirportPreference" component={AirportPreference} />
      <AppStack.Screen name="Language" component={LanguageModal} options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <AppStack.Screen name="Currency" component={CurrencyScreen} />
      <AppStack.Screen name="GetHelp" component={GetHelp} />
      <AppStack.Screen name="FAQ" component={FAQscreen} />
      <AppStack.Screen name="Contact" component={ContactScreen} />
      <AppStack.Screen name="Chat" component={ChatScreen} />
    </AppStack.Navigator>
  );
}


// 2. DRAWER ROOT (Handles the side menu layout for the entire app)
function GenerateDrawerRoot() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen 
        name="Dashboard" 
        component={GenerateAppStack} 
        options={{ title: 'Dashboard' }} 
      />
    </Drawer.Navigator>
  );
}


// 3. ROOT NAVIGATOR (Handles the Authentication Switch)
export default function RootNavigator(): React.JSX.Element 
{
// The initial route must be one of the screens defined in AuthSwitchNavigatorParamList
  const [initialRoute, setInitialRoute] = useState<'Login' | 'App' | null>(null); // Use null for initial check

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // Use 'App' to navigate to the DrawerRoot when authenticated
      setInitialRoute(user ? 'App' : 'Login'); 
    });
    return () => unsub();
  }, []);
  
  // Conditionally render the NavigationContainer only when initialRoute is determined
  if (!initialRoute) return null;

  return (
    <NavContainer>
      {/* Use the new AuthSwitchStack here */}
      <AuthSwitchStack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute!} // The 'if (!initialRoute) return null' guard makes this safe
      >
        {/* Auth Screens */}
        <AuthSwitchStack.Screen name="Login" component={LoginScreen} />
        <AuthSwitchStack.Screen name="Signup" component={SignupScreen} />

        {/* The entire authenticated app is now one single Drawer component */}
        <AuthSwitchStack.Screen 
          name="App" 
          component={GenerateDrawerRoot} 
          options={{ headerShown: false }} 
        />
      </AuthSwitchStack.Navigator>
    </NavContainer>
  );
}
