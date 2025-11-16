import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import type { TripCardData } from '@src/types/trips';

type FlightInfoRoute = RouteProp<RootStackParamList, 'FlightInfo'>;

const defaultTrip: TripCardData = {
  id: 'trip-default',
  dateRange: 'Nov 14 · 2025',
  route: 'JFK → LAX',
  airline: 'Delta Air Lines · DL 342',
  travelerCount: 2,
  status: 'Confirmed',
  upcoming: true,
  gate: 'B12',
  terminal: '4',
  departureTime: '07:20 AM',
  arrivalTime: '10:05 AM',
  layovers: [{ id: 'DEN', airportName: 'Denver International', airportCode: 'DEN', duration: '1h 05m' }],
};

const travelers = ['Ariana Rivera', 'Liam Chen'];

const FlightInfo: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<FlightInfoRoute>();
  const trip = route.params?.trip ?? defaultTrip;

  return (
    <SkyboundScreen
      title={`${trip.route}`}
      subtitle={trip.dateRange}
      showLogo
      headerAccessory={
        <View style={[styles.statusPill, { backgroundColor: 'rgba(34,197,94,0.18)' }]}> 
          <SkyboundText variant="primary" size={12} style={{ color: '#22C55E' }} accessabilityLabel="Flight status">
            {trip.status}
          </SkyboundText>
        </View>
      }
    >
      <SkyboundCard>
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Booking details title">
          Booking Details
        </SkyboundText>
        <View style={styles.detailRow}>
          <SkyboundText variant="secondary" size={13} accessabilityLabel="Booking reference label">
            Booking reference
          </SkyboundText>
          <SkyboundText variant="primary" size={14} accessabilityLabel="Booking reference value">
            HB7X2Q
          </SkyboundText>
        </View>
        <View style={styles.detailRow}>
          <SkyboundText variant="secondary" size={13} accessabilityLabel="Airline label">
            Airline
          </SkyboundText>
          <SkyboundText variant="primary" size={14} accessabilityLabel="Airline value">
            {trip.airline}
          </SkyboundText>
        </View>
        <View style={styles.detailRow}>
          <SkyboundText variant="secondary" size={13} accessabilityLabel="Flight number label">
            Flight number
          </SkyboundText>
          <SkyboundText variant="primary" size={14} accessabilityLabel="Flight number value">
            DL 342
          </SkyboundText>
        </View>
        <View style={styles.detailRow}>
          <SkyboundText variant="secondary" size={13} accessabilityLabel="Cabin label">
            Cabin class
          </SkyboundText>
          <SkyboundText variant="primary" size={14} accessabilityLabel="Cabin value">
            Premium Economy
          </SkyboundText>
        </View>
      </SkyboundCard>

      <SkyboundCard>
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Travelers title">
          Travelers
        </SkyboundText>
        {travelers.map((traveler) => (
          <View style={styles.travelerRow} key={traveler}>
            <Ionicons name="person-circle-outline" size={32} color={colors.link} />
            <SkyboundText variant="primary" size={15} accessabilityLabel={`Traveler ${traveler}`}>
              {traveler}
            </SkyboundText>
          </View>
        ))}
      </SkyboundCard>

      <SkyboundCard>
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Schedule title">
          Schedule & Duration
        </SkyboundText>
        <View style={styles.timelineRow}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineInfo}>
            <SkyboundText variant="primaryBold" size={16} accessabilityLabel="Departure time">
              {trip.departureTime} · JFK Terminal {trip.terminal}
            </SkyboundText>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Gate info">
              Gate {trip.gate}
            </SkyboundText>
          </View>
        </View>
        <View style={styles.durationLine}>
          <SkyboundText variant="secondary" size={12} accessabilityLabel="Duration">
            Total duration · 5h 45m
          </SkyboundText>
        </View>
        <View style={styles.timelineRow}>
          <View style={[styles.timelineDot, styles.timelineDotFilled]} />
          <View style={styles.timelineInfo}>
            <SkyboundText variant="primaryBold" size={16} accessabilityLabel="Arrival time">
              {trip.arrivalTime} · LAX Terminal 3
            </SkyboundText>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Arrival gate">
              Baggage Claim 6
            </SkyboundText>
          </View>
        </View>
      </SkyboundCard>

      {trip.layovers?.length ? (
        <SkyboundCard>
          <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Layovers title">
            Layovers
          </SkyboundText>
          {trip.layovers.map((layover) => (
            <View key={layover.id} style={styles.layoverRow}>
              <View>
                <SkyboundText variant="primary" size={15} accessabilityLabel={`Layover airport ${layover.airportName}`}>
                  {layover.airportName} ({layover.airportCode})
                </SkyboundText>
                <SkyboundText variant="secondary" size={13} accessabilityLabel={`Layover duration ${layover.duration}`}>
                  {layover.duration}
                </SkyboundText>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('AirportInfo', { airportCode: layover.airportCode, airportName: layover.airportName })}
                style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]}
              >
                <SkyboundText variant="primary" size={13} accessabilityLabel="Layover info">
                  Layover info
                </SkyboundText>
              </Pressable>
            </View>
          ))}
        </SkyboundCard>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('GetHelp')}
        style={({ pressed }) => [styles.helpLink, pressed && { opacity: 0.7 }]}
      >
        <SkyboundText variant="blue" size={14} accessabilityLabel="Need help link">
          Need help with this trip?
        </SkyboundText>
        <Ionicons name="chevron-forward" size={16} color={colors.link} />
      </Pressable>
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2F97FF',
    marginTop: 4,
    marginRight: 12,
  },
  timelineDotFilled: {
    backgroundColor: '#2F97FF',
  },
  timelineInfo: {
    flex: 1,
  },
  durationLine: {
    marginTop: 12,
    marginLeft: 24,
  },
  layoverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    marginTop: 8,
  },
});

export default FlightInfo;
