import airports from "@assets/airports.json";
import { useColors } from '@constants/theme';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, LayoutChangeEvent, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';
import SkyboundText from './SkyboundText';

interface Airport {
  iata: string;
  city: string;
  name: string;
  country: string;
}

interface AirportAutocompleteProps {
  label: string;
  value: string;
  onSelect: (airport: Airport) => void;
  placeholder?: string;
  error?: string;
}

const DepartureIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <G clipPath="url(#clip0_177_876)">
      <Path d="M0.009375 5.21562L0 2.125C0 1.80313 0.296875 1.56562 0.609375 1.63437L1.72187 1.88125C2.05312 1.95312 2.32187 2.19062 2.44062 2.50625L3 4L6.97813 5.175L5.68125 0.6375C5.59063 0.31875 5.83125 0 6.1625 0H7.41563C7.77813 0 8.10938 0.19375 8.2875 0.509375L11.6938 6.56563L15.0437 7.55625C15.5406 7.70312 16.0062 7.94688 16.4094 8.26875L17.4844 9.13125C18.2344 9.73125 18.05 10.9219 17.15 11.2625C15.8625 11.75 14.4563 11.8281 13.125 11.4812L3.80312 9.05625C3.45625 8.96562 3.14062 8.78438 2.8875 8.52812L0.296875 5.91875C0.1125 5.73125 0.00625 5.48125 0.00625 5.21562H0.009375ZM1 14H19C19.5531 14 20 14.4469 20 15C20 15.5531 19.5531 16 19 16H1C0.446875 16 0 15.5531 0 15C0 14.4469 0.446875 14 1 14ZM4 11.5C4 11.2348 4.10536 10.9804 4.29289 10.7929C4.48043 10.6054 4.73478 10.5 5 10.5C5.26522 10.5 5.51957 10.6054 5.70711 10.7929C5.89464 10.9804 6 11.2348 6 11.5C6 11.7652 5.89464 12.0196 5.70711 12.2071C5.51957 12.3946 5.26522 12.5 5 12.5C4.73478 12.5 4.48043 12.3946 4.29289 12.2071C4.10536 12.0196 4 11.7652 4 11.5ZM8 11C8.26522 11 8.51957 11.1054 8.70711 11.2929C8.89464 11.4804 9 11.7348 9 12C9 12.2652 8.89464 12.5196 8.70711 12.7071C8.51957 12.8946 8.26522 13 8 13C7.73478 13 7.48043 12.8946 7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929C7.48043 11.1054 7.73478 11 8 11Z" fill={color}/>
    </G>
    <Defs>
      <ClipPath id="clip0_177_876">
        <Path d="M0 0H20V16H0V0Z" fill="white"/>
      </ClipPath>
    </Defs>
  </Svg>
);

const MOCK_AIRPORTS: Airport[] = [
  { iata: 'PIT', city: 'Pittsburgh', name: 'Pittsburgh International Airport', country: 'USA' },
  { iata: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA' },
  { iata: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'USA' },
  { iata: 'ORD', city: 'Chicago', name: "O'Hare International Airport", country: 'USA' },
  { iata: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport', country: 'USA' },
  { iata: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International Airport', country: 'USA' },
  { iata: 'DEN', city: 'Denver', name: 'Denver International Airport', country: 'USA' },
  { iata: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'USA' },
  { iata: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International Airport', country: 'USA' },
  { iata: 'LAS', city: 'Las Vegas', name: 'Harry Reid International Airport', country: 'USA' },
  { iata: 'MCO', city: 'Orlando', name: 'Orlando International Airport', country: 'USA' },
  { iata: 'MIA', city: 'Miami', name: 'Miami International Airport', country: 'USA' },
  { iata: 'BOS', city: 'Boston', name: 'Logan International Airport', country: 'USA' },
  { iata: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor International Airport', country: 'USA' },
  { iata: 'IAH', city: 'Houston', name: 'George Bush Intercontinental Airport', country: 'USA' },
  { iata: 'CLT', city: 'Charlotte', name: 'Charlotte Douglas International Airport', country: 'USA' },
]; // will add more later on

const AirportAutocomplete: React.FC<AirportAutocompleteProps> = ({
  label,
  value,
  onSelect,
  placeholder = 'Search airports',
  error,
}) => {
  const colors = useColors();
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [inputH, setInputH] = useState(62);

  const onInputLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height || 62);
    setInputH(h);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchAirports = (query: string): Airport[] => {
    if (query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    
    return airports.filter(airport => {
      const iataMatch = airport.iata.toLowerCase().includes(lowerQuery);
      const cityMatch = airport.city.toLowerCase().includes(lowerQuery);
      const nameMatch = airport.name.toLowerCase().includes(lowerQuery);

      return iataMatch || cityMatch || nameMatch;
    }).sort((a, b) => {
      const aIataExact = a.iata.toLowerCase() === lowerQuery;
      const bIataExact = b.iata.toLowerCase() === lowerQuery;
      if (aIataExact && !bIataExact) return -1;
      if (!aIataExact && bIataExact) return 1;

      const aIataStarts = a.iata.toLowerCase().startsWith(lowerQuery);
      const bIataStarts = b.iata.toLowerCase().startsWith(lowerQuery);
      if (aIataStarts && !bIataStarts) return -1;
      if (!aIataStarts && bIataStarts) return 1;

      return 0;
    }).slice(0, 6);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const results = searchAirports(text);
      setSuggestions(results);
      setShowSuggestions(results.length > 0 && text.length >= 2);
    }, 300);
  };

  const handleSelectAirport = (airport: Airport) => {
    const display = `${airport.city} (${airport.iata})`;
    setInputValue(display);
    onSelect(airport);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <Text style={{ fontWeight: 'bold', color: '#0071E2' }}>
          {text.substring(index, index + query.length)}
        </Text>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <View style={[styles.container, { position: 'relative' }]}>
      <SkyboundText variant="primary" size={14} accessabilityLabel={label} style={{ marginBottom: 8 }}>
        {label}
      </SkyboundText>

      <View 
        onLayout={onInputLayout}
        style={[ styles.inputContainer,
        {
          borderColor: error ? '#DC2626' : (isFocused ? '#0071E2' : colors.divider),
          backgroundColor: colors.card,
        }
      ]}>
        <TextInput
          style={[
            styles.input,
            { color: colors.text, fontSize: 14 }
          ]}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor={colors.subText}
          onFocus={() => {
            setIsFocused(true);
            if (inputValue.length >= 2) {
              const results = searchAirports(inputValue);
              setSuggestions(results);
              setShowSuggestions(results.length > 0);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          accessible={true}
          accessibilityLabel={`${label} input`}
          accessibilityHint="Type to search for airports"
        />
        <View style={styles.iconContainer}>
          <DepartureIcon color="#9CA3AF" />
        </View>
      </View>

      {error && (
        <SkyboundText variant="secondary" size={12} accessabilityLabel={error} style={{ color: '#DC2626', marginTop: 4 }}>
          {error}
        </SkyboundText>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, 
          { 
            backgroundColor: colors.card, 
            borderColor: colors.divider,
            top: inputH + 16,
            zIndex: 1000,
            elevation: 24, 
          }] as any}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.iata}
              style={[styles.suggestionItem, { borderBottomColor: colors.divider }]}
              onPress={() => handleSelectAirport(item)}
              accessible={true}
              accessibilityLabel={`${item.city}, ${item.name}, ${item.iata}`}
              accessibilityRole="button"
            >
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionMain, { color: colors.text, fontSize: 13 }]}>
                  {highlightMatch(item.city, inputValue)}, {highlightMatch(item.iata, inputValue)}
                </Text>
                <Text style={[styles.suggestionSecondary, { color: colors.subText, fontSize: 11 }]}>
                  {item.name} • {item.country}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 62,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Medium',
  },
  iconContainer: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    maxHeight: 240,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
    zIndex: 100000,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    gap: 4,
  },
  suggestionMain: {
    fontSize: 16,
    fontFamily: 'Medium',
  },
  suggestionSecondary: {
    fontSize: 13,
    fontFamily: 'Regular',
  },
});

export default AirportAutocomplete;
