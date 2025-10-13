// screens/DashboardScreen.tsx
import React from "react";
import { SafeAreaView, View, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import SkyboundText from "../../components/ui/SkyboundText";
import SkyboundFlashDeal from "../../components/ui/SkyboundFlashDeal";
import SkyboundNavBar from "../../components/ui/SkyboundNavBar";

export default function DashboardScreen() {
  const nav = useNavigation<any>();

  return (
    <LinearGradient colors={["#2F97FF", "#0071E2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* NavBar (required props) */}
        <View style={{ backgroundColor: "#fff" }}>
          <SkyboundNavBar
            title="Home"
            leftHandIcon={<Ionicons name="menu" size={22} color="#000" />}
            leftHandIconOnPressEvent={() => {}}
            rightHandFirstIcon={<Ionicons name="notifications-outline" size={22} color="#000" />}
            rightHandFirstIconOnPressEvent={() => {}}
            rightHandSecondIcon={<Ionicons name="person-circle-outline" size={24} color="#000" />}
            rightHandSecondIconOnPressEvent={() => {}}
          />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Hero */}
          <View style={styles.hero}>
            <Image source={require("../../assets/images/skybound-logo-white.png")} resizeMode="contain" style={{ width: 160, height: 50, marginBottom: 10 }} />
            <Pressable style={styles.heroBtn}>
              <SkyboundText variant="primaryButton" size={14} style={{ color: "#fff" }}>Search for Flights →</SkyboundText>
            </Pressable>
          </View>

          {/* Flash Deals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SkyboundText variant="primaryBold" size={18} style={{ color: "#000" }}>Flash Deals</SkyboundText>
              <Pressable><SkyboundText variant="blue" size={13}>View All</SkyboundText></Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              <SkyboundFlashDeal
                airlineImage={<Image source={require("../../assets/images/Notification Photo.png")} style={{ width: 24, height: 24, marginRight: 6 }} />}
                airlineName="Delta Airlines" sourceCode="LGA" destCode="LAX"
                departureTime="8:30 AM" arrivalTime="12:15 PM" travelTime="5h 45m"
                originalPrice="$460" newPrice="$225" onPress={() => {}}
              />
              <SkyboundFlashDeal
                airlineImage={<Image source={require("../../assets/images/Notification Photo.png")} style={{ width: 24, height: 24, marginRight: 6 }} />}
                airlineName="United" sourceCode="JFK" destCode="SFO"
                departureTime="9:15 AM" arrivalTime="12:25 PM" travelTime="6h 10m"
                originalPrice="$520" newPrice="$289" onPress={() => {}}
              />
              <SkyboundFlashDeal
                airlineImage={<Image source={require("../../assets/images/Notification Photo.png")} style={{ width: 24, height: 24, marginRight: 6 }} />}
                airlineName="JetBlue" sourceCode="PHL" destCode="MIA"
                departureTime="7:40 AM" arrivalTime="10:10 AM" travelTime="2h 30m"
                originalPrice="$180" newPrice="$119" onPress={() => {}}
              />
            </ScrollView>
          </View>

          {/* CTA */}
          <View style={styles.readyCard}>
            <SkyboundText variant="primaryBold" size={16} style={{ color: "#000", marginBottom: 6 }}>Ready to Book?</SkyboundText>
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
    borderWidth: 1, 
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
  },
  heroBtn: { 
    marginTop: 12, 
    backgroundColor: "#0B57D0", 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    borderRadius: 12 
  },
  section: { 
    marginTop: 8, 
    gap: 8 
  },
  sectionHeader: { 
    paddingHorizontal: 16, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 8 
  },
  readyCard: {
    margin: 16, 
    padding: 16, 
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
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    borderRadius: 12 
  },
});