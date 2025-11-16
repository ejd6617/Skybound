import airports from "@assets/airports.json";
import { useColors } from '@constants/theme';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Keyboard, LayoutChangeEvent, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  icon: ReactNode;

}

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
  icon,
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
          {icon}
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
