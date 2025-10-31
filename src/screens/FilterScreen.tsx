import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '../../constants/theme';
import { RootStackParamList } from '../nav/RootNavigator';

const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke="#000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function FilterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useColors();

  const [stops, setStops] = useState<'nonstop' | '1-stop' | '2plus'>('nonstop');
  const [priceRange, setPriceRange] = useState(0);
  const [departureTime, setDepartureTime] = useState<string[]>(['early-morning']);
  const [arrivalTime, setArrivalTime] = useState<string[]>(['afternoon']);
  const [cabinClass, setCabinClass] = useState('economy');
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [duration, setDuration] = useState(10);
  const [alliance, setAlliance] = useState<string[]>(['oneworld']);
  const [airlines, setAirlines] = useState<string[]>(['delta', 'american']);

  const toggleTimeSlot = (list: string[], setList: (val: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const toggleAirline = (airline: string) => {
    if (airlines.includes(airline)) {
      setAirlines(airlines.filter(a => a !== airline));
    } else {
      setAirlines([...airlines, airline]);
    }
  };

  const toggleAlliance = (value: string) => {
    if (alliance.includes(value)) {
      setAlliance(alliance.filter(a => a !== value));
    } else {
      setAlliance([...alliance, value]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <CloseIcon />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Filters</Text>
        <TouchableOpacity onPress={() => console.log('Reset filters')}>
          <Text style={styles.resetButton}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Stops</Text>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setStops('nonstop')}
          >
            <View style={[styles.radio, stops === 'nonstop' && styles.radioSelected]} />
            <Text style={[styles.radioLabel, { color: colors.text }]}>Nonstop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setStops('1-stop')}
          >
            <View style={[styles.radio, stops === '1-stop' && styles.radioSelected]} />
            <Text style={[styles.radioLabel, { color: colors.text }]}>1 Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setStops('2plus')}
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
            maximumValue={2000}
            step={50}
            value={priceRange}
            onValueChange={setPriceRange}
            minimumTrackTintColor="#0075FF"
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor="#0075FF"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>$0</Text>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>$2000+</Text>
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
              onPress={() => setCabinClass(item.value)}
            >
              <View style={[styles.radio, cabinClass === item.value && styles.radioSelected]} />
              <Text style={[styles.radioLabel, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.flexibilityRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Date Flexibility</Text>
            <TouchableOpacity
              style={[styles.toggle, flexibleDates && styles.toggleOn]}
              onPress={() => setFlexibleDates(!flexibleDates)}
            >
              <View style={[styles.toggleThumb, flexibleDates && styles.toggleThumbOn]} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.flexibilitySubtext, { color: colors.subText }]}>
            Show flexible dates
          </Text>
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
            <Text style={[styles.sliderLabel, { color: colors.text }]}>24h+</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Airlines</Text>
          {[
            { value: 'delta', label: 'Delta' },
            { value: 'united', label: 'United' },
            { value: 'american', label: 'American' },
            { value: 'southwest', label: 'Southwest' },
            { value: 'air-canada', label: 'Air Canada' },
            { value: 'jetblue', label: 'JetBlue' },
          ].map(item => (
            <TouchableOpacity
              key={item.value}
              style={styles.checkboxRow}
              onPress={() => toggleAirline(item.value)}
            >
              <View style={[styles.checkbox, airlines.includes(item.value) && styles.checkboxSelected]}>
                {airlines.includes(item.value) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, marginBottom: 20 }]}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.applyButtonText}>Show Flights</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SemiBold',
  },
  resetButton: {
    color: '#0071E2',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 16,
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
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: 'Regular',
  },
  flexibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  flexibilitySubtext: {
    fontSize: 14,
    fontFamily: 'Regular',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
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
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButton: {
    backgroundColor: '#0071E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Medium',
  },
});