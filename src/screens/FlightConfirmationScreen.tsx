import SkyboundText from "@components/ui/SkyboundText";
import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const route = useRoute();

  const {
    selectedFlights = [],
    tripType,
    fromCode,
    toCode,
    departureDate,
    returnDate,
    legsCount,
    legsDates,
  } = (route.params as {
    selectedFlights?: UIFlight[];
    tripType?: "one-way" | "round-trip" | "multi-city";
    fromCode?: string;
    toCode?: string;
    departureDate?: Date | string | null;
    returnDate?: Date | string | null;
    legsCount?: number;
    legsDates?: (Date | string | null)[];
  }) || {};

  const flightsArray: UIFlight[] = Array.isArray(selectedFlights)
    ? selectedFlights
    : [];

  const outboundFlight = flightsArray[0];
  const returnFlight =
    tripType === "round-trip" && flightsArray.length > 1
      ? flightsArray[1]
      : undefined;

  const totalPrice = flightsArray.reduce(
    (sum, f) => sum + (f?.price || 0),
    0
  );

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
              <SkyboundText variant="primaryBold" size={16}>
                {flight.airline ?? "—"}
              </SkyboundText>
              <SkyboundText variant="secondary" size={14}>
                {flight.cabinClass ?? "—"}
              </SkyboundText>
            </View>
          </View>
          <SkyboundText
            variant="primary"
            size={16}
            style={{ fontWeight: "600", color: colors.link }}
          >
            {flight.airlineCode ?? "—"} {flight.id ?? ""}
          </SkyboundText>
        </View>

        <View style={styles.routeDisplay}>
          <View style={{ alignItems: "center" }}>
            <SkyboundText variant="primaryBold" size={24}>
              {flight.departureCode ?? "—"}
            </SkyboundText>
            <SkyboundText variant="secondary" size={14}>
              {flight.departureCode ?? "—"}
            </SkyboundText>
            <SkyboundText variant="secondary" size={14}>
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
            <SkyboundText variant="secondary" size={12}>
              {flight.duration ?? ""}
            </SkyboundText>
          </View>
          <View style={{ alignItems: "center" }}>
            <SkyboundText variant="primaryBold" size={24}>
              {flight.arrivalCode ?? "—"}
            </SkyboundText>
            <SkyboundText variant="secondary" size={14}>
              {flight.arrivalCode ?? "—"}
            </SkyboundText>
            <SkyboundText variant="secondary" size={14}>
              {flight.arrivalTime ?? ""}
            </SkyboundText>
          </View>
        </View>
      </View>
    );
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
            style={styles.successTitle}
          >
            Success!
          </SkyboundText>
          <SkyboundText
            variant="primary"
            size={18}
            style={styles.successSubtitle}
          >
            Your flight has been booked!
          </SkyboundText>
        </View>

        {/* Outbound / Return Flight Details */}
        {outboundFlight && renderFlightCard(outboundFlight, "Outbound Flight")}
        {returnFlight && renderFlightCard(returnFlight, "Return Flight")}

        {/* Total Price + Email notice */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.priceSection}>
            <SkyboundText variant="secondary" size={16}>
              Total Price
            </SkyboundText>
            <SkyboundText variant="primaryBold" size={30}>
              $
              {totalPrice?.toFixed
                ? totalPrice.toFixed(2)
                : totalPrice || "0.00"}
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
                style={{ color: colors.link }}
              >
                You will receive your flight ticket by email
              </SkyboundText>
            </View>
          </View>
        </View>

        {/* Add to Wallet */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SkyboundText
            variant="primaryBold"
            size={18}
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
              style={{ color: "#111827" }}
            >
              Add to Google Wallet
            </SkyboundText>
          </Pressable>

          <View style={styles.divider} />

          <SkyboundText
            variant="primary"
            size={16}
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
            variant="primaryBold"
            size={18}
            style={{ marginBottom: 16 }}
          >
            Quick Actions
          </SkyboundText>
          <Pressable style={styles.actionItem}>
            <View style={styles.actionContent}>
              <Ionicons name="airplane" size={20} color={colors.link} />
              <SkyboundText
                variant="primary"
                size={16}
                style={{ fontWeight: "500" }}
              >
                Check Flight Status
              </SkyboundText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>
          <Pressable style={styles.actionItem}>
            <View style={styles.actionContent}>
              <Ionicons name="headset" size={16} color={colors.link} />
              <SkyboundText
                variant="primary"
                size={16}
                style={{ fontWeight: "500" }}
              >
                Customer Support
              </SkyboundText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>
          <Pressable style={styles.actionItem}>
            <View style={styles.actionContent}>
              <Ionicons name="calendar" size={14} color={colors.link} />
              <SkyboundText
                variant="primary"
                size={16}
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

