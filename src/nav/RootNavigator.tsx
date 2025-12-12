// mobile/expo/src/nav/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { auth } from "@src/firebase";
import * as React from "react";

import AirportPreference from "@/src/screens/Account/AirportPreference";
import BillingHistory from "@/src/screens/Account/BillingHistory";
import ChoosePaymentMethod from "@/src/screens/Account/ChoosePaymentMethod";
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
import FlashDealsScreen from "@src/screens/FlashDealsScreen";
import FlightConfirmationScreen from "@src/screens/FlightConfirmationScreen";
import FlightResultsScreen, {
  FlightFilters,
  ItineraryPayload,
  PlannedLeg,
  SearchDetails,
  UIFlight,
} from "@src/screens/FlightResultsScreen";
import FlightSearchScreen from "@src/screens/FlightSearchScreen";
import FlightSummaryScreen from "@src/screens/FlightSummaryScreen";
import LoadingScreen from "@src/screens/LoadingScreen";
import LoginScreen from "@src/screens/LoginScreen";
import NotificationsScreen from "@src/screens/NotificationsScreen";
import PaymentScreen from "@src/screens/PaymentScreen";
import SignupScreen from "@src/screens/SignupScreen";

// Login listener
import SkyboundNavBar from "@/components/ui/SkyboundNavBar";
import { useColors } from "@/constants/theme";
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
  FlashDeals: { deals?: Flight[] } | undefined;
  FilterScreen: { filters?: FlightFilters; availableFlights?: UIFlight[] } | undefined;
  FlightConfirmation: { itinerary: ItineraryPayload };
  FlightResults: {
    flightsByLeg?: Flight[][];
    searchDetails?: SearchDetails;
    tripType?: SearchDetails['tripType'];
    fromCode?: string;
    toCode?: string;
    departureDate?: Date | string | null;
    returnDate?: Date | string | null;
    legsCount?: number;
    legsDates?: (Date | string | null)[];
    passengerCount?: number;
    legIndex?: number;
    selections?: ItineraryPayload["flights"];
    filters?: FlightFilters;
    searchLegs?: PlannedLeg[];
    silentTransition?: boolean;
    availableFlights?: UIFlight[];
    queryContext?: {
      flexibleAirports?: string[];
      flexibleDates?: boolean;
      travelers?: any[];
      currencyCode?: string;
    };
  } | undefined;
  FlightSearch: {searchResults?: Flight[]; prefillDestinationCode?: string} | undefined;
  FlightSummary: { itinerary: ItineraryPayload };

  Payment: {
    itinerary: ItineraryPayload;
    selectedFlights?: any[];
    tripType?: string;
    fromCode?: string;
    toCode?: string;
    departureDate?: Date | string | null;
    returnDate?: Date | string | null;
  } | undefined;
  PaymentMethod: undefined;
  EditTraveler: { traveler?: TravelerProfile; returnToBooking?: boolean; itinerary?: ItineraryPayload } | undefined;
  TravelerDetails: { returnToBooking?: boolean; itinerary?: ItineraryPayload } | undefined;
};

export type AccountStackParamList = {
  Account: undefined;
  AirportInfo: { airportCode?: string; airportName?: string } | undefined;
  AirportPreference: undefined;
  BillingHistory: undefined;
  Chat: undefined;
  Contact: undefined;
  Currency: undefined;
  EditTraveler: { traveler?: TravelerProfile; returnToBooking?: boolean; itinerary?: ItineraryPayload } | undefined;
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
  TravelerDetails: { returnToBooking?: boolean; itinerary?: ItineraryPayload } | undefined;
  Trips: undefined;
  ChoosePaymentMethod: { onSelect: (paymentId: string) => void } | undefined;
};

export type NotificationStackParamList = {
  Notifications: undefined;
};

const accountHeaderOptions = (title: string, useBackNavigation = true) =>
  GenerateSkyboundHeaderOptions(title, {
    useBackNavigation,
    showNotifications: false,
    showUserProfile: false,
  });


const Drawer = createDrawerNavigator();
const AuthSwitchStack = createNativeStackNavigator<AuthSwitchNavigatorParamList>();
const FlightStack = createNativeStackNavigator<FlightStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();
const NotificationStack = createNativeStackNavigator<NotificationStackParamList>();
const NavContainer = NavigationContainer as unknown as React.ComponentType<React.PropsWithChildren<{}>>;


export function GenerateSkyboundHeaderOptions(title: string, customHeaderProps = {}) {
  return {
    title: title,
    header: (props) => (
      <SkyboundNavBar
        {...props}
        {...customHeaderProps}
      />
    ),
  };
};

// Stack for flight searching, details, etc.
function GenerateFlightStack() {
  const flightSearchHeaderOptions = {useBackNavigation: true, showNotifications: false, showUserProfile: false}
  return (
    <FlightStack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ gestureEnabled: true }}
    >
      <FlightStack.Screen name="ComponentTest" component={ComponentTestScreen} options={
        GenerateSkyboundHeaderOptions("Component Test", { ...flightSearchHeaderOptions})
      } />
      <FlightStack.Screen name="Dashboard" component={DashboardScreen} options={
        GenerateSkyboundHeaderOptions("Dashboard", { showLogo: true })
      } />
      <FlightStack.Screen name="FlashDeals" component={FlashDealsScreen} options={
        GenerateSkyboundHeaderOptions("Flash Deals", { useBackNavigation: true })
      } />
      <FlightStack.Screen name="FilterScreen" component={FilterScreen} options={{
        presentation: 'modal',
        headerShown: false,
      }} />
      <FlightStack.Screen name="FlightConfirmation" component={FlightConfirmationScreen} options={
        GenerateSkyboundHeaderOptions("Flight Confirmation", { ...flightSearchHeaderOptions})
      } />
      <FlightStack.Screen name="FlightResults" component={FlightResultsScreen} options={
        GenerateSkyboundHeaderOptions("Flight Results", { showFilter: true, ...flightSearchHeaderOptions})
      } />
      <FlightStack.Screen name="FlightSearch" component={FlightSearchScreen} options={
        GenerateSkyboundHeaderOptions("Flight Search")
      } />
      <FlightStack.Screen name="FlightSummary" component={FlightSummaryScreen} options={
        GenerateSkyboundHeaderOptions("Flight Summary", { showShare: true, ...flightSearchHeaderOptions})
      } />
      <FlightStack.Screen name="Payment" component={PaymentScreen} options={
        GenerateSkyboundHeaderOptions("Payment", { ...flightSearchHeaderOptions})
      } />
      <FlightStack.Screen name="PaymentMethod" component={PaymentMethodScreen} options={
        accountHeaderOptions("Payment Methods")
      } />
      <FlightStack.Screen
        name="EditTraveler"
        component={EditTraveler}
        options={({ route }) =>
          accountHeaderOptions(route.params?.traveler ? "Edit Traveler" : "Add Traveler")
        }
      />
      <FlightStack.Screen name="TravelerDetails" component={TravelerDetails} options={
        accountHeaderOptions("Traveler Details")
      } />

    </FlightStack.Navigator>
  );
}

// Stack for account details
function GenerateAccountStack() {
  return (
    <AccountStack.Navigator
      initialRouteName="Account"
      screenOptions={{ gestureEnabled: true }}
    >
      <AccountStack.Screen name="Account" component={AccountScreen} options={
        accountHeaderOptions("Account", false)
      } />
      <AccountStack.Screen name="AirportInfo" component={AirportInfo} options={
        accountHeaderOptions("Airport Info")
      } />
      <AccountStack.Screen name="AirportPreference" component={AirportPreference} options={
        accountHeaderOptions("Airport Preference")
      } />
      <AccountStack.Screen name="BillingHistory" component={BillingHistory} options={
        accountHeaderOptions("Billing History")
      } />
      <AccountStack.Screen name="Chat" component={ChatScreen} options={
        accountHeaderOptions("Chat")
      } />
      <AccountStack.Screen name="Contact" component={ContactScreen} options={
        accountHeaderOptions("Contact")
      } />
      <AccountStack.Screen name="Currency" component={CurrencyScreen} options={
        accountHeaderOptions("Currency")
      } />
      <AccountStack.Screen
        name="EditTraveler"
        component={EditTraveler}
        options={({ route }) =>
          accountHeaderOptions(route.params?.traveler ? "Edit Traveler" : "Add Traveler")
        }
      />
      <AccountStack.Screen name="FAQ" component={FAQscreen} options={
        accountHeaderOptions("FAQ")
      } />
      <AccountStack.Screen name="FlightInfo" component={FlightInfo} options={
        accountHeaderOptions("Flight Info")
      } />
      <AccountStack.Screen name="GetHelp" component={GetHelp} options={
        accountHeaderOptions("Get Help")
      } />
      <AccountStack.Screen name="Language" component={LanguageModal} options={
        { presentation: 'transparentModal', animation: 'fade', ...accountHeaderOptions("Change Language") }
      }  />
      <AccountStack.Screen name="ManageSubscription" component={ManageSubscription} options={
        accountHeaderOptions("Manage Subscription")
      } />
      <AccountStack.Screen name="PaymentDetails" component={PaymentDetails} options={
        accountHeaderOptions("Payment Details")
      } />
      <AccountStack.Screen name="PaymentMethod" component={PaymentMethodScreen} options={
        accountHeaderOptions("Payment Methods")
      } />
      <AccountStack.Screen name="TravelerDetails" component={TravelerDetails} options={
        accountHeaderOptions("Traveler Details")
      } />
      <AccountStack.Screen name="Trips" component={Trips} options={
        accountHeaderOptions("Trips")
      } />
      <AccountStack.Screen name="ChoosePaymentMethod" component={ChoosePaymentMethod} options={
        accountHeaderOptions("Select Payment Method")
      } />
    </AccountStack.Navigator>
  );
}

function GenerateNotificationStack() {
  return (
    <NotificationStack.Navigator
      initialRouteName="Notifications"
    >
      <NotificationStack.Screen name="Notifications" component={NotificationsScreen} options={
        GenerateSkyboundHeaderOptions("Notifications")
      } />
    </NotificationStack.Navigator>
  )
}

// Drawer contains "Flights" and "My Account" flows
function GenerateDrawerRoot() {
  const colors = useColors();
  const isDark = colors.background !== "#FFFFFF";
  return (
    <Drawer.Navigator screenOptions={{
      headerShown: false,
      swipeEnabled: true,

      drawerStyle: {
        backgroundColor: colors.card
      },

      drawerLabelStyle: {
        fontFamily: 'Regular',
        fontSize: 15,
        color: '#0071E2',
        marginLeft: -4,
      },
    }}>
      <Drawer.Screen
        name="Home"
        component={GenerateFlightStack}
        options={{ title: 'Home' }}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.navigate('Home', { screen: 'Dashboard' });
          },
        })}
      />

      <Drawer.Screen
        name="Accounts"
        component={GenerateAccountStack}
        options={{
          title: 'My Account',
          unmountOnBlur: true,
        }}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.navigate('Accounts', { screen: 'Account' });
            navigation.closeDrawer();
          },
        })}
      />

      <Drawer.Screen
        name="Notifications"
        component={GenerateNotificationStack}
        options={{ title: 'Notifications' }}
      />

    </Drawer.Navigator>
  );
}

// The overall navigation structure of the project
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

  if (!initialRoute) return <LoadingScreen message="Loading Skybound..." />;

  return (
    <NavContainer>
      <AuthSwitchStack.Navigator
        screenOptions={{ headerShown: false, gestureEnabled: false }}
        initialRouteName={initialRoute!}
      >
        { /* Screens that are only accessible in the flow when a user has not yet logged in */ }
        <AuthSwitchStack.Screen name="Login" component={LoginScreen} />
        <AuthSwitchStack.Screen name="Signup" component={SignupScreen} />
        <AuthSwitchStack.Screen name="ComponentTest" component={ComponentTestScreen} />

        { /* Auth flow for the actual app (after the user has been authenticated) */}
        <AuthSwitchStack.Screen
          name="App"
          component={GenerateDrawerRoot}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </AuthSwitchStack.Navigator>
    </NavContainer>
  );
}
