import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import type { TripCardData } from '@src/types/trips';

import { auth, db } from "@src/firebase";
import { collection, getDocs } from "firebase/firestore";



const statusColors: Record<string, { background: string; text: string }> = {
  Confirmed: { background: 'rgba(137, 212, 255, 0.15)', text: '#22C55E' },
  Delayed: { background: 'rgba(248,113,113,0.18)', text: '#DC2626' },
  'Boarding Soon': { background: 'rgba(251,191,36,0.15)', text: '#D97706' },
  Boarding: { background: 'rgba(59,130,246,0.18)', text: '#2563EB' },
  'In the Air': { background: 'rgba(14,165,233,0.18)', text: '#0EA5E9' },
  Completed: { background: 'rgba(148,163,184,0.2)', text: '#475569' },
  Canceled: { background: 'rgba(239,68,68,0.15)', text: '#B91C1C' },
};

const Trips: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

const [upcomingTrips, setUpcomingTrips] = useState<TripCardData[]>([]);
const [pastTrips, setPastTrips] = useState<TripCardData[]>([]);
const [loading, setLoading] = useState(true);

//use effect to load the user's booked trips from firebase
useEffect(() => {
  async function loadTrips() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const ref = collection(db, "Users", user.uid, "trips");
      const snap = await getDocs(ref);

      const now = new Date();
      const upcoming: TripCardData[] = [];
      const past: TripCardData[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        

        // -----------------------------
        // FIX 1: Properly decode dates
        // -----------------------------
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (data.departureDate?.toDate)
          startDate = data.departureDate.toDate();
        else if (typeof data.departureDate === "string")
          startDate = new Date(data.departureDate);

        if (data.returnDate?.toDate)
          endDate = data.returnDate.toDate();
        else if (typeof data.returnDate === "string")
          endDate = new Date(data.returnDate);

        const dateRange =
          startDate
            ? `${startDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })} – ${
                endDate
                  ? endDate.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"
              }, ${startDate.getFullYear()}`
            : "Date unavailable";

        // -----------------------------
        // FIX 2: Route based on searchDetails
        // -----------------------------
        const route = `${data.searchDetails?.fromCode || "???"} → ${
          data.searchDetails?.toCode || "???"
        }`;

        // -----------------------------
        // FIX 3: Extract airline + schedule from legs
        // -----------------------------
        const firstFlight = data.flights?.[0];
        const firstLeg = firstFlight?.legs?.[0] || null;
        const lastLeg =
          firstFlight?.legs?.[firstFlight.legs.length - 1] || null;

        const airline = firstFlight?.airline || "Unknown Airline";
        const departureTime = firstLeg?.departureTime || "";
        const arrivalTime = lastLeg?.arrivalTime || "";
        const terminal = firstLeg?.from?.terminal || "";
        const gate = firstLeg?.from?.gate || "";

        // -----------------------------
        // FIX 4: Traveler count
        // -----------------------------
        const travelerCount =
          Array.isArray(data.traveler) ? data.traveler.length : 1;

        const trip: TripCardData = {
          id: docSnap.id,
          dateRange,
          route,
          airline,
          travelerCount,
          status: "Confirmed",
          upcoming: startDate ? startDate >= now : false,
          terminal,
          gate,
          departureTime,
          arrivalTime,
          layovers: firstFlight?.layovers || [],
          traveler: data.traveler || null,   // <-- ADD THIS LINE
          
        };

        if (trip.upcoming) upcoming.push(trip);
        else past.push(trip);
      });

      // Sort correctly by date
      upcoming.sort((a, b) => new Date(a.dateRange).getTime() - new Date(b.dateRange).getTime());
      past.sort((a, b) => new Date(b.dateRange).getTime() - new Date(a.dateRange).getTime());

      setUpcomingTrips(upcoming);
      setPastTrips(past);
    } catch (err) {
      console.error("Error loading trips:", err);
    } finally {
      setLoading(false);
    }
  }

  loadTrips();
}, []);


  const trips = useMemo(
  () => (activeTab === "upcoming" ? upcomingTrips : pastTrips),
  [activeTab, upcomingTrips, pastTrips]
);

  const renderTripCard = (trip: TripCardData) => (
    <SkyboundCard key={trip.id}>
      <View style={styles.tripHeader}>
        <View>
          <SkyboundText variant="primaryBold" size={16} accessabilityLabel={`Trip dates ${trip.dateRange}`}>
            {trip.route}
          </SkyboundText>
          <SkyboundText variant="secondary" size={13} accessabilityLabel={`Trip route ${trip.route}`}>
            {trip.dateRange}
          </SkyboundText>
        </View>
        <View style={[styles.statusPill, statusColors[trip.status]]}>
          <SkyboundText
            variant="primary"
            size={12}
            style={{ color: statusColors[trip.status].text }}
            accessabilityLabel={`Status ${trip.status}`}
          >
            {trip.status}
          </SkyboundText>
        </View>
      </View>
      <SkyboundText variant="secondary" size={13} style={{ marginTop: 6 }} accessabilityLabel="Trip airline">
        {trip.airline}
      </SkyboundText>
      <SkyboundText variant="primary" size={13} style={{ marginTop: 4 }} accessabilityLabel="Traveler count">
        {trip.travelerCount} traveler{trip.travelerCount > 1 ? 's' : ''}
      </SkyboundText>

      <View style={styles.tripButtons}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('FlightInfo', { trip })}
          style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
        >
          <SkyboundText variant="primaryButton" size={14} accessabilityLabel="Flight info button">
            Flight Information
          </SkyboundText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('GetHelp')}
          style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]}
        >
          <SkyboundText variant="primary" size={14} accessabilityLabel="Contact support button">
            Contact Support
          </SkyboundText>
        </Pressable>
      </View>
    </SkyboundCard>
  );

  const renderEmptyState = () => (
    <SkyboundCard style={styles.emptyCard}>
      <Ionicons name="airplane-outline" size={52} color={colors.link} />
      <SkyboundText variant="primaryBold" size={18} style={styles.emptyTitle} accessabilityLabel="Empty state title">
        {activeTab === 'upcoming' ? 'No upcoming trips yet' : 'No trips booked with Skybound yet'}
      </SkyboundText>
      <SkyboundText variant="secondary" size={14} style={styles.emptyCopy} accessabilityLabel="Empty state copy">
        {activeTab === 'upcoming'
          ? 'Find your next adventure with Skybound.'
          : 'Book your first flight to unlock personalized timelines.'}
      </SkyboundText>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('FlightSearch', { searchResults: [] })}
        style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
      >
        <SkyboundText variant="primaryButton" size={15} accessabilityLabel="Book flight CTA">
          {activeTab === 'upcoming' ? 'Book Flight' : 'Book your first flight'}
        </SkyboundText>
      </Pressable>
    </SkyboundCard>
  );
  //loading state
  if (loading) {
  return (
    <SkyboundScreen>
      <SkyboundText variant="primary" accessabilityLabel='loading Trips...'>Loading trips...</SkyboundText>
    </SkyboundScreen>
  );
}

  return (
    <SkyboundScreen>
      <View style={[styles.tabWrapper, { borderColor: colors.outline }]}> 
        {(['upcoming', 'past'] as const).map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="button"
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && { backgroundColor: colors.card }]}
          >
            <SkyboundText
              variant={activeTab === tab ? 'blue' : 'primary'}
              size={14}
              accessabilityLabel={`${tab} tab`}
            >
              {tab === 'upcoming' ? 'Upcoming' : 'Past'}
            </SkyboundText>
          </Pressable>
        ))}
      </View>
        
      {trips.length > 0 ? trips.map(renderTripCard) : renderEmptyState()}
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
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  tabWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(148,163,184,0.2)',
  },
  tripButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2F97FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 12,
  },
  emptyCopy: {
    textAlign: 'center',
    marginVertical: 8,
  },
   returnButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});

export default Trips;
