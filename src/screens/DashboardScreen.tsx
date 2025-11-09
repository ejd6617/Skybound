// screens/DashboardScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, useColorScheme, View } from "react-native";

import DisplayMap from "@/components/ui/DisplayMap";
import SkyboundButton from "@components/ui/SkyboundButton";
import SkyboundFlashDeal from "@components/ui/SkyboundFlashDeal";
import SkyboundItemHolder from "@components/ui/SkyboundItemHolder";
import SkyboundNavBar from "@components/ui/SkyboundNavBar";
import SkyboundText from "@components/ui/SkyboundText";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RoundTripQueryParams } from "@skyboundTypes/SkyboundAPI";
import { reviveDates, skyboundRequest } from "@src/api/SkyboundUtils";
import { RootStackParamList } from "@src/nav/RootNavigator";

export default function DashboardScreen() {
  const nav = useNavigation<any>();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Is loading in new data (default true)
  const [refreshing, setRefreshing] = useState(false); // Is refreshing data (default false)
  const [focusedFlight, setFocusedFlight] = useState(null); //keeping track which flash deal is in focus
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;


  // TODO: More useful query here
  const fetchData = (async () => {
    const endpoint: string = "searchFlightsRoundTrip";
    const params: RoundTripQueryParams = {
      originAirportIATA: 'LAX',
      destinationAirportIATA: 'JFK',
      flexibleAirports: false,
      flexibleDates: false,
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-01-17'),
    };
    const responseData = await skyboundRequest(endpoint, params);
    const revivedData = reviveDates(responseData);
    setData(revivedData);
    
  });

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => {setLoading(false);
    });
    
  }, []);

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
    const hoursString = (hours > 0) ? hours.toString()+"h": "";
    const minutesString = (minutes > 0) ? minutes.toString()+"m": "";
    return [hoursString, minutesString].join(" ");
  }

 const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  return (
    // Gradient for optional use in future, white for now
    <LinearGradient colors={["#FFFFFF", "#FFFFFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E'}}>
        {/* NavBar (required props) */}  
        <View style={{ backgroundColor: "#fff" }}>
          <SkyboundNavBar
            title={ 
              <Image source={require("@assets/images/skybound-logo-dark.png")}
              style={{ width: 200, height: 100, resizeMode: "contain" }}/>}
            leftHandIcon={<Ionicons name="menu" size={22} color="#0071E2" />}
            leftHandIconOnPressEvent={() => {}}
            rightHandFirstIcon={<Ionicons name="notifications-outline" size={22} color="#0071E2" />}
            rightHandFirstIconOnPressEvent={() => {}}
            rightHandSecondIcon={<Ionicons name="person-circle-outline" size={24} color="#0071E2" />}
            rightHandSecondIconOnPressEvent={() => navigation.navigate("Account")}
          />
        </View>

          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 24 }}
          >
          {/* Hero */}
          <View style={styles.hero}>
            <SkyboundButton onPress={() => navigation.navigate('FlightSearch')}
              width={300} height={100}
            >Search For Flights</SkyboundButton>
          </View>

          {/* Flash Deals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SkyboundText accessabilityLabel="Flash Deals Available" variant="primaryBold" size={18} style={{ color: "#0071E2" }}>
                Flash Deals
              </SkyboundText>
              <Pressable>
                <SkyboundText accessabilityLabel="View All" variant="blue" size={13}>View All</SkyboundText>
              </Pressable>
            </View>

            <DisplayMap
            sourceAirportCode={focusedFlight?.source}
            destAirportCode={focusedFlight?.dest}
            mapHeight={300}
            mapWidth={300}/>

            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#000000" />
              </View>
            ) : (
             
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
                    travelTime={parseDuration(item.outbound[0].duration)}
                    originalPrice="0"
                    newPrice={`$${item.price}`}
                    onPress={() => {}}
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
      />
            )}
          </View>
            {/* airlineImage={<Image source={require("@assets/images/Notification Photo.png")} style={{ width: 24, height: 24, marginRight: 6 }} />} */}
          {/* CTA */}
          <SkyboundItemHolder style={{margin: 40}}>
            <SkyboundText accessabilityLabel="Ready to book button" variant="primaryBold" size={16}>Ready to Book?</SkyboundText>
            <SkyboundText accessabilityLabel= "Find more amazing deals to start your journey" variant="secondary" size={13} style={{ marginBottom: 12 }}>
              Find more amazing deals and start your journey
            </SkyboundText>
            <Pressable style={styles.readyBtn}><SkyboundText accessabilityLabel=' View All Deals' variant="primaryButton" size={14} style={{ color: "#fff" }}>View All Deals</SkyboundText></Pressable>
          </SkyboundItemHolder>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    margin: 16, 
    padding: 16, 
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)", 
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
  },
  heroBtn: { 
    marginTop: 0, 
    backgroundColor: "#0B57D0", 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 12 
  },
  section: { 
    marginTop: 15, 
    gap: 8
  },
  sectionHeader: { 
    paddingHorizontal: 18, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 8 
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
