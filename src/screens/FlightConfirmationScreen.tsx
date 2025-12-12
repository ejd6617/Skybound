import SkyboundText from "@components/ui/SkyboundText";
import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import type { ItineraryPayload } from "@src/screens/FlightResultsScreen";
import { LinearGradient } from "expo-linear-gradient";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { auth, db } from "../firebase";

// Match the UIFlight type used in FlightResultsScreen
interface UIFlight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineColor: string;
  category?: "best" | "cheapest" | "fastest";
  price: number;
  cabinClass: string;
  departureTime: string;
  arrivalTime: string;
  departureCode: string;
  arrivalCode: string;
  duration: string;
  stops: string;
  hasBaggage?: boolean;
}

export default function ConfirmationScreen() {
  const colors = useColors();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const route = useRoute();
  const { itinerary } = (route.params as { itinerary?: ItineraryPayload }) || {};

  const flightsArray: UIFlight[] = Array.isArray(itinerary?.flights)
    ? itinerary?.flights || []
    : [];
  const tripType = itinerary?.searchDetails?.tripType ?? "one-way";
  const traveler = itinerary?.traveler;
  const paymentMethodId = itinerary?.paymentMethodId;

  const travelers =
    itinerary?.travelers && itinerary.travelers.length > 0
      ? itinerary.travelers
      : traveler
      ? [traveler]
      : [];

  const outboundFlight = flightsArray[0];
  const returnFlight =
    tripType === "round-trip" && flightsArray.length > 1
      ? flightsArray[1]
      : undefined;

  const totalPrice =
    itinerary?.totalPrice ??
    flightsArray.reduce((sum, f) => sum + (f?.price || 0), 0);

  function sanitize(value: any): any {
    if (value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(sanitize);
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, sanitize(v)])
      );
    }
    return value;
  }

  // reference to see if this flight has been booked to prevent duplicate booking
  const hasSaved = useRef(false);

  useEffect(() => {
    if (!itinerary) return;
    if (hasSaved.current) return;
    hasSaved.current = true;

    async function saveTrip() {
      const user = auth.currentUser;
      if (!user) return;

      const tripId = Date.now().toString();

      try {
        // sanitize objects before saving to Firestore
        const safe = sanitize({
          totalPaid: itinerary.totalPrice,
          paymentMethodId: itinerary.paymentMethodId,
          traveler: itinerary.traveler,
          travelers: itinerary.travelers,
          flights: itinerary.flights,
          searchDetails: itinerary.searchDetails || null,
          departureDate: itinerary.searchDetails?.departureDate || null,
          returnDate: itinerary.searchDetails?.returnDate || null,
          status: "upcoming",
        });

        await setDoc(doc(db, "Users", user.uid, "trips", tripId), {
          createdAt: Timestamp.now(),
          ...safe,
        });

        console.log("Trip Saved to Firestore:", tripId);
      } catch (error) {
        console.log("Error saving trip:", error);
      }
    }

    saveTrip();
  }, [itinerary]);

  // Animation refs
  const scale = React.useRef(new Animated.Value(0.6)).current;
  const ring = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.65,
        friction: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale]);

  const renderFlightCard = (flight: UIFlight, label: string) => {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {/* Optional label: Outbound / Return */}
        <SkyboundText
          variant="secondary"
          size={14}
          accessabilityLabel={label}
          style={{ marginBottom: 8 }}
        >
          {label}
        </SkyboundText>

        <View style={styles.flightHeader}>
          <View style={styles.airlineSection}>
            <View style={styles.airlineIcon}>
              <Ionicons name="airplane" size={14} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <SkyboundText
                accessabilityLabel={"Airline" + flight.airline}
                variant="primaryBold"
                size={16}
              >
                {flight.airline ?? "—"}
              </SkyboundText>
              <SkyboundText
                variant="secondary"
                accessabilityLabel={"Cabin Class: " + flight.cabinClass}
                size={14}
              >
                {flight.cabinClass ?? "—"}
              </SkyboundText>
            </View>
          </View>
          <SkyboundText
            variant="primary"
            size={16}
            accessabilityLabel={"Airline Code: " + flight.airlineCode}
            style={{ fontWeight: "600", color: colors.link }}
          >
            {flight.airlineCode ?? "—"} {flight.id ?? ""}
          </SkyboundText>
        </View>

        <View style={styles.routeDisplay}>
          <View style={{ alignItems: "center" }}>
            <SkyboundText
              accessabilityLabel={"Departure Code" + flight.departureCode}
              variant="primaryBold"
              size={24}
            >
              {flight.departureCode ?? "—"}
            </SkyboundText>
            <SkyboundText
              variant="secondary"
              accessabilityLabel={"Departure Code " + flight.departureCode}
              size={14}
            >
              {flight.departureCode ?? "—"}
            </SkyboundText>
            <SkyboundText
              variant="secondary"
              accessabilityLabel={"Departure Time: " + flight.departureTime}
              size={14}
            >
              {flight.departureTime ?? ""}
            </SkyboundText>
          </View>
          <View style={styles.flightPath}>
            <View
              style={{ height: 2, width: 42, backgroundColor: "#E5E7EB" }}
            />
            <Ionicons name="airplane" size={16} color={colors.link} />
            <View
              style={{ height: 2, width: 43, backgroundColor: "#E5E7EB" }}
            />
            <SkyboundText
              variant="secondary"
              accessabilityLabel={"Flight Duration: " + flight.duration}
              size={12}
            >
              {flight.duration ?? ""}
            </SkyboundText>
          </View>
          <View style={{ alignItems: "center" }}>
            <SkyboundText
              variant="primaryBold"
              accessabilityLabel={"Arrival Code: " + flight.arrivalCode}
              size={24}
            >
              {flight.arrivalCode ?? "—"}
            </SkyboundText>
            <SkyboundText
              variant="secondary"
              accessabilityLabel={"Arrival Code: " + flight.arrivalCode}
              size={14}
            >
              {flight.arrivalCode ?? "—"}
            </SkyboundText>
            <SkyboundText
              variant="secondary"
              accessabilityLabel={"Arrival Time:" + flight.arrivalTime}
              size={14}
            >
              {flight.arrivalTime ?? ""}
            </SkyboundText>
          </View>
        </View>
      </View>
    );
  };

  const handleCustomerSupport = () => {
    (navigation as any).navigate("Accounts", {
      screen: "GetHelp",
    });
  };

  // idk why this is not working, please help!
  const handleCheckFlightStatus = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("Accounts", {
        screen: "FlightInfo",
        // later we can pass: params: { trip: buildTripFromItinerary(itinerary) }
      });
    } else {
      (navigation as any).navigate("Accounts", {
        screen: "FlightInfo",
      });
    }
  };

  const handleViewAllBookings = () => {
    (navigation as any).navigate("Accounts", {
      screen: "Trips",
    });
  };

  return (
    <LinearGradient
      colors={colors.gradient}
      start={colors.gradientStart}
      end={colors.gradientEnd}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Animated.View
            style={[styles.checkmarkCircle, { transform: [{ scale }] }]}
          >
            <Ionicons name="checkmark" size={40} color={colors.link} />
          </Animated.View>
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ring,
                transform: [
                  {
                    scale: ring.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 2.4],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          />

          <SkyboundText
            variant="primary"
            size={36}
            accessabilityLabel="Success!"
            style={styles.successTitle}
          >
            Success!
          </SkyboundText>
          <SkyboundText
            variant="primary"
            size={18}
            accessabilityLabel="Your Flight Has Been Booked!"
            style={styles.successSubtitle}
          >
            Your flight has been booked!
          </SkyboundText>
        </View>

        {/* Outbound / Return Flight Details */}
        {outboundFlight && renderFlightCard(outboundFlight, "Outbound Flight")}
        {returnFlight && renderFlightCard(returnFlight, "Return Flight")}

        {/* Total Price + Email notice + Travelers */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.priceSection}>
            <SkyboundText
              variant="secondary"
              size={16}
              accessabilityLabel="Total Price"
            >
              Total Price
            </SkyboundText>
            <SkyboundText
              variant="primaryBold"
              size={30}
              accessabilityLabel={totalPrice?.toString() ?? "0"}
            >
              $
              {totalPrice && typeof totalPrice === "number"
                ? totalPrice.toFixed(2)
                : "0.00"}
            </SkyboundText>
          </View>

          <View
            style={[
              styles.emailNotice,
              { backgroundColor: "#EFF6FF", paddingTop: 10 },
            ]}
          >
            <Ionicons name="mail" size={14} color={colors.link} />
            <View style={{ flex: 1 }}>
              <SkyboundText
                variant="primary"
                size={14}
                accessabilityLabel="You will recieve your flight ticked by email"
                style={{ color: colors.link }}
              >
                You will receive your flight ticket by email
              </SkyboundText>

              {/* ✅ Show ALL travelers in the reservation */}
              {travelers.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <SkyboundText
                    variant="secondary"
                    size={14}
                    style={{ marginBottom: 4 }}
                  >
                    Travelers
                  </SkyboundText>
                  {travelers.map((t: any, index: number) => (
                    <SkyboundText
                      key={t.id ?? `${t.firstName}-${t.lastName}-${index}`}
                      variant="primary"
                      size={14}
                      accessabilityLabel={`Traveler: ${t.firstName} ${t.lastName}`}
                    >
                      {t.firstName} {t.lastName}
                    </SkyboundText>
                  ))}
                </View>
              )}

              {paymentMethodId && (
                <SkyboundText
                  variant="secondary"
                  size={14}
                  style={{ marginTop: 8 }}
                  accessabilityLabel={"Payment Method ID: " + paymentMethodId}
                >
                  Payment method: {paymentMethodId}
                </SkyboundText>
              )}
            </View>
          </View>
        </View>

        {/* Add to Wallet */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SkyboundText
            variant="primaryBold"
            size={18}
            accessabilityLabel={"Add To wallet"}
            style={{ marginBottom: 16 }}
          >
            Add to Wallet
          </SkyboundText>
          <Pressable style={[styles.walletBtn, { backgroundColor: "#000" }]}>
            <Ionicons
              name="logo-apple"
              size={20}
              color="#FFF"
              style={{ marginRight: 12 }}
            />
            <SkyboundText
              variant="primary"
              size={16}
              accessabilityLabel="Add to apple wallet"
              style={{ color: "#FFF" }}
            >
              Add to Apple Wallet
            </SkyboundText>
          </Pressable>
          <Pressable
            style={[
              styles.walletBtn,
              { backgroundColor: "#F3F4F6", marginTop: 12 },
            ]}
          >
            <Ionicons
              name="logo-google"
              size={19}
              color="#000000ff"
              style={{ marginRight: 12 }}
            />
            <SkyboundText
              variant="primary"
              size={16}
              accessabilityLabel="Add to google wallet"
              style={{ color: "#111827" }}
            >
              Add to Google Wallet
            </SkyboundText>
          </Pressable>

          <View style={styles.divider} />

          <SkyboundText
            variant="primary"
            size={16}
            accessabilityLabel="Share Itinearary"
            style={{ fontWeight: "500", marginBottom: 12 }}
          >
            Share Itinerary
          </SkyboundText>
          <View style={styles.shareButtons}>
            <Pressable
              style={[styles.shareBtn, { backgroundColor: "#22C55E" }]}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
            </Pressable>
            <Pressable
              style={[styles.shareBtn, { backgroundColor: "#3B82F6" }]}
            >
              <Ionicons name="mail" size={18} color="#FFF" />
            </Pressable>
            <Pressable
              style={[styles.shareBtn, { backgroundColor: "#4B5563" }]}
            >
              <Ionicons name="share-outline" size={18} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SkyboundText
            accessabilityLabel="Quick actions"
            variant="primaryBold"
            size={18}
            style={{ marginBottom: 16 }}
          >
            Quick Actions
          </SkyboundText>

          {/* Check Flight Status */}
          <Pressable style={styles.actionItem} onPress={handleCheckFlightStatus}>
            <View style={styles.actionContent}>
              <Ionicons name="airplane" size={20} color={colors.link} />
              <SkyboundText
                variant="primary"
                size={16}
                accessabilityLabel="Check Flight Status"
                style={{ fontWeight: "500" }}
              >
                Check Flight Status
              </SkyboundText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>

          {/* Customer Support */}
          <Pressable style={styles.actionItem} onPress={handleCustomerSupport}>
            <View style={styles.actionContent}>
              <Ionicons name="headset" size={16} color={colors.link} />
              <SkyboundText
                variant="primary"
                size={16}
                accessabilityLabel="Customer Support"
                style={{ fontWeight: "500" }}
              >
                Customer Support
              </SkyboundText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>

          {/* View All Bookings */}
          <Pressable style={styles.actionItem} onPress={handleViewAllBookings}>
            <View style={styles.actionContent}>
              <Ionicons name="calendar" size={14} color={colors.link} />
              <SkyboundText
                variant="primary"
                size={16}
                accessabilityLabel="View all bookings"
                style={{ fontWeight: "500" }}
              >
                View All Bookings
              </SkyboundText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Continue Exploring Button */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Pressable
            style={[styles.exploreBtn, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <SkyboundText
              variant="primary"
              size={18}
              accessabilityLabel="Contineue exploring"
              style={{ fontWeight: "600", color: colors.link }}
            >
              Continue Exploring
            </SkyboundText>
          </Pressable>
        </View>

        {/* Skybound Logo */}
        <View style={[styles.logoContainer, { paddingTop: 15 }]}>
          <Image
            source={require("@assets/images/skybound-logo-white.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  successHeader: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    zIndex: 2,
  },
  successTitle: {
    color: "#FFF",
    fontWeight: "700",
    marginBottom: 8,
  },
  successSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  ring: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: "rgba(255,255,255,0.25)",
    alignSelf: "center",
    top: 24,
    zIndex: 0,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 3,
  },
  flightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  airlineSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  airlineIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0071E2",
    justifyContent: "center",
    alignItems: "center",
  },
  routeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  flightPath: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginBottom: 12,
  },
  emailNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: 8,
  },
  walletBtn: {
    height: 60,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 17,
  },
  shareButtons: {
    flexDirection: "row",
    gap: 12,
  },
  shareBtn: {
    width: 93,
    height: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exploreBtn: {
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 16,
    paddingBottom: 20,
  },
  logo: {
    width: 150,
    height: 38,
  },
});
