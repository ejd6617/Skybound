import { Flight, FlightLeg } from "@/skyboundTypes/SkyboundAPI";
import SkyboundNavBar from "@components/ui/SkyboundNavBar";
import SkyboundText from "@components/ui/SkyboundText";
import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from "react-native";

const bgWithAlpha = (hex: string, a: number) => {
  const raw = hex.replace('#', '');
  const expand = raw.length === 3
    ? raw.split('').map(c => c + c).join('')
    : raw;
  const r = parseInt(expand.slice(0, 2), 16);
  const g = parseInt(expand.slice(2, 4), 16);
  const b = parseInt(expand.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

interface UIFlight {
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

// output example: 8:30 AM
function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}

// output example: 10h 22m
function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h ${minutes}m`;
}

// output example: 1 stop ATL
function formatStops(legs: FlightLeg[]): string {
  const numStops: number = legs.length;
  return (numStops == 0) ? 'Nonstop'
  : (numStops == 1) ? `${numStops} stop ${legs[0].from.iata}`
  : `${numStops} stops`;
}

// Convert API flights to local flight datatype
function toUIFlights(data: Flight[]): UIFlight[] {
  let flights: UIFlight[] = data.map((flight: Flight, index) => {
    // Placeholder values for missing fields
    const id = (index + 1).toString();
    const airlineColor = '#1E40AF'; // Placeholder airline color (JetBlue)

    const outboundLength = flight.outbound.length
    const firstOutbound = flight.outbound[0];
    const lastOutbound = flight.outbound[outboundLength-1];
    
    const totalDuration = flight.outbound.reduce((sum, leg) => sum + leg.duration, 0);
    
    // Return the formatted flight object
    return {
      id,
      airline: flight.airline.name,
      airlineCode: flight.airline.iata,
      airlineColor,
      price: flight.price,
      cabinClass: flight.class,
      departureTime: formatTime(firstOutbound.departureTime),
      arrivalTime: formatTime(lastOutbound.arrivalTime),
      departureCode: firstOutbound.from.iata,
      arrivalCode: lastOutbound.to.iata,
      duration: formatDuration(totalDuration),
      stops: formatStops(flight.outbound),
      hasBaggage: flight.freeBaggage,
    };
  });
  
  // Shuffle
  for (let i = flights.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flights[i], flights[j]] = [flights[j], flights[i]];
  }
  
  return flights;
};

const MOCK_FLIGHTS: UIFlight[] = [
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
  const route = useRoute();
  const {searchResults} = route.params;
  
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [flights, setFlights] = useState<UIFlight[]>(toUIFlights(searchResults));
  const [visibleCount, setVisibleCount] = useState(3);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended'|'price'|'duration'|'stops'>('recommended');
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('asc');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const canLoadMore = visibleCount < flights.length;
  
  // Filter states
  const [maxStops, setMaxStops] = useState(2);
  const [maxDuration, setMaxDuration] = useState(10);

  const overlayOp = React.useRef(new Animated.Value(0)).current;
  const sheetY = React.useRef(new Animated.Value(40)).current;

  function openSortSheet() {
    setSortModalVisible(true);
    Animated.parallel([
      Animated.timing(overlayOp, { toValue: 1, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(sheetY,     { toValue: 0, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }

  function closeSortSheet() {
    Animated.parallel([
      Animated.timing(overlayOp, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(sheetY,     { toValue: 40, duration: 180, useNativeDriver: true }),
    ]).start(() => setSortModalVisible(false));
  }

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
  
  const generateTitle = () => {
    return `Outbound: ${flights[0].departureCode} to ${flights[0].arrivalCode}`
  }

  const sortFlights = (criteria: 'recommended'|'price'|'duration'|'stops', direction: 'asc'|'desc') => {
    const sorted = [...flights].sort((a, b) => {
      let cmp = 0;
      if (criteria === 'recommended' || criteria === 'price') {
        cmp = a.price - b.price;                       // default “recommended”: price asc
      } else if (criteria === 'duration') {
        const m = (s:string)=>{const [h,m]=s.replace('h','').replace('m','').split(' ').map(n=>parseInt(n));return h*60+m;};
        cmp = m(a.duration) - m(b.duration);
      } else if (criteria === 'stops') {
        const n = (s:string)=> s.includes('Nonstop') ? 0 : parseInt(s) || 1;
        cmp = n(a.stops) - n(b.stops);
      }
      return direction === 'asc' ? cmp : -cmp;
    });
    setFlights(sorted);
    setSortBy(criteria);
    setSortDirection(direction);
  };
  const toggleDirection = () => setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
  const arrowFor = (crit: typeof sortBy) => (sortBy === crit && sortDirection === 'desc') ? 'arrow-down' : 'arrow-up';

  const FlightCard = ({ flight }: { flight: Flight }) => {
    const badge = getCategoryBadge(flight.category);

    return (
      <Pressable 
        style={[styles.flightCard, { backgroundColor: colors.card }]}
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
            <View style={styles.baggageBanner}>
              <Ionicons name="briefcase-outline" size={12} color="#FFFFFF" />
              <SkyboundText variant="primary" size={12} style={{ color: '#FFFFFF' }}>
                Free Baggage Included
              </SkyboundText>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ backgroundColor: colors.card, marginTop: 15 }}>
          <SkyboundNavBar
            title={generateTitle()}
            leftHandIcon={<Ionicons name="arrow-back" size={22} color={colors.link} />}
            leftHandIconOnPressEvent={() => navigation.goBack()}
            rightHandFirstIcon={<Ionicons name="filter" size={22} color={colors.link} />}
            rightHandFirstIconOnPressEvent={() => navigation.navigate('FilterScreen')}
            rightHandSecondIcon={<Ionicons name="swap-vertical" size={22} color={colors.link} />}
            rightHandSecondIconOnPressEvent={() => openSortSheet()}
          />
          <View style={{ paddingBottom: 8 }}>
            <SkyboundText
              variant="secondary"
              size={14}
              accessabilityLabel="Nov 7 - Nov 12"
              style={{ textAlign: 'center' }}
            >
              Nov 7 - Nov 12
            </SkyboundText>
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={[styles.mapContainer, { backgroundColor: colors.surfaceMuted }]}>
          <View style={[styles.routeInfo, { backgroundColor: 'rgba(239, 246, 255, 0.95)' }]}>
            <View style={[styles.routePoint, { width: 96 }]}>
              <View style={[styles.dot, { backgroundColor: colors.link }]} />
              <SkyboundText variant="primaryBold" size={14} accessabilityLabel="CLE">CLE</SkyboundText>
              <SkyboundText variant="secondary" size={12} accessabilityLabel="Cleveland">Cleveland</SkyboundText>
            </View>
            <View style={styles.routeCenter}>
              <View style={[styles.routeLine, { backgroundColor: colors.link }]} />
              <Ionicons name="airplane" size={20} color={colors.link} />
              <SkyboundText variant="secondary" size={12} accessabilityLabel="2,048 miles">2,048 miles</SkyboundText>
            </View>
            <View style={[styles.routePoint, { width: 96 }]}>
              <View style={[styles.dot, { backgroundColor: colors.link }]} />
              <SkyboundText variant="primaryBold" size={14} accessabilityLabel="LAX">LAX</SkyboundText>
              <SkyboundText variant="secondary" size={12} accessabilityLabel="Los Angeles">Los Angeles</SkyboundText>
            </View>
          </View>
          <SkyboundText variant="secondary" size={12} accessabilityLabel="Map integration" style={{ textAlign: 'center', marginTop: 40, marginBottom: -10 }}>
            Google Maps integration would display route here
          </SkyboundText>
        </View>

        <View style={styles.resultsWrapper}>
          <View style={styles.resultsFadeOverlay} pointerEvents="none">
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              colors={[bgWithAlpha(colors.background, 0.98), bgWithAlpha(colors.background, 0)]}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <SkyboundText variant="secondary" size={14} style={{ marginTop: 35, marginBottom: 16 }}>
              {flights.length} flights found
            </SkyboundText>

            {flights.slice(0, visibleCount).map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}

            {visibleCount < flights.length && (
              <Pressable
                style={[
                  styles.loadMoreButton,
                  !canLoadMore && { opacity: 0.5 }
                ]}
                disabled={!canLoadMore}
                onPress={() => setVisibleCount(prev => Math.min(prev + 4, flights.length))}
              >
                <SkyboundText variant="primaryBold" size={16} style={{ color: '#FFFFFF' }}>
                  {canLoadMore ? 'Load More Flights' : 'No More Flights'}
                </SkyboundText>
              </Pressable>
            )}
          </ScrollView>
        </View>

        {/* Filter Modal */}
        <Modal visible={sortModalVisible} transparent animationType="none">
          <Animated.View style={[styles.animatedOverlay, { opacity: overlayOp }]}>
            <Pressable style={{ flex:1 }} onPress={closeSortSheet} />
          </Animated.View>

          <Animated.View
            style={[
              styles.animatedSheetWrap,
              { transform: [{ translateY: sheetY }] }
            ]}
          >
            <View style={[styles.sheet, { backgroundColor: colors.card }]}>
              <SkyboundText variant="primaryBold" size={18} style={{ marginBottom: 16 }}>Sort By</SkyboundText>

              <Pressable
                style={styles.sortOption}
                onPress={() => { setSortBy('recommended'); setSortDirection('asc'); sortFlights('recommended','asc'); }}
              >
                <SkyboundText size={16}>Recommended</SkyboundText>
              </Pressable>

              {(['price','duration','stops'] as const).map(crit => (
                <Pressable
                  key={crit}
                  style={styles.sortOption}
                  onPress={() => { 
                    const dir = (sortBy === crit) ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
                    sortFlights(crit, dir);
                  }}
                >
                  <SkyboundText size={16} style={{ textTransform:'capitalize' }}>{crit}</SkyboundText>
                  <Ionicons name={arrowFor(crit)} size={20} color={colors.icon} />
                </Pressable>
              ))}

              <Pressable style={[styles.closeButton, { backgroundColor: colors.link }]} onPress={closeSortSheet}>
                <SkyboundText size={16} style={{ color:'#FFF' }}>Close</SkyboundText>
              </Pressable>
            </View>
          </Animated.View>
        </Modal>
      </View>
    </View>
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
    overflow: 'hidden', // lets the fade overlay hug edges nicely
  },

  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  routePoint: { alignItems: 'center', gap: 4 },
  routeCenter: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: 16 },
  routeLine: { height: 1, width: '100%' },

  fadeUnderMap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: -1,
    height: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  resultsWrapper: {
    flex: 1,
    position: 'relative',
  },
  resultsFadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50, // adjust strength of fade
    zIndex: 1,
  },

  scrollContent: { padding: 16, paddingTop: 0 },

  flightCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cardContent: { padding: 16, gap: 12, },
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
    backgroundColor: '#16A34A',
    marginTop: 4,
  },
  loadMoreButton: {
    marginTop: 8,
    marginBottom: 32,
    alignSelf: 'center',
    backgroundColor: '#0071E2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0071E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,            
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
  animatedOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(19, 3, 3, 0.5)',
  },
  animatedSheetWrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    backgroundColor: '#FFF',
  },
  sheet: { },
});