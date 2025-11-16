import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import type { TripCardData } from '@src/types/trips';

const upcomingTrips: TripCardData[] = [
  {
    id: 'trip-001',
    dateRange: 'Nov 14 – Nov 21, 2025',
    route: 'JFK → LAX',
    airline: 'Delta Air Lines · DL 342',
    travelerCount: 2,
    status: 'Confirmed',
    upcoming: true,
    gate: 'B12',
    terminal: '4',
    departureTime: '07:20 AM',
    arrivalTime: '10:05 AM',
    layovers: [
      { id: 'L1', airportName: 'Denver International', airportCode: 'DEN', duration: '1h 05m' },
    ],
  },
  {
    id: 'trip-002',
    dateRange: 'Dec 02 – Dec 08, 2025',
    route: 'SFO → NRT',
    airline: 'ANA · NH 7',
    travelerCount: 1,
    status: 'Boarding Soon',
    upcoming: true,
    gate: 'F3',
    terminal: 'INTL',
  },
];

const pastTrips: TripCardData[] = [
  {
    id: 'trip-101',
    dateRange: 'Sep 01 – Sep 08, 2024',
    route: 'PIT → CDG',
    airline: 'Air France · AF 69',
    travelerCount: 2,
    status: 'Completed',
    upcoming: false,
  },
];

const statusColors: Record<string, { background: string; text: string }> = {
  Confirmed: { background: 'rgba(34,197,94,0.15)', text: '#22C55E' },
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

  const trips = useMemo(() => (activeTab === 'upcoming' ? upcomingTrips : pastTrips), [activeTab]);

  const renderTripCard = (trip: TripCardData) => (
    <SkyboundCard key={trip.id}>
      <View style={styles.tripHeader}>
        <View>
          <SkyboundText variant="primaryBold" size={16} accessabilityLabel={`Trip dates ${trip.dateRange}`}>
            {trip.dateRange}
          </SkyboundText>
          <SkyboundText variant="secondary" size={13} accessabilityLabel={`Trip route ${trip.route}`}>
            {trip.route}
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

  return (
    <SkyboundScreen title="Your Trips" subtitle="Keep tabs on every journey in one place." showLogo>
      <View style={[styles.tabWrapper, { borderColor: colors.outline }]}> 
        {(['upcoming', 'past'] as const).map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="button"
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && { backgroundColor: colors.card }]}
          >
            <SkyboundText
              variant={activeTab === tab ? 'primaryBold' : 'secondary'}
              size={14}
              accessabilityLabel={`${tab} tab`}
            >
              {tab === 'upcoming' ? 'Upcoming' : 'Past'}
            </SkyboundText>
          </Pressable>
        ))}
      </View>

      {trips.length > 0 ? trips.map(renderTripCard) : renderEmptyState()}
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
});

export default Trips;
