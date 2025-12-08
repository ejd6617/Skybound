// screens/DashboardScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, useColorScheme, View } from "react-native";

import DisplayMap from "@/components/ui/DisplayMap";
import { Flight, OneWayQueryParams } from "@/skyboundTypes/SkyboundAPI";
import SkyboundFlashDeal from "@components/ui/SkyboundFlashDeal";
import SkyboundItemHolder from "@components/ui/SkyboundItemHolder";
import SkyboundText from "@components/ui/SkyboundText";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { reviveDates, skyboundRequest } from "@src/api/SkyboundUtils";
import { auth, db } from "@src/firebase";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import type { UIFlight } from "@src/screens/FlightResultsScreen";
import LoadingScreen from "@src/screens/LoadingScreen";
import { doc, getDoc } from "firebase/firestore";

const DESTINATION_IMAGES: Record<string, string> = {
  PAR: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  TYO: "https://images.unsplash.com/photo-1505063961471-9c06326bff6c?auto=format&fit=crop&w=900&q=80",
  LON: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  ROM: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=900&q=80",
};

const DEFAULT_DESTINATION_IMAGE =
  "https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=900&q=80";

export default function DashboardScreen() {
  const [data, setData] = useState<Flight[]>([]);
  const [allDeals, setAllDeals] = useState<Flight[]>([]);
  const [bootstrapping, setBootstrapping] = useState(true); // Is showing the full-screen loader
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Is refreshing data (default false)
  const [focusedFlight, setFocusedFlight] = useState(null); //keeping track which flash deal is in focus
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);

  type PopularDestination = {
    city: string;
    code: string;
    price: number;
    image: string;
    flight: Flight;
    dealIndex: number;
  };

  interface AirportChip {
    code: string;
    city: string;
  }

  const [departures, setDepartures] = useState<AirportChip[]>([]);
  const [arrivals, setArrivals] = useState<AirportChip[]>([]);
  const latestPrefs = useRef<{ departures: AirportChip[]; arrivals: AirportChip[] }>({ departures: [], arrivals: [] });

  const normalizeDateValue = (value?: Date | string | null) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value.toISOString();
  };

  const mapFlightToUIFlight = (flight: Flight, index: number): UIFlight => {
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
      duration: parseDuration(totalDuration).trim(),
      stops: formatStops(flight.outbound),
      hasBaggage: flight.freeBaggage,
      legs: flight.outbound,
    };
  };

  const selectPopularDestinations = useCallback((deals: Flight[]): PopularDestination[] => {
    const seen = new Set<string>();
    const selections: PopularDestination[] = [];

    for (let idx = 0; idx < deals.length && selections.length < 4; idx += 1) {
      const deal = deals[idx];
      const lastLeg = deal.outbound[deal.outbound.length - 1];
      const destinationCode = lastLeg?.to.iata;

      if (!destinationCode || seen.has(destinationCode)) {
        continue;
      }

      seen.add(destinationCode);
      selections.push({
        city: lastLeg?.to.city || destinationCode,
        code: destinationCode,
        price: deal.price,
        image: DESTINATION_IMAGES[destinationCode] ?? DEFAULT_DESTINATION_IMAGE,
        flight: deal,
        dealIndex: idx,
      });
    }

    return selections;
  }, []);

  const loadPrefs = useCallback(async () => {
    try {
      if (!auth.currentUser) {
        setDepartures([]);
        setArrivals([]);
        return { departures: [] as AirportChip[], arrivals: [] as AirportChip[] };
      }

      const uid = auth.currentUser.uid;
      const docRef = doc(db, "Users", uid, "airportPreferences", "prefs");
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const fetchedDepartures = data.departures || [];
        const fetchedArrivals = data.arrivals || [];
        const prefs = { departures: fetchedDepartures, arrivals: fetchedArrivals };
        latestPrefs.current = prefs;
        setDepartures(fetchedDepartures);
        setArrivals(fetchedArrivals);
        return prefs;
      }

      setDepartures([]);
      setArrivals([]);
      latestPrefs.current = { departures: [], arrivals: [] };
      return { departures: [] as AirportChip[], arrivals: [] as AirportChip[] };
    } catch (error) {
      console.error("Error loading preferences", error);
      setDepartures([]);
      setArrivals([]);
      latestPrefs.current = { departures: [], arrivals: [] };
      return { departures: [] as AirportChip[], arrivals: [] as AirportChip[] };
    }
  }, []);

  const fetchData = useCallback(async (
    prefs?: { departures: AirportChip[]; arrivals: AirportChip[] }
  ) => {
    const { departures: currentDepartures, arrivals: currentArrivals } =
      prefs ?? latestPrefs.current;

    try {
      const randomAirport = (currentArrivals.length > 0)
        ? (currentArrivals[Math.floor(Math.random() * currentArrivals.length)]).code
        : "BUF";

      const destAirports = (currentDepartures.length > 0)
        ? currentDepartures.map((departure) => departure.code)
        : ["LAX", "JFK", "CLE"];

      // Date 20 days from now
      const futureDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);

      const params: OneWayQueryParams = {
        originAirportIATA: 'JFK',
        destinationAirportIATA: randomAirport,
        flexibleAirports: destAirports,
        flexibleDates: true,
        date: futureDate,
        travelers: [
          {
            dateOfBirth: new Date("2000-01-03"),
            travelerType: "ADULT",
          }
        ],
        currencyCode: "USD"
      };
      const responseData = await skyboundRequest("searchFlightsOneWay", params);
      const revivedData: Flight[] = reviveDates(responseData);
      const sortedDeals = [...revivedData].sort((a, b) => a.price - b.price);
      setAllDeals(sortedDeals);
      setPopularDestinations(selectPopularDestinations(sortedDeals));

      const limitedDeals = sortedDeals.slice(0, 10);
      if (limitedDeals.length < 10 && limitedDeals.length > 0) {
        const needed = 10 - limitedDeals.length;
        const extra = Array.from({ length: needed }, (_, idx) => limitedDeals[idx % limitedDeals.length]);
        setData([...limitedDeals, ...extra]);
      } else {
        setData(limitedDeals);
      }
    } catch (error) {
      console.error("Error fetching data for dashboard", error);
      setData([]);
      setAllDeals([]);
      setPopularDestinations([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const bootstrapDashboard = async () => {
      setBootstrapping(true);
      try {
        const prefs = await loadPrefs();
        await fetchData(prefs);
      } catch (error) {
        console.error("Error bootstrapping dashboard", error);
      } finally {
        if (isMounted) {
          setBootstrapping(false);
        }
      }
    };

    bootstrapDashboard();
    return () => {
      isMounted = false;
    };
  }, [fetchData, loadPrefs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  //function for setting the markers dynamically for which flash deal is in focus
  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if(viewableItems.length > 0)
    {
      const flight = viewableItems[0].item;
      setFocusedFlight({
        source: flight.outbound[0].from.iata,
        dest: flight.outbound[0].to.iata,
      });
    }
  }).current;

  function parseDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hoursString = hours > 0 ? `${hours}h` : "";
    const minutesString = minutes > 0 ? `${minutes}m` : "";
    return [hoursString, minutesString].join(" ").trim();
  }

  function formatStops(legs: Flight["outbound"]): string {
    const stopCount = Math.max(legs.length - 1, 0);
    if (stopCount === 0) return "Non-stop";
    if (stopCount === 1) return `${stopCount} stop ${legs[0]?.to.iata ?? ""}`.trim();
    return `${stopCount} stops`;
  }

  const handleDealPress = useCallback(
    (flight: Flight, dealIndex: number) => {
      const uiFlight = mapFlightToUIFlight(flight, dealIndex);
      const firstOutbound = flight.outbound[0];
      const lastOutbound = flight.outbound[flight.outbound.length - 1];

      const itinerary = {
        flights: [uiFlight],
        searchDetails: {
          tripType: "one-way",
          fromCode: firstOutbound.from.iata,
          toCode: lastOutbound.to.iata,
          departureDate: normalizeDateValue(firstOutbound.departureTime),
          legsCount: 1,
          legsDates: [normalizeDateValue(firstOutbound.departureTime)],
        },
      };

      navigation.navigate("FlightSummary", { itinerary });
    },
    [navigation]
  );

  const handleDestinationPress = useCallback(
    (destination: PopularDestination) => {
      handleDealPress(destination.flight, destination.dealIndex);
    },
    [handleDealPress]
  );

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: !(bootstrapping || destinationLoading) });
  }, [navigation, bootstrapping, destinationLoading]);

  if (bootstrapping || destinationLoading) {
    return (
      <LoadingScreen
        message={destinationLoading ? "Finding flights for you..." : "Loading your dashboard..."}
      />
    );
  }

  return (
    // Gradient for optional use in future, white for now
    <LinearGradient colors={["#FFFFFF", "#FFFFFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E'}}>
        {/* NavBar (required props) */}  
        <View style={{ backgroundColor: "#fff" }}>
        
        </View>

          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 24 }}
          >
          {/* Hero */}
          <View style={styles.heroShell}>
            <LinearGradient
              colors={["#2179edff", "#56adffff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <SkyboundText accessabilityLabel="Where to next" variant="primaryBold" size={22} style={{ color: "#FFFFFF", textAlign: 'center' }}>
                Where to next?
              </SkyboundText>
              <SkyboundText
                accessabilityLabel="Discover unbeatable flight deals worldwide"
                variant="secondary"
                size={14}
                style={{ color: "#E4F1FF", marginTop: 4, textAlign: 'center' }}
              >
                Discover unbeatable flight deals worldwide
              </SkyboundText>
              <Pressable
                style={styles.searchButton}
                onPress={() => navigation.navigate('FlightSearch')}
              >
                <Ionicons name="search" size={18} color="#0B57D0" />
                <SkyboundText accessabilityLabel="Search for flights" variant="blue" size={14} style={{ marginLeft: 8 }}>
                  Search for flights
                </SkyboundText>
              </Pressable>
            </LinearGradient>
          </View>
            
            {/* Flash Deals */}
            <View style={[styles.section, {marginTop: 25}]}>
              <View style={styles.sectionHeader}>
                <SkyboundText accessabilityLabel="Flash Deals Available" variant="primaryBold" size={18} style={{ color: "#0071E2" }}>
                  Flash Deals
                </SkyboundText>
                <Pressable onPress={() => navigation.navigate('FlashDeals', { deals: allDeals })}>
                  <SkyboundText accessabilityLabel="View All" variant="blue" size={13}>View All</SkyboundText>
                </Pressable>
              </View>
              <SkyboundItemHolder style={styles.mapCard}>
                <DisplayMap
                  sourceAirportCode={focusedFlight?.source}
                  destAirportCode={focusedFlight?.dest}
                  mapHeight={200}
                  mapWidth={380}
                />
              </SkyboundItemHolder>

              <FlatList
                horizontal
                data={data}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(flight, index) =>
                  `${flight.airline.iata}-${flight.price}-${index}`
                }
                renderItem={({ item, index }) => (
                  <SkyboundFlashDeal
                    key={`${item.airline.iata}-${item.price}-${index}`}
                    airlineName={item.airline.name}
                    sourceCode={item.outbound[0].from.iata}
                    destCode={item.outbound[0].to.iata}
                    departureTime={item.outbound[0].departureTime.toISOString().split('T')[0]}
                    arrivalTime={item.outbound[item.outbound.length - 1].arrivalTime.toISOString().split('T')[0]}
                    travelTime={parseDuration(item.outbound.reduce((sum, leg) => sum + leg.duration, 0))}
                    originalPrice=""
                    newPrice={`$${item.price}`}
                    onPress={() => handleDealPress(item, index)}
                    airlineImage={
                      <Image
                        source={require('@assets/images/Notification Photo.png')}
                        style={{ width: 24, height: 24, marginRight: 6 }}
                      />
                    }
                  />
                )}
                contentContainerStyle={{ padding: 16, gap: 12 }}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                ListEmptyComponent={() => (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <SkyboundText variant="secondary">No deals available right now.</SkyboundText>
                  </View>
                )}
              />
            </View>

          {/* Popular Destinations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SkyboundText accessabilityLabel="Popular Destinations" variant="primaryBold" size={18} style={{ color: "#0071E2" }}>
                Popular Destinations
              </SkyboundText>
              <Pressable onPress={() => navigation.navigate('FlightSearch')}>
                <SkyboundText accessabilityLabel="See all destinations" variant="blue" size={13}>See All</SkyboundText>
              </Pressable>
            </View>
            <View style={styles.destGrid}>
              {popularDestinations.length === 0 ? (
                <View style={styles.emptyState}>
                  <SkyboundText variant="secondary">No popular destinations right now.</SkyboundText>
                </View>
              ) : (
                popularDestinations.map((destination) => (
                  <Pressable
                    key={`${destination.code}-${destination.price}`}
                    onPress={() => handleDestinationPress(destination)}
                    style={styles.destCard}
                  >
                    <Image source={{ uri: destination.image }} style={styles.destImage} />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.55)"]}
                      style={styles.destOverlay}
                    >
                      <SkyboundText variant="primaryBold" size={16} style={{ color: '#FFFFFF' }}>
                        {destination.city}
                      </SkyboundText>
                      <SkyboundText variant="secondary" size={13} style={{ color: '#E4F1FF' }}>
                        From ${destination.price}
                      </SkyboundText>
                    </LinearGradient>
                  </Pressable>
                ))
              )}
            </View>
            </View>
            {/* CTA */}
          <SkyboundItemHolder style={{margin: 40}}>
            <SkyboundText accessabilityLabel="Ready to book button" variant="primaryBold" size={16}>Ready to Book?</SkyboundText>
            <SkyboundText accessabilityLabel= "Find more amazing deals to start your journey" variant="secondary" size={13} style={{ marginBottom: 12 }}>
              Find more amazing deals and start your journey
            </SkyboundText>
            <Pressable style={styles.readyBtn} onPress={() => navigation.navigate('FlashDeals', { deals: allDeals })}>
              <SkyboundText accessabilityLabel=' View All Deals' variant="primaryButton" size={14} style={{ color: "#fff" }}>View All Deals</SkyboundText>
            </Pressable>
          </SkyboundItemHolder>
        </ScrollView>
        </SafeAreaView>
        </LinearGradient>
   
      
    
  );
}

const styles = StyleSheet.create({
  heroShell: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1b6ad6',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  hero: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  searchButton: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#C7DCFF',
    borderWidth: 1,
    shadowColor: '#1b6ad6',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  section: {
    marginTop: 20,
    gap: 8
  },
  sectionHeader: {
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  mapCard: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  destGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  destCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#E9EEF5',
  },
  destImage: {
    width: '100%',
    height: '100%',
  },
  destOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  readyCard: {
    margin: 40,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000", 
    shadowOpacity: 0.12, 
    shadowRadius: 12, 
    shadowOffset: { width: 0, height: 8 }, 
    elevation: 5, 
    alignItems: "center",
  },
  readyBtn: { 
    backgroundColor: "#0B57D0", 
    paddingVertical: 15, 
    paddingHorizontal: 18, 
    borderRadius: 12 
  },
});

function reviveDate(arg0: any): React.SetStateAction<any[]> {
  throw new Error("Function not implemented.");
}
