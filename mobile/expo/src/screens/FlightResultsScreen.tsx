import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import SkyboundNavBar from "../../components/ui/SkyboundNavBar";
import SkyboundText from "../../components/ui/SkyboundText";
import { useColors } from "../../constants/theme";
import type { RootStackParamList } from "../nav/RootNavigator";

interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineColor: string;
  category?: 'best' | 'cheapest' | 'fastest';
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

const MOCK_FLIGHTS: Flight[] = [
  {
    id: '1',
    airline: 'American Airlines',
    airlineCode: 'AA',
    airlineColor: '#DC2626',
    category: 'best',
    price: 428,
    cabinClass: 'Main Basic',
    departureTime: '7:20 AM',
    arrivalTime: '1:05 PM',
    departureCode: 'CLE',
    arrivalCode: 'LAX',
    duration: '5h 45m',
    stops: '1 stop DFW',
    hasBaggage: true,
  },
  {
    id: '2',
    airline: 'Southwest Airlines',
    airlineCode: 'SW',
    airlineColor: '#EAB308',
    category: 'cheapest',
    price: 384,
    cabinClass: 'Wanna Get Away',
    departureTime: '6:15 AM',
    arrivalTime: '11:35 AM',
    departureCode: 'CLE',
    arrivalCode: 'LAX',
    duration: '7h 20m',
    stops: '1 stop PHX',
  },
  {
    id: '3',
    airline: 'United Airlines',
    airlineCode: 'UA',
    airlineColor: '#1E40AF',
    category: 'fastest',
    price: 512,
    cabinClass: 'Basic Economy',
    departureTime: '2:45 PM',
    arrivalTime: '5:20 PM',
    departureCode: 'CLE',
    arrivalCode: 'LAX',
    duration: '4h 35m',
    stops: 'Nonstop',
  },
  {
    id: '4',
    airline: 'Delta Airlines',
    airlineCode: 'DL',
    airlineColor: '#9333EA',
    price: 467,
    cabinClass: 'Main Cabin',
    departureTime: '10:30 AM',
    arrivalTime: '2:45 PM',
    departureCode: 'CLE',
    arrivalCode: 'LAX',
    duration: '6h 15m',
    stops: '1 stop ATL',
  },
];

export default function FlightResultsScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [flights, setFlights] = useState<Flight[]>(MOCK_FLIGHTS);
  const [visibleCount, setVisibleCount] = useState(4);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'stops'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter states
  const [maxStops, setMaxStops] = useState(2);
  const [maxDuration, setMaxDuration] = useState(10);

  const screenWidth = Dimensions.get('window').width;

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'best':
        return { label: 'Best Overall', color: '#0071E2' };
      case 'cheapest':
        return { label: 'Cheapest', color: '#077D2E' };
      case 'fastest':
        return { label: 'Fastest', color: '#BE5105' };
      default:
        return null;
    }
  };

  const sortFlights = (criteria: 'price' | 'duration' | 'stops', direction: 'asc' | 'desc') => {
    const sorted = [...flights].sort((a, b) => {
      let comparison = 0;
      if (criteria === 'price') {
        comparison = a.price - b.price;
      } else if (criteria === 'duration') {
        const aDuration = parseInt(a.duration);
        const bDuration = parseInt(b.duration);
        comparison = aDuration - bDuration;
      } else if (criteria === 'stops') {
        const aStops = a.stops.includes('Nonstop') ? 0 : parseInt(a.stops) || 1;
        const bStops = b.stops.includes('Nonstop') ? 0 : parseInt(b.stops) || 1;
        comparison = aStops - bStops;
      }
      return direction === 'asc' ? comparison : -comparison;
    });
    setFlights(sorted);
    setSortBy(criteria);
    setSortDirection(direction);
    setSortModalVisible(false);
  };

  const FlightCard = ({ flight }: { flight: Flight }) => {
    const badge = getCategoryBadge(flight.category);

    return (
      <Pressable 
        style={[styles.flightCard, { backgroundColor: colors.card, borderColor: colors.divider }]}
        onPress={() => navigation.navigate('ComponentTest')}
      >
        {badge && (
          <View style={[styles.categoryBadge, { backgroundColor: badge.color }]}>
            <SkyboundText variant="primary" size={12} accessabilityLabel={badge.label} style={{ color: '#FFF' }}>
              {badge.label}
            </SkyboundText>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.airlineRow}>
            <View style={styles.airlineInfo}>
              <View style={[styles.airlineLogo, { backgroundColor: flight.airlineColor }]}>
                <SkyboundText variant="primary" size={12} accessabilityLabel={flight.airlineCode} style={{ color: '#FFF', fontWeight: 'bold' }}>
                  {flight.airlineCode}
                </SkyboundText>
              </View>
              <View>
                <SkyboundText variant="primary" size={14} accessabilityLabel={flight.airline}>
                  {flight.airline}
                </SkyboundText>
                <SkyboundText variant="secondary" size={12} accessabilityLabel={flight.cabinClass}>
                  {flight.cabinClass}
                </SkyboundText>
              </View>
            </View>
            <View style={styles.priceInfo}>
              <SkyboundText variant="blue" size={20} accessabilityLabel={`$${flight.price}`} style={{ fontWeight: 'bold', color: colors.link }}>
                ${flight.price}
              </SkyboundText>
              <SkyboundText variant="secondary" size={12} accessabilityLabel="round trip">
                round trip
              </SkyboundText>
            </View>
          </View>

          <View style={styles.flightDetails}>
            <View style={styles.timeBlock}>
              <SkyboundText variant="primaryBold" size={18} accessabilityLabel={flight.departureTime}>
                {flight.departureTime}
              </SkyboundText>
              <SkyboundText variant="secondary" size={12} accessabilityLabel={flight.departureCode}>
                {flight.departureCode}
              </SkyboundText>
            </View>

            <View style={styles.durationBlock}>
              <SkyboundText variant="secondary" size={12} accessabilityLabel={flight.duration}>
                {flight.duration}
              </SkyboundText>
              <View style={styles.flightLine}>
                <View style={[styles.line, { backgroundColor: colors.divider }]} />
                <Ionicons name="airplane" size={16} color={colors.link} />
                <View style={[styles.line, { backgroundColor: colors.divider }]} />
              </View>
              <SkyboundText variant="secondary" size={12} accessabilityLabel={flight.stops}>
                {flight.stops}
              </SkyboundText>
            </View>

            <View style={styles.timeBlock}>
              <SkyboundText variant="primaryBold" size={18} accessabilityLabel={flight.arrivalTime}>
                {flight.arrivalTime}
              </SkyboundText>
              <SkyboundText variant="secondary" size={12} accessabilityLabel={flight.arrivalCode}>
                {flight.arrivalCode}
              </SkyboundText>
            </View>
          </View>

          {flight.hasBaggage && (
            <View style={[styles.baggageBanner, { backgroundColor: colors.successBg, borderColor: '#DCFCE7' }]}>
              <Ionicons name="briefcase-outline" size={12} color={colors.successText} />
              <SkyboundText variant="primary" size={12} accessabilityLabel="Free Baggage Included" style={{ color: colors.successText }}>
                Free Baggage Included
              </SkyboundText>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.gradient} start={colors.gradientStart} end={colors.gradientEnd} style={{ flex: 1 }}>
        <View style={{ backgroundColor: colors.card }}>
          <SkyboundNavBar
            title="Outbound: CLE - LAX"
            leftHandIcon={<Ionicons name="arrow-back" size={22} color={colors.link} />}
            leftHandIconOnPressEvent={() => navigation.goBack()}
            rightHandFirstIcon={<Ionicons name="filter" size={22} color={colors.link} />}
            rightHandFirstIconOnPressEvent={() => setFilterModalVisible(true)}
            rightHandSecondIcon={<Ionicons name="swap-vertical" size={22} color={colors.link} />}
            rightHandSecondIconOnPressEvent={() => setSortModalVisible(true)}
          />
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <SkyboundText variant="secondary" size={14} accessabilityLabel="Nov 7 - Nov 12">
              Nov 7 - Nov 12
            </SkyboundText>
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={[styles.mapContainer, { backgroundColor: colors.surfaceMuted }]}>
          <View style={[styles.routeInfo, { backgroundColor: 'rgba(239, 246, 255, 0.95)' }]}>
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: colors.link }]} />
              <SkyboundText variant="primaryBold" size={14} accessabilityLabel="CLE">CLE</SkyboundText>
              <SkyboundText variant="secondary" size={12} accessabilityLabel="Cleveland">Cleveland</SkyboundText>
            </View>
            <View style={styles.routeCenter}>
              <View style={[styles.routeLine, { backgroundColor: colors.link }]} />
              <Ionicons name="airplane" size={20} color={colors.link} />
              <SkyboundText variant="secondary" size={12} accessabilityLabel="2,048 miles">2,048 miles</SkyboundText>
            </View>
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: colors.link }]} />
              <SkyboundText variant="primaryBold" size={14} accessabilityLabel="LAX">LAX</SkyboundText>
              <SkyboundText variant="secondary" size={12} accessabilityLabel="Los Angeles">Los Angeles</SkyboundText>
            </View>
          </View>
          <SkyboundText variant="secondary" size={12} accessabilityLabel="Map integration" style={{ textAlign: 'center', marginTop: 8 }}>
            Google Maps integration would display route here
          </SkyboundText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SkyboundText variant="secondary" size={14} accessabilityLabel={`${flights.length} flights found`} style={{ marginBottom: 16 }}>
            {flights.length} flights found
          </SkyboundText>

          {flights.slice(0, visibleCount).map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}

          {visibleCount < flights.length && (
            <Pressable style={styles.loadMoreButton} onPress={() => setVisibleCount(prev => prev + 4)}>
              <SkyboundText variant="blue" size={14} accessabilityLabel="Load more flights" style={{ color: colors.link }}>
                Load more flights
              </SkyboundText>
            </Pressable>
          )}
        </ScrollView>

        {/* Sort Modal */}
        <Modal visible={sortModalVisible} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setSortModalVisible(false)}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
              <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Sort by" style={{ marginBottom: 16 }}>
                Sort By
              </SkyboundText>
              
              {(['price', 'duration', 'stops'] as const).map((criteria) => (
                <View key={criteria}>
                  <Pressable
                    style={styles.sortOption}
                    onPress={() => sortFlights(criteria, 'asc')}
                  >
                    <SkyboundText variant="primary" size={16} accessabilityLabel={`${criteria} low to high`}>
                      {criteria.charAt(0).toUpperCase() + criteria.slice(1)} (Low to High)
                    </SkyboundText>
                    <Ionicons name="arrow-up" size={20} color={colors.icon} />
                  </Pressable>
                  <Pressable
                    style={styles.sortOption}
                    onPress={() => sortFlights(criteria, 'desc')}
                  >
                    <SkyboundText variant="primary" size={16} accessabilityLabel={`${criteria} high to low`}>
                      {criteria.charAt(0).toUpperCase() + criteria.slice(1)} (High to Low)
                    </SkyboundText>
                    <Ionicons name="arrow-down" size={20} color={colors.icon} />
                  </Pressable>
                </View>
              ))}

              <Pressable
                style={[styles.closeButton, { backgroundColor: colors.link }]}
                onPress={() => setSortModalVisible(false)}
              >
                <SkyboundText variant="primary" size={16} accessabilityLabel="Close" style={{ color: '#FFF' }}>
                  Close
                </SkyboundText>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Filter Modal */}
        <Modal visible={filterModalVisible} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
              <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Filter flights" style={{ marginBottom: 16 }}>
                Filter Flights
              </SkyboundText>

              <View style={styles.filterSection}>
                <SkyboundText variant="primary" size={16} accessabilityLabel="Maximum stops">
                  Maximum Stops: {maxStops}
                </SkyboundText>
                <View style={styles.filterButtons}>
                  {[0, 1, 2].map((num) => (
                    <Pressable
                      key={num}
                      style={[
                        styles.filterChip,
                        { backgroundColor: maxStops === num ? colors.link : colors.surfaceMuted }
                      ]}
                      onPress={() => setMaxStops(num)}
                    >
                      <SkyboundText
                        variant="primary"
                        size={14}
                        accessabilityLabel={`${num} stops`}
                        style={{ color: maxStops === num ? '#FFF' : colors.text }}
                      >
                        {num}
                      </SkyboundText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <SkyboundText variant="primary" size={16} accessabilityLabel="Maximum duration">
                  Maximum Duration: {maxDuration}h
                </SkyboundText>
                <View style={styles.filterButtons}>
                  {[5, 8, 10, 12].map((num) => (
                    <Pressable
                      key={num}
                      style={[
                        styles.filterChip,
                        { backgroundColor: maxDuration === num ? colors.link : colors.surfaceMuted }
                      ]}
                      onPress={() => setMaxDuration(num)}
                    >
                      <SkyboundText
                        variant="primary"
                        size={14}
                        accessabilityLabel={`${num} hours`}
                        style={{ color: maxDuration === num ? '#FFF' : colors.text }}
                      >
                        {num}h
                      </SkyboundText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                style={[styles.closeButton, { backgroundColor: colors.link }]}
                onPress={() => {
                  // Apply filters here
                  setFilterModalVisible(false);
                }}
              >
                <SkyboundText variant="primary" size={16} accessabilityLabel="Apply filters" style={{ color: '#FFF' }}>
                  Apply Filters
                </SkyboundText>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 160,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  routePoint: {
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
  },
  routeLine: {
    height: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  flightCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  airlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  airlineLogo: {
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBlock: {
    alignItems: 'center',
    gap: 4,
  },
  durationBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
  },
  flightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
  },
  baggageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    marginTop: 4,
  },
  loadMoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});