import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, RefreshControl, StyleSheet, View } from "react-native";
import SkyboundFlashDeal from "@/components/ui/SkyboundFlashDeal";
import { useColors } from "@/constants/theme";
import { reviveDates, skyboundRequest } from "@/src/api/SkyboundUtils";
import { Flight, FlightLeg, OneWayQueryParams } from "@/skyboundTypes/SkyboundAPI";
import type { UIFlight } from "@/src/screens/FlightResultsScreen";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import SkyboundText from "@/components/ui/SkyboundText";
import LoadingScreen from "@/src/screens/LoadingScreen";

const normalizeDateValue = (value?: Date | string | null) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
};

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hoursString = hours > 0 ? `${hours}h` : "";
  const minutesString = minutes > 0 ? `${minutes}m` : "";
  return [hoursString, minutesString].join(" ").trim();
}

function formatStops(legs: FlightLeg[]): string {
  const stopCount = Math.max(legs.length - 1, 0);
  if (stopCount === 0) return "Non-stop";
  if (stopCount === 1) return `${stopCount} stop ${legs[0]?.to.iata ?? ""}`.trim();
  return `${stopCount} stops`;
}

function mapFlightToUIFlight(flight: Flight, index: number): UIFlight {
  const outboundLength = flight.outbound.length;
  const firstOutbound = flight.outbound[0];
  const lastOutbound = flight.outbound[outboundLength - 1];
  const totalDuration = flight.outbound.reduce((sum, leg) => sum + leg.duration, 0);

  return {
    id: (index + 1).toString(),
    airline: flight.airline.name,
    airlineCode: flight.airline.iata,
    airlineColor: "#1E40AF",
    price: flight.price,
    cabinClass: flight.class,
    departureTime: new Date(firstOutbound.departureTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    arrivalTime: new Date(lastOutbound.arrivalTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    departureCode: firstOutbound.from.iata,
    arrivalCode: lastOutbound.to.iata,
    duration: formatDuration(totalDuration),
    stops: formatStops(flight.outbound),
    hasBaggage: true,
    legs: flight.outbound,
  };
}

export default function FlashDealsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "FlashDeals">>();
  const colors = useColors();
  const [flashDeals, setFlashDeals] = useState<Flight[]>([]);
  const [uiDeals, setUiDeals] = useState<UIFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const seededDeals = route.params?.deals ?? [];

  const fetchDeals = useCallback(async () => {
    try {
      const params: OneWayQueryParams = {
        originAirportIATA: "JFK",
        destinationAirportIATA: "LAX",
        flexibleAirports: ["BUF", "PIT", "CLE"],
        flexibleDates: false,
        date: new Date("2026-02-10"),
      };
      const responseData = await skyboundRequest("searchFlightsOneWay", params);
      const revivedData: Flight[] = reviveDates(responseData);
      const sortedDeals = [...revivedData].sort((a, b) => a.price - b.price);
      setFlashDeals(sortedDeals);
      setUiDeals(sortedDeals.map(mapFlightToUIFlight));
    } catch (err) {
      console.error('Failed to fetch flash deals', err);
      setFlashDeals([]);
      setUiDeals([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const hydrateDeals = async () => {
      if (seededDeals.length > 0) {
        const sortedSeededDeals = [...seededDeals].sort((a, b) => a.price - b.price);
        setFlashDeals(sortedSeededDeals);
        setUiDeals(sortedSeededDeals.map(mapFlightToUIFlight));
        setLoading(false);
        return;
      }

      setLoading(true);
      await fetchDeals();
      if (isMounted) {
        setLoading(false);
      }
    };

    hydrateDeals();
    return () => {
      isMounted = false;
    };
  }, [fetchDeals, seededDeals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeals();
    setRefreshing(false);
  };

  const handleSelectDeal = (uiFlight: UIFlight, rawFlight: Flight) => {
    const itinerary = {
      flights: [uiFlight],
      searchDetails: {
        tripType: "one-way",
        fromCode: rawFlight.outbound[0]?.from.iata,
        toCode: rawFlight.outbound[rawFlight.outbound.length - 1]?.to.iata,
        departureDate: normalizeDateValue(rawFlight.outbound[0]?.departureTime),
        legsCount: 1,
        legsDates: [normalizeDateValue(rawFlight.outbound[0]?.departureTime)],
      },
    };
    navigation.navigate("FlightSummary", { itinerary });
  };

  return (
    <View style={{ flex: 1, paddingVertical: 12 }}>
      {loading ? (
        <LoadingScreen message="Loading flash deals..." />
      ) : (
        <FlatList
          data={flashDeals}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyExtractor={(flight, index) => `${flight.airline.iata}-${flight.price}-${index}`}
          renderItem={({ item, index }) => {
            const uiFlight = uiDeals[index] ?? mapFlightToUIFlight(item, index);
            return (
              <SkyboundFlashDeal
                airlineName={item.airline.name}
                sourceCode={item.outbound[0].from.iata}
                destCode={item.outbound[item.outbound.length - 1].to.iata}
                departureTime={item.outbound[0].departureTime.toISOString().split('T')[0]}
                arrivalTime={item.outbound[item.outbound.length - 1].arrivalTime.toISOString().split('T')[0]}
                travelTime={formatDuration(item.outbound.reduce((sum, leg) => sum + leg.duration, 0))}
                originalPrice=""
                newPrice={`$${item.price}`}
                onPress={() => handleSelectDeal(uiFlight, item)}
                airlineImage={
                  <Image
                    source={require('@assets/images/Notification Photo.png')}
                    style={{ width: 24, height: 24, marginRight: 6 }}
                  />
                }
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={() => (
            <View style={styles.centered}>
              <SkyboundText variant="secondary">No deals available right now.</SkyboundText>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
