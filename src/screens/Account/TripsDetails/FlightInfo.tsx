import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import SkyboundCard from "@components/ui/SkyboundCard";
import SkyboundScreen from "@components/ui/SkyboundScreen";
import SkyboundText from "@components/ui/SkyboundText";
import { useColors } from "@constants/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const FlightInfo = () => {
  const colors = useColors();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { trip } = route.params;

  // Extract legs from Firebase structure
  const legs = trip?.flights?.[0]?.legs || [];

  // Build layovers by taking all legs except final arrival
  const layovers = useMemo(() => {
    if (!legs || legs.length <= 1) return [];

    return legs.slice(0, -1).map((leg, index) => ({
      id: `${leg.to?.iata}-${index}`,
      airportName: leg.to?.name || "Unknown Airport",
      airportCode: leg.to?.iata || "???",
      duration: leg.duration ? `${leg.duration} min` : "N/A",
    }));
  }, [legs]);

  // Extract departure and arrival airport codes
  const departureIATA = legs?.[0]?.from?.iata || "???";
  const arrivalIATA = legs?.[legs.length - 1]?.to?.iata || "???";

  // Build traveler list (single traveler in this version)
  const travelers = trip.traveler
    ? [`${trip.traveler.firstName} ${trip.traveler.lastName}`]
    : [];

  function formatDateTime(value: string | Date | null) {
  if (!value) return "N/A";

  const date = typeof value === "string" ? new Date(value) : value;

  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTime(value: string | Date | null) {
  if (!value) return "N/A";

  const date = typeof value === "string" ? new Date(value) : value;

  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
  return (
    <SkyboundScreen
      title="Flight Information"
      subtitle="Review trip details"
      showLogo={false}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 32 }}>
        
        {/* --- Trip Overview Card --- */}
        <SkyboundCard>
          <SkyboundText variant="primaryBold" size={18}>
            {trip.route}
          </SkyboundText>

          <SkyboundText variant="secondary" size={14} style={{ marginTop: 4 }}>
            {trip.dateRange}
          </SkyboundText>

          <View style={styles.infoRow}>
            <SkyboundText variant="primary" size={14}>
              {trip.airline}
            </SkyboundText>
          </View>

          <View style={[styles.statusPill, { backgroundColor: "rgba(34,197,94,0.15)" }]}>
            <SkyboundText variant="primary" size={12} style={{ color: "#22C55E" }}>
              {trip.status}
            </SkyboundText>
          </View>
        </SkyboundCard>

        {/* --- Booking Details --- */}
        <SkyboundCard style={{ marginTop: 16 }}>
          <SkyboundText variant="primaryBold" size={17}>
            Booking Details
          </SkyboundText>

          <View style={styles.detailRow}>
            <SkyboundText variant="secondary" size={14}>Booking Reference</SkyboundText>
            <SkyboundText variant="primary" size={14}>{trip.id}</SkyboundText>
          </View>

          <View style={styles.detailRow}>
            <SkyboundText variant="secondary" size={14}>Airline</SkyboundText>
            <SkyboundText variant="primary" size={14}>
              {trip.airline}
            </SkyboundText>
          </View>

          <View style={styles.detailRow}>
            <SkyboundText variant="secondary" size={14}>Cabin Class</SkyboundText>
            <SkyboundText variant="primary" size={14}>
              {trip.cabinClass || "Economy"}
            </SkyboundText>
          </View>
        </SkyboundCard>

        {/* --- Travelers --- */}
        <SkyboundCard style={{ marginTop: 16 }}>
          <SkyboundText variant="primaryBold" size={17}>
            Travelers
          </SkyboundText>

          {travelers.map((traveler, i) => (
            <View key={i} style={styles.travelerRow}>
              <Ionicons name="person-circle-outline" size={20} color={colors.icon} />
              <SkyboundText variant="primary" size={14} style={{ marginLeft: 8 }}>
                {traveler}
              </SkyboundText>
            </View>
          ))}
        </SkyboundCard>

        {/* --- Schedule & Duration --- */}
        <SkyboundCard style={{ marginTop: 16 }}>
          <SkyboundText variant="primaryBold" size={17}>
            Schedule
          </SkyboundText>

          {/* Departure */}
          <View style={{ marginTop: 12 }}>
            <SkyboundText variant="primaryBold" size={16}>
              Departure: {formatDateTime(trip?.departureTime)}
            </SkyboundText>
          </View>

          {/* Vertical Line / Divider */}
          <View style={styles.timelineLine} />

          {/* Arrival */}
          <SkyboundText variant="primaryBold" size={16}>
              Arrival: {formatDateTime(trip?.arrivalTime)}
          </SkyboundText>

          <SkyboundText variant="secondary" size={12} style={{ marginTop: 6 }}>
            Total duration · {trip.flights?.[0]?.duration || "N/A"}
          </SkyboundText>
        </SkyboundCard>

        {/* --- Layovers --- */}
        {layovers.length > 0 && (
          <SkyboundCard style={{ marginTop: 16 }}>
            <SkyboundText variant="primaryBold" size={17}>
              Layovers
            </SkyboundText>

            {layovers.map((layover) => (
              <View key={layover.id} style={styles.layoverRow}>
                <View>
                  <SkyboundText variant="primary" size={15}>
                    {layover.airportName} ({layover.airportCode})
                  </SkyboundText>
                  <SkyboundText variant="secondary" size={13}>
                    {layover.duration}
                  </SkyboundText>
                </View>

                  
              </View>
            ))}
          </SkyboundCard>
        )}

        {/* Return button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.returnButton,
              { opacity: pressed ? 0.9 : 1, backgroundColor: "#6B7280" },
            ]}
          >
            <SkyboundText
              variant="primary"
              size={16}
              accessabilityLabel="Return to manage subscription"
              style={{ color: "white" }}
            >
              Back
            </SkyboundText>
            </Pressable>

      </ScrollView>
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    marginTop: 6,
  },
  statusPill: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  detailRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  travelerRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  timelineLine: {
    height: 24,
    width: 2,
    backgroundColor: "rgba(148,163,184,0.4)",
    marginVertical: 8,
    marginLeft: 4,
  },
  layoverRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  secondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "rgba(148,163,184,0.5)",
  },
   returnButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});

export default FlightInfo;
