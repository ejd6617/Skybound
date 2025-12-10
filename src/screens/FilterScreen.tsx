import { useColors } from '@constants/theme';
import Slider from '@react-native-community/slider';
import type { RouteProp } from '@react-navigation/native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@src/nav/RootNavigator';
import type { FlightFilters, UIFlight } from '@src/screens/FlightResultsScreen';
import { applyFilters } from '@src/screens/FlightResultsScreen';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const CloseIcon = ({ color = '#000' }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DEFAULT_FILTERS: FlightFilters = {
  stops: undefined,
  maxPrice: undefined,
  departureTimes: [],
  arrivalTimes: [],
  cabinClass: undefined,
  maxDurationHours: 24,
  airlines: [],
};

const ALLIANCE_AIRLINES: Record<string, string[]> = {
  'star-alliance': ['AC', 'AD', 'A3', 'AI', 'AV', 'BR', 'CA', 'CM', 'ET', 'LH', 'LO', 'NH', 'NZ', 'OS', 'OU', 'OZ', 'SK', 'SQ', 'SN', 'TP', 'TG', 'TK', 'UA'],
  skyteam: ['AF', 'AM', 'AR', 'AZ', 'CI', 'CZ', 'DL', 'GA', 'KE', 'KQ', 'KL', 'MEA', 'MF', 'MU', 'OK', 'RO', 'SU', 'VN', 'WS', 'XY'],
  oneworld: ['AS', 'AA', 'BA', 'CX', 'FJ', 'AY', 'IB', 'JL', 'MH', 'WY', 'QF', 'QR', 'AT', 'RJ', 'UL'],
};

const formatAirlineName = (value?: string, fallback = '') => {
  const safeValue = value?.trim() ?? fallback;
  if (!safeValue) {
    return '';
  }

  return safeValue
    .toLowerCase()
    .split(/([\s-]+)/)
    .map(part => (/^[a-z]/.test(part) ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join('');
};

export default function FilterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FilterScreen'>>();
  const colors = useColors();

  const availableFlights = route.params?.availableFlights ?? [] as UIFlight[];
  const priceCeilingFromResults = useMemo(
    () => Math.max(...availableFlights.map(f => Math.floor(f.price)), 0),
    [availableFlights]
  );
  const priceCeiling = priceCeilingFromResults > 0 ? priceCeilingFromResults : 2000;
  const initialFilters = route.params?.filters ?? DEFAULT_FILTERS;

  const availableAirlines = useMemo(() => {
    const map = new Map<string, string>();
    availableFlights.forEach(flight => {
      map.set(flight.airlineCode, formatAirlineName(flight.airline, flight.airlineCode));
    });
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [availableFlights]);

  const allAvailableCodes = useMemo(() => availableAirlines.map(a => a.code), [availableAirlines]);
  const initialAirlines = initialFilters.airlines?.length ? initialFilters.airlines : allAvailableCodes;

  const [stops, setStops] = useState<'nonstop' | '1-stop' | '2plus' | 'any'>(initialFilters.stops ?? 'any');
  const [priceRange, setPriceRange] = useState(initialFilters.maxPrice ?? priceCeiling);
  const [departureTime, setDepartureTime] = useState<string[]>(initialFilters.departureTimes ?? []);
  const [arrivalTime, setArrivalTime] = useState<string[]>(initialFilters.arrivalTimes ?? []);
  const [cabinClass, setCabinClass] = useState(initialFilters.cabinClass ?? 'any');
  const [duration, setDuration] = useState(initialFilters.maxDurationHours ?? 24);
  const [alliance, setAlliance] = useState<string[]>([]);
  const [airlines, setAirlines] = useState<string[]>(initialAirlines);
  const [selectAllAirlines, setSelectAllAirlines] = useState(initialAirlines.length === allAvailableCodes.length && allAvailableCodes.length > 0);

  useEffect(() => {
    if (priceRange > priceCeiling) {
      setPriceRange(priceCeiling);
    }
  }, [priceCeiling, priceRange]);

  useEffect(() => {
    if (airlines.length === allAvailableCodes.length && allAvailableCodes.length > 0) {
      setSelectAllAirlines(true);
    } else if (selectAllAirlines && airlines.length !== allAvailableCodes.length) {
      setSelectAllAirlines(false);
    }
  }, [airlines, allAvailableCodes, selectAllAirlines]);

  const toggleTimeSlot = (list: string[], setList: (val: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const toggleAirline = (code: string) => {
    setSelectAllAirlines(false);
    setAirlines(prev => prev.includes(code) ? prev.filter(a => a !== code) : [...prev, code]);
  };

  const toggleAlliance = (value: string) => {
    const isSelected = alliance.includes(value);
    const allianceMembers = (ALLIANCE_AIRLINES[value] ?? []).filter(code => allAvailableCodes.includes(code));

    setAlliance(prev => isSelected ? prev.filter(a => a !== value) : [...prev, value]);
    setSelectAllAirlines(false);
    setAirlines(prev => {
      if (isSelected) {
        return prev.filter(code => !allianceMembers.includes(code));
      }
      const merged = new Set([...prev, ...allianceMembers]);
      return Array.from(merged);
    });
  };

  const handleApply = () => {
    const applied: FlightFilters = {
      stops: stops === 'any' ? undefined : stops,
      maxPrice: priceRange >= priceCeiling ? undefined : priceRange,
      departureTimes: departureTime,
      arrivalTimes: arrivalTime,
      cabinClass: cabinClass === 'any' ? undefined : cabinClass,
      maxDurationHours: duration >= 24 ? undefined : duration,
      airlines,
    };

    const state = navigation.getState();
    const previousRoute = state.routes[state.index - 1];

    if (previousRoute?.key) {
      navigation.dispatch({
        ...CommonActions.setParams({
          filters: applied,
          availableFlights,
        }),
        source: previousRoute.key,
        target: state.key,
      });
    }

    navigation.goBack();
  };

  const handleReset = () => {
    setStops('any');
    setPriceRange(priceCeiling);
    setDepartureTime([]);
    setArrivalTime([]);
    setCabinClass('any');
    setDuration(24);
    setAlliance([]);
    setAirlines(allAvailableCodes);
    setSelectAllAirlines(true);
  };

  const handleStopPress = (value: 'nonstop' | '1-stop' | '2plus') => {
    setStops(prev => (prev === value ? 'any' : value));
  };

  const handleCabinPress = (value: string) => {
    setCabinClass(prev => (prev === value ? 'any' : value));
  };

  const previewFilters: FlightFilters = useMemo(() => ({
    stops: stops === 'any' ? undefined : stops,
    maxPrice: priceRange >= priceCeiling ? undefined : priceRange,
    departureTimes: departureTime,
    arrivalTimes: arrivalTime,
    cabinClass: cabinClass === 'any' ? undefined : cabinClass,
    maxDurationHours: duration >= 24 ? undefined : duration,
    airlines,
  }), [airlines, arrivalTime, cabinClass, departureTime, duration, priceCeiling, priceRange, stops]);

  const matchingFlightsCount = useMemo(
    () => applyFilters(availableFlights, previewFilters).length,
    [availableFlights, previewFilters]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.sideButton}>
          <CloseIcon color="#0071E2" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: '#0071E2' }]}>Filters</Text>
        </View>
        <TouchableOpacity onPress={handleReset} style={[styles.sideButton, styles.resetButtonContainer]}>
          <Text style={[styles.resetButton, { color: '#0071E2' }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Stops</Text>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => handleStopPress('nonstop')}
          >
            <View style={[styles.radio, stops === 'nonstop' && styles.radioSelected]} />
            <Text style={[styles.radioLabel, { color: colors.text }]}>Nonstop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => handleStopPress('1-stop')}
          >
            <View style={[styles.radio, stops === '1-stop' && styles.radioSelected]} />
            <Text style={[styles.radioLabel, { color: colors.text }]}>1 Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => handleStopPress('2plus')}
          >
            <View style={[styles.radio, stops === '2plus' && styles.radioSelected]} />
            <Text style={[styles.radioLabel, { color: colors.text }]}>2+ Stops</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Range</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={priceCeiling}
            step={1}
            value={priceRange}
            onValueChange={setPriceRange}
            minimumTrackTintColor="#0075FF"
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor="#0075FF"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>$0</Text>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>${priceRange >= priceCeiling ? `${priceCeiling}+` : priceRange}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Departure Time</Text>
          <View style={styles.chipRow}>
            {[
              { value: 'early-morning', label: 'Early Morning' },
              { value: 'morning', label: 'Morning' },
              { value: 'afternoon', label: 'Afternoon' },
            ].map(item => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.chip,
                  departureTime.includes(item.value) && styles.chipSelected
                ]}
                onPress={() => toggleTimeSlot(departureTime, setDepartureTime, item.value)}
              >
                <Text style={[
                  styles.chipText,
                  departureTime.includes(item.value) && styles.chipTextSelected
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.chipRow}>
            {[
              { value: 'evening', label: 'Evening' },
              { value: 'night', label: 'Night' },
            ].map(item => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.chip,
                  departureTime.includes(item.value) && styles.chipSelected
                ]}
                onPress={() => toggleTimeSlot(departureTime, setDepartureTime, item.value)}
              >
                <Text style={[
                  styles.chipText,
                  departureTime.includes(item.value) && styles.chipTextSelected
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Arrival Time</Text>
          <View style={styles.chipRow}>
            {[
              { value: 'early-morning', label: 'Early Morning' },
              { value: 'morning', label: 'Morning' },
              { value: 'afternoon', label: 'Afternoon' },
            ].map(item => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.chip,
                  arrivalTime.includes(item.value) && styles.chipSelected
                ]}
                onPress={() => toggleTimeSlot(arrivalTime, setArrivalTime, item.value)}
              >
                <Text style={[
                  styles.chipText,
                  arrivalTime.includes(item.value) && styles.chipTextSelected
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.chipRow}>
            {[
              { value: 'evening', label: 'Evening' },
              { value: 'night', label: 'Night' },
            ].map(item => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.chip,
                  arrivalTime.includes(item.value) && styles.chipSelected
                ]}
                onPress={() => toggleTimeSlot(arrivalTime, setArrivalTime, item.value)}
              >
                <Text style={[
                  styles.chipText,
                  arrivalTime.includes(item.value) && styles.chipTextSelected
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cabin Class</Text>
          {[
            { value: 'economy', label: 'Economy' },
            { value: 'premium-economy', label: 'Premium Economy' },
            { value: 'business', label: 'Business' },
            { value: 'first', label: 'First' },
          ].map(item => (
            <TouchableOpacity
              key={item.value}
              style={styles.radioRow}
              onPress={() => handleCabinPress(item.value)}
            >
              <View style={[styles.radio, cabinClass === item.value && styles.radioSelected]} />
              <Text style={[styles.radioLabel, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Duration</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={24}
            step={1}
            value={duration}
            onValueChange={setDuration}
            minimumTrackTintColor="#0075FF"
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor="#0075FF"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>1h</Text>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>
              {duration >= 24 ? '24h+' : `${duration}h`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Airline Alliance</Text>
          {[
            { value: 'star-alliance', label: 'Star Alliance' },
            { value: 'oneworld', label: 'OneWorld' },
            { value: 'skyteam', label: 'SkyTeam' },
          ].map(item => (
            <TouchableOpacity
              key={item.value}
              style={styles.checkboxRow}
              onPress={() => toggleAlliance(item.value)}
            >
              <View style={[styles.checkbox, alliance.includes(item.value) && styles.checkboxSelected]}>
                {alliance.includes(item.value) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.airlinesHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Airlines</Text>
            <View style={styles.selectAllRow}>
              <Text style={[styles.selectAllLabel, { color: colors.text }]}>Select all</Text>
              <TouchableOpacity
                style={[styles.toggle, selectAllAirlines && styles.toggleOn]}
                onPress={() => {
                  if (selectAllAirlines) {
                    setAirlines([]);
                    setAlliance([]);
                    setSelectAllAirlines(false);
                  } else {
                    setAirlines(allAvailableCodes);
                    setAlliance([]);
                    setSelectAllAirlines(true);
                  }
                }}
              >
                <View style={[styles.toggleThumb, selectAllAirlines && styles.toggleThumbOn]} />
              </TouchableOpacity>
            </View>
          </View>
          {availableAirlines.map(item => {
            const selected = airlines.includes(item.code);
            return (
              <TouchableOpacity
                key={item.code}
                style={styles.checkboxRow}
                onPress={() => toggleAirline(item.code)}
              >
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, marginBottom: 20 }]}> 
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>Show {matchingFlightsCount} flights</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sideButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    width: 64,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SemiBold',
  },
  resetButtonContainer: {
    alignItems: 'flex-end',
  },
  resetButton: {
    color: '#0071E2',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 5,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastSection: {
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    fontFamily: 'Medium',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#0075FF',
    borderWidth: 6,
  },
  radioLabel: {
    fontSize: 16,
    fontFamily: 'Regular',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: 'Regular',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000',
  },
  chipSelected: {
    backgroundColor: '#0071E2',
    borderColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Regular',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0075FF',
    borderColor: '#0075FF',
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: 'Regular',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },  
  flexibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    padding: 2,
  },
  toggleOn: {
    backgroundColor: '#0071E2',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 0 }],
  },
  toggleThumbOn: {
    transform: [{ translateX: 20 }],
  },
  flexibilitySubtext: {
    marginTop: 8,
    fontSize: 12,
  },
  airlinesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectAllLabel: {
    fontSize: 14,
    fontFamily: 'Regular',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#0071E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});