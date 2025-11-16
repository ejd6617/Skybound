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
import { Flight } from "@/skyboundTypes/SkyboundAPI";
import type { TravelerProfile } from '@src/types/travelers';
import type { TripCardData } from '@src/types/trips';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export type RootStackParamList = {
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
        <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="FlightResults" component={FlightResultsScreen} />
        <Stack.Screen name="FlightSummary" component={FlightSummaryScreen} />
        <Stack.Screen name="FlightConfirmation" component={FlightConfirmationScreen} />
        <Stack.Screen name="FilterScreen" component={FilterScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="ManageSubscription" component={ManageSubscription} />
        <Stack.Screen name="BillingHistory" component={BillingHistory} />
        <Stack.Screen name="PaymentDetails" component={PaymentDetails} />
        <Stack.Screen name="TravelerDetails" component={TravelerDetails} />
        <Stack.Screen name="EditTraveler" component={EditTraveler} />
        <Stack.Screen name="Trips" component={Trips} />
        <Stack.Screen name="FlightInfo" component={FlightInfo} />
        <Stack.Screen name="AirportInfo" component={AirportInfo} />
        <Stack.Screen name="AirportPreference" component={AirportPreference} />
        <Stack.Screen name="Language" component={LanguageModal} options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="Currency" component={CurrencyScreen} />
        <Stack.Screen name="GetHelp" component={GetHelp} />
        <Stack.Screen name="FAQ" component={FAQscreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavContainer>
  );
}