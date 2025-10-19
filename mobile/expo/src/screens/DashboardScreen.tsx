// screens/DashboardScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import Constants from 'expo-constants';
import SkyboundFlashDeal from "../../components/ui/SkyboundFlashDeal";
import SkyboundNavBar from "../../components/ui/SkyboundNavBar";
import SkyboundText from "../../components/ui/SkyboundText";

export default function DashboardScreen() {
  const nav = useNavigation<any>();

  const [data, setData] = useState([]);
  const API_URL = Constants.expoConfig?.extra?.API_URL;

  useEffect(() => {
    (async () => {
      try {
        const url = `${API_URL}/api/searchFlightsRoundTrip/`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            "originAirport": "LAX",
            "destinationAirport": "JFK",
            "startDate": "2026-01-10",
            "endDate": "2026-01-17"
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        // TEMPORARY: shuffle and shorten the data to make it more realistic in the app
        const shuffledData = data.sort(() => Math.random() - 0.5).slice(0,5);
        setData(shuffledData);
      } catch (err) {
        console.error('API call failed', err);
      }
    })();
 
  }, []);

  function parseDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hoursString = (hours > 0) ? hours.toString()+"h": "";
    const minutesString = (minutes > 0) ? minutes.toString()+"m": "";
    return [hoursString, minutesString].join(" ");
  }

  const flightDeals = data.map(flight => (
    <SkyboundFlashDeal
      airlineImage={<Image source={require("../../assets/images/Notification Photo.png")} style={{ width: 24, height: 24, marginRight: 6 }} />}
      airlineName={flight.airlineName} sourceCode={flight.outbound.sourceCode} destCode={flight.outbound.destCode}
      departureTime={flight.outbound.departureTime.split('T')[0]} arrivalTime={flight.outbound.arrivalTime.split('T')[0]} travelTime={parseDuration(flight.outbound.duration)}
      originalPrice="" newPrice={`$${flight.price}`} onPress={() => {}}
    />
  ));
  
  return (
    // Gradient for optional use in future, white for now
    <LinearGradient colors={["#FFFFFF", "#FFFFFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* NavBar (required props) */}
        <View style={{ backgroundColor: "#fff" }}>
          <SkyboundNavBar
            title={ 
              <Image source={require("../../assets/images/skybound-logo-dark.png")}
              style={{ width: 200, height: 100, resizeMode: "contain" }}/>}
            leftHandIcon={<Ionicons name="menu" size={22} color="#0071E2" />}
            leftHandIconOnPressEvent={() => {}}
            rightHandFirstIcon={<Ionicons name="notifications-outline" size={22} color="#0071E2" />}
            rightHandFirstIconOnPressEvent={() => {}}
            rightHandSecondIcon={<Ionicons name="person-circle-outline" size={24} color="#0071E2" />}
            rightHandSecondIconOnPressEvent={() => {}}
          />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Hero */}
          <View style={styles.hero}>
            <Pressable style={styles.heroBtn}>
              <SkyboundText variant="primaryButton" size={14} style={{ color: "#fff" }}>Search for Flights →</SkyboundText>
            </Pressable>
          </View>

          {/* Flash Deals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SkyboundText variant="primaryBold" size={18} style={{ color: "#0071E2" }}>Flash Deals</SkyboundText>
              <Pressable><SkyboundText variant="blue" size={13}>View All</SkyboundText></Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }}>
              {flightDeals}
            </ScrollView>
          </View>

          {/* CTA */}
          <View style={styles.readyCard}>
            <SkyboundText variant="primaryBold" size={16} style={{ color: "#000", marginBottom: 10 }}>Ready to Book?</SkyboundText>
            <SkyboundText variant="secondary" size={13} style={{ marginBottom: 12 }}>
              Find more amazing deals and start your journey
            </SkyboundText>
            <Pressable style={styles.readyBtn}><SkyboundText variant="primaryButton" size={14} style={{ color: "#fff" }}>View All Deals</SkyboundText></Pressable>
          </View>
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