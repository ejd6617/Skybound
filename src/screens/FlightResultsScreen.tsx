import DisplayMap from "@/components/ui/DisplayMap";
import { Flight, FlightLeg, TravelClass } from "@/skyboundTypes/SkyboundAPI";
import SkyboundText from "@components/ui/SkyboundText";
import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StackActions, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getURL, reviveDates, skyboundRequest } from "@src/api/SkyboundUtils";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import LoadingScreen from "@src/screens/LoadingScreen";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from "react-native";

export interface SearchDetails {
  tripType?: 'one-way' | 'round-trip' | 'multi-city';
  fromCode?: string;
  toCode?: string;
  departureDate?: Date | string | null;
  returnDate?: Date | string | null;
  legsCount?: number;
  legsDates?: (Date | string | null)[];
  silentTransition?: boolean;
}

export interface FlightFilters {
  stops?: 'nonstop' | '1-stop' | '2plus';
  maxPrice?: number;
  departureTimes?: string[];
  arrivalTimes?: string[];
  cabinClass?: string;
  maxDurationHours?: number;
  airlines?: string[];
}

export interface PlannedLeg {
  fromCode?: string;
  toCode?: string;
  date?: Date | string | null;
}

export interface ItineraryPayload {
  flights: UIFlight[];
  searchDetails?: SearchDetails;
  traveler?: any | null;
  paymentMethodId?: string | null;
  totalPrice?: number;
}

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

export interface UIFlight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineColor: string;
  category?: 'best' | 'cheapest' | 'fastest';
  price: number;
  cabinClass: string;
  cabinClassCode?: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  departureCode: string;
  arrivalCode: string;
  duration: string;
  totalDurationMinutes?: number;
  rawDepartureTime?: Date;
  rawArrivalTime?: Date;
  stops: string;
  hasBaggage?: boolean;
  legs?: FlightLeg[];
}

// output example: 8:30 AM
function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}

// output example: Oct 25
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return new Date(date).toLocaleString('en-US', options);
}

// output example: 10h 22m
function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h ${minutes}m`;
}

function matchesTimeSlot(date: Date | undefined, slots: string[] | undefined) {
  if (!date || !slots || slots.length === 0) return true;
  const hour = date.getHours();
  const slotForHour = () => {
    if (hour < 6) return 'early-morning';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };
  const bucket = slotForHour();
  return slots.includes(bucket);
}

// output example: 1 stop ATL
function formatStops(legs: FlightLeg[]): string {
  const stopCount = Math.max(legs.length - 1, 0);
  if (stopCount === 0) return 'Non-stop';
  if (stopCount === 1) return `${stopCount} stop ${legs[0]?.to.iata ?? ''}`.trim();
  return `${stopCount} stops`;
}

// convert api flights to local flight datatype
function toUIFlights(data: Flight[]): UIFlight[] {
  let flights: UIFlight[] = data.map((flight: Flight, index) => {
    // Placeholder values for missing fields
    const id = (index + 1).toString();
    const airlineColor = '#1E40AF'; // Placeholder airline color (JetBlue)

    const outboundLength = flight.outbound.length;
    const firstOutbound = flight.outbound[0];
    const lastOutbound = flight.outbound[outboundLength-1];
    
    const totalDuration = flight.outboundDuration;
    
    const findMostCommonTravelClass = (legs: FlightLeg[]): TravelClass | undefined => {
        if (!legs || legs.length === 0) {
            return "ECONOMY";
        }

        const classCounts = legs.reduce((counts, leg) => {
            const key = leg.travelClass;
            counts[key] = (counts[key] || 0) + 1;
            return counts;
        }, {} as Record<TravelClass, number>);

        const mostCommonClass = Object.keys(classCounts).reduce((a, b) => {
            return classCounts[a as TravelClass] > classCounts[b as TravelClass] ? a : b;
        }) as TravelClass;

        return mostCommonClass;
    }

    const travelClass: TravelClass | undefined = findMostCommonTravelClass(flight.outbound);
    
    // Return the formatted flight object
    return {
      id,
      airline: flight.airline.name,
      airlineCode: flight.airline.iata,
      airlineColor,
      price: flight.price,
      cabinClass: travelClass,
      cabinClassCode: findMostCommonTravelClass(flight.outbound),
      departureTime: formatTime(firstOutbound.departureTime),
      arrivalTime: formatTime(lastOutbound.arrivalTime),
      departureDate: formatDate(firstOutbound.departureTime),
      arrivalDate: formatDate(firstOutbound.arrivalTime),
      departureCode: firstOutbound.from.iata,
      arrivalCode: lastOutbound.to.iata,
      duration: formatDuration(totalDuration),
      totalDurationMinutes: totalDuration,
      rawDepartureTime: firstOutbound.departureTime,
      rawArrivalTime: lastOutbound.arrivalTime,
      stops: formatStops(flight.outbound),
      hasBaggage: flight.freeBaggage,
      legs: flight.outbound,
    };
  });
  
  // Shuffle
  for (let i = flights.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flights[i], flights[j]] = [flights[j], flights[i]];
  }
  
  return flights;
};

function applyFilters(list: UIFlight[], filters: FlightFilters): UIFlight[] {
  return list.filter(flight => {
    if (filters.maxPrice && flight.price > filters.maxPrice) return false;
    if (filters.stops) {
      const stopCount = flight.stops.toLowerCase().includes('non')
        ? 0
        : parseInt(flight.stops) || (flight.stops.toLowerCase().includes('1 stop') ? 1 : 2);

      if (filters.stops === 'nonstop' && stopCount !== 0) return false;
      if (filters.stops === '1-stop' && stopCount !== 1) return false;
      if (filters.stops === '2plus' && stopCount < 2) return false;
    }
    if (filters.cabinClass && flight.cabinClassCode && flight.cabinClassCode.toLowerCase() !== filters.cabinClass.toLowerCase()) return false;
    if (filters.maxDurationHours && flight.totalDurationMinutes && flight.totalDurationMinutes > filters.maxDurationHours * 60) return false;
    if (!matchesTimeSlot(flight.rawDepartureTime, filters.departureTimes)) return false;
    if (!matchesTimeSlot(flight.rawArrivalTime, filters.arrivalTimes)) return false;
    if (filters.airlines?.length && !filters.airlines.includes(flight.airlineCode)) return false;
    return true;
  });
}

function sortFlights(list: UIFlight[], criteria: 'recommended'|'price'|'duration'|'stops', direction: 'asc'|'desc') {
  const sorted = [...list].sort((a, b) => {
    let cmp = 0;
    if (criteria === 'recommended' || criteria === 'price') {
      cmp = a.price - b.price;
    } else if (criteria === 'duration') {
      const m = (s:string)=>{const [h,m]=s.replace('h','').replace('m','').split(' ').map(n=>parseInt(n));return h*60+m;};
      cmp = m(a.duration) - m(b.duration);
    } else if (criteria === 'stops') {
      const n = (s:string)=> s.includes('Nonstop') ? 0 : parseInt(s) || 1;
      cmp = n(a.stops) - n(b.stops);
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

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
  const {
    searchResults,
    tripType,
    fromCode,
    toCode,
    departureDate,
    returnDate,
    legsCount,
    legsDates,
    searchLegs,
    legIndex = 0,
    selections = [],
    filters: incomingFilters,
    silentTransition,
  } = route.params as SearchDetails & { searchResults: Flight[]; searchLegs?: PlannedLeg[]; legIndex?: number; selections?: UIFlight[]; filters?: FlightFilters };

  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [baseFlights, setBaseFlights] = useState<UIFlight[]>(toUIFlights(reviveDates(searchResults)));
  const [visibleCount, setVisibleCount] = useState(3);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended'|'price'|'duration'|'stops'>('recommended');
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('asc');
  const [appliedFilters, setAppliedFilters] = useState<FlightFilters>(incomingFilters ?? {} as FlightFilters);
  const [activeFlightId, setActiveFlightId] = useState<string | null>(null);
  const [advancingLeg, setAdvancingLeg] = useState<PlannedLeg | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ animation: silentTransition ? 'none' : 'default' });
  }, [navigation, silentTransition]);

  useEffect(() => {
    setBaseFlights(toUIFlights(reviveDates(searchResults)));
    setVisibleCount(3);
  }, [searchResults]);

  useEffect(() => {
    if (incomingFilters) {
      setAppliedFilters(incomingFilters);
    }
  }, [incomingFilters]);

  const filteredFlights = useMemo(() => applyFilters(baseFlights, appliedFilters), [appliedFilters, baseFlights]);
  const sortedFlights = useMemo(() => sortFlights(filteredFlights, sortBy, sortDirection), [filteredFlights, sortBy, sortDirection]);
  const flights = sortedFlights;
  const canLoadMore = visibleCount < flights.length;

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

  const selectedFlight = flights.find(f => f.id === activeFlightId) ?? flights[0];
  const waypointCodes = useMemo(() => {
    if (selectedFlight?.legs?.length) {
      const orderedStops = [selectedFlight.legs[0].from.iata, ...selectedFlight.legs.map(l => l.to.iata)];
      return orderedStops;
    }
    const codes = [fromCode, toCode].filter(Boolean) as string[];
    return codes.length >= 2 ? codes : undefined;
  }, [fromCode, selectedFlight?.legs, toCode]);

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
    return (flights[0] === undefined)
      ? "No flights found"
      : `Outbound: ${flights[0].departureCode} to ${flights[0].arrivalCode}`;
  }
  const formattedDateRange = useMemo<string>(() => {
    const formatDate = (value?: Date | string | null) => {
      if (!value) return '';
      const dateObj = typeof value === 'string' ? new Date(value) : value;
      return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const start = formatDate(departureDate);
    const end = tripType === 'round-trip' ? formatDate(returnDate) : '';

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start;
  }, [departureDate, returnDate, tripType]);

  const currentLegLabel = useMemo(() => {
    if (searchLegs?.[legIndex]) {
      return `${searchLegs[legIndex].fromCode ?? ''} → ${searchLegs[legIndex].toCode ?? ''}`.trim();
    }
    if (fromCode && toCode) {
      return `${fromCode} → ${toCode}`;
    }
    return '';
  }, [fromCode, legIndex, searchLegs, toCode]);

  const normalizeDateValue = (value?: Date | string | null) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value.toISOString();
  };
  
  
  const generateFlightOverview = () => {
    if (flights[0] === undefined) {
      return <View></View>
    }

    const sourceAirport: string = flights[0].departureCode;
    const destAirport: string = flights[0].arrivalCode;
    return <View style={[styles.routeInfo, { backgroundColor: 'rgba(239, 246, 255, 0.95)' }]}>
      <View style={[styles.routePoint, { width: 96 }]}>
        <View style={[styles.dot, { backgroundColor: colors.link }]} />
        <SkyboundText variant="primaryBold" size={14} accessabilityLabel={sourceAirport}>{sourceAirport}</SkyboundText>
        {/* <SkyboundText variant="secondary" size={12} accessabilityLabel="Cleveland">Cleveland</SkyboundText> */}
      </View>
      <View style={styles.routeCenter}>
        <View style={[styles.routeLine, { backgroundColor: colors.link }]} />
        <Ionicons name="airplane" size={20} color={colors.link} />
        {/* <SkyboundText variant="secondary" size={12} accessabilityLabel="2,048 miles">2,048 miles</SkyboundText> */}
      </View>
      <View style={[styles.routePoint, { width: 96 }]}>
        <View style={[styles.dot, { backgroundColor: colors.link }]} />
        <SkyboundText variant="primaryBold" size={14} accessabilityLabel={destAirport}>{destAirport}</SkyboundText>
        {/* <SkyboundText variant="secondary" size={12} accessabilityLabel="Los Angeles">Los Angeles</SkyboundText> */}
      </View>
    </View>
  };
  
  function sortFlights(list: UIFlight[], criteria: 'recommended'|'price'|'duration'|'stops', direction: 'asc'|'desc') {
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (criteria === 'recommended' || criteria === 'price') {
        cmp = a.price - b.price;
      } else if (criteria === 'duration') {
        const m = (s:string)=>{const [h,m]=s.replace('h','').replace('m','').split(' ').map(n=>parseInt(n));return h*60+m;};
        cmp = m(a.duration) - m(b.duration);
      } else if (criteria === 'stops') {
        const n = (s:string)=> s.includes('Nonstop') ? 0 : parseInt(s) || 1;
        cmp = n(a.stops) - n(b.stops);
      }
      return direction === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }

  const updateSort = (criteria: 'recommended'|'price'|'duration'|'stops', direction: 'asc'|'desc') => {
    setSortBy(criteria);
    setSortDirection(direction);
  };

  const toggleDirection = () => setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
  const arrowFor = (crit: typeof sortBy) => (sortBy === crit && sortDirection === 'desc') ? 'arrow-down' : 'arrow-up';

  useEffect(() => {
    navigation.setOptions({ title: generateTitle()});
  }, [flights, navigation, colors])

  const FlightCard = ({ flight }: { flight: UIFlight }) => {
    const badge = getCategoryBadge(flight.category);
    const slideAnim = React.useRef(new Animated.Value(0)).current;
    const isActive = activeFlightId === flight.id;

    useEffect(() => {
      Animated.timing(slideAnim, {
        toValue: isActive ? 1 : 0,
        duration: 220,
        easing: isActive ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, [isActive, slideAnim]);

    const slideStyles = useMemo(() => ({
      opacity: slideAnim,
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-10, 0],
          }),
        },
      ],
      height: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }),
      marginTop: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }),
    }), [slideAnim]);

    const handlePressCard = () => {
      setActiveFlightId(prev => prev === flight.id ? null : flight.id);
    };

    const handleChooseFlight = async () => {
      const nextSelections = [...selections, flight];
      const legsPlan = searchLegs ?? [];

      if (legsPlan.length > 0 && legIndex < legsPlan.length - 1) {
        const nextLeg = legsPlan[legIndex + 1];
        setAdvancingLeg(nextLeg);
        try {
          const nextResults = await skyboundRequest('searchFlightsOneWay', {
            originAirportIATA: nextLeg.fromCode,
            destinationAirportIATA: nextLeg.toCode,
            date: nextLeg.date,
          });

          navigation.dispatch(StackActions.replace('FlightResults', {
            searchResults: nextResults,
            tripType,
            fromCode: nextLeg.fromCode,
            toCode: nextLeg.toCode,
            departureDate: legsPlan[0]?.date ?? departureDate,
            returnDate: legsPlan[legsPlan.length - 1]?.date ?? returnDate,
            legsCount: legsPlan.length,
            legsDates: legsPlan.map(l => l.date ?? null),
            searchLegs: legsPlan,
            legIndex: legIndex + 1,
            selections: nextSelections,
            filters: appliedFilters,
            silentTransition: true,
          }));
        } catch (error) {
          setAdvancingLeg(null);
          throw error;
        }
        return;
      }

      const itinerary: ItineraryPayload = {
        flights: nextSelections,
        searchDetails: {
          tripType,
          fromCode: legsPlan[0]?.fromCode ?? fromCode ?? flight.departureCode,
          toCode: legsPlan[legsPlan.length - 1]?.toCode ?? toCode ?? flight.arrivalCode,
          departureDate: normalizeDateValue(legsPlan[0]?.date ?? departureDate ?? null),
          returnDate: normalizeDateValue(legsPlan[legsPlan.length - 1]?.date ?? returnDate ?? null),
          legsCount: legsPlan.length || legsCount,
          legsDates: (legsPlan.length ? legsPlan.map(l => normalizeDateValue(l.date ?? null)) : legsDates?.map(normalizeDateValue)),
        },
      };
      navigation.navigate('FlightSummary', { itinerary });
    };

    return (
      <Pressable
        style={[styles.flightCard, { backgroundColor: colors.card }]}
        onPress={handlePressCard}
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
              <View style={{height: 25, width: 100, justifyContent: 'center', alignItems: 'flex-start' }}>
                <Image
                  source={{ uri: `${getURL()}/logos/${flight.airlineCode}.png` }}
                  style={{ height: '100%', width: '100%'}}
                  resizeMode="contain"
                />
                {/* <SkyboundText variant="primary" size={12} accessabilityLabel={flight.airlineCode} style={{ color: '#FFF', fontWeight: 'bold' }}>
                  {flight.airlineCode}
                </SkyboundText> */}
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

          <Animated.View style={[styles.chooseFlightContainer, slideStyles]}>
            <Pressable
              style={[styles.chooseFlightButton, { backgroundColor: colors.link }]}
              onPress={handleChooseFlight}
            >
              <SkyboundText variant="primaryBold" size={16} style={{ color: '#FFFFFF' }}>
                Choose flight
              </SkyboundText>
            </Pressable>
          </Animated.View>

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

  const generateDateRangeHeader = () => {
    
    const startDate: string = (departureDate)
      ? formatDate(new Date(departureDate))
      : "";

    const endDate: string = (returnDate)
      ? formatDate(new Date(returnDate))
      : "";

    const dateRange: string = [startDate, endDate]
      .map(s => s?.trim() || '')
      .filter(s => s.length > 0)
      .join(' - ');

    return (
      <View style={{ backgroundColor: colors.card, marginTop: 15 }}>
        <View style={{ paddingBottom: 8 }}>
          <SkyboundText
            variant="secondary"
            size={14}
            accessabilityLabel={dateRange}
            style={{ textAlign: 'center' }}
          >
            {dateRange}
          </SkyboundText>
        </View>
      </View>
    )
  };

  return (
    <View style={styles.container}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={{ backgroundColor: colors.card, marginTop: 15 }}>
            <View style={{ paddingBottom: 8 }}>
              <SkyboundText
                variant="secondary"
                size={14}
                accessabilityLabel={formattedDateRange}
                style={{ textAlign: 'center' }}
              >
                {formattedDateRange}
              </SkyboundText>
              {currentLegLabel ? (
                <SkyboundText
                  variant="primaryBold"
                  size={16}
                  style={{ textAlign: 'center', marginTop: 4 }}
                >
                  {currentLegLabel}
                </SkyboundText>
              ) : null}
              {searchLegs?.length && searchLegs.length > 1 && (
                <SkyboundText
                  variant="secondary"
                  size={12}
                  style={{ textAlign: 'center', marginTop: 4 }}
                >
                  Selecting leg {Math.min(legIndex + 1, searchLegs.length)} of {searchLegs.length}
                </SkyboundText>
              )}
          </View>
        </View>

        <View style={[styles.mapContainer, { backgroundColor: colors.surfaceMuted }]}>
          <DisplayMap
            sourceAirportCode={waypointCodes?.[0]}
            destAirportCode={waypointCodes ? waypointCodes[waypointCodes.length - 1] : undefined}
            waypointCodes={waypointCodes?.slice(1, -1)}
            mapHeight={200}
            mapWidth={screenWidth - 32}
          />
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

        {advancingLeg && (
          <Modal visible transparent={false} animationType="fade">
            <View style={{ flex: 1 }}>
              <LoadingScreen />
              <View style={styles.loadingMeta}>
                <SkyboundText variant="primaryBold" size={18} style={{ marginBottom: 6, textAlign: 'center' }}>
                  Loading next flight
                </SkyboundText>
                <SkyboundText variant="secondary" size={14} style={{ textAlign: 'center' }}>
                  Preparing {advancingLeg.fromCode} → {advancingLeg.toCode}
                </SkyboundText>
              </View>
            </View>
          </Modal>
        )}

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
                onPress={() => { setSortBy('recommended'); setSortDirection('asc'); updateSort('recommended','asc'); }}
              >
                <SkyboundText size={16}>Recommended</SkyboundText>
              </Pressable>

              {(['price','duration','stops'] as const).map(crit => (
                <Pressable
                  key={crit}
                  style={styles.sortOption}
                  onPress={() => { 
                    const dir = (sortBy === crit) ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
                    updateSort(crit, dir);
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
    margin: 16,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // lets the fade overlay hug edges nicely
  },

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
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
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

  chooseFlightContainer: {
    overflow: 'hidden',
    width: '100%',
    justifyContent: 'center',
  },
  chooseFlightButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
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
  loadingMeta: {
    position: 'absolute',
    bottom: 80,
    left: 24,
    right: 24,
  }
});