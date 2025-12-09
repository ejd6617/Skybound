import airports from "@assets/airports.json";
import { useColors } from '@constants/theme';
import { Portal } from '@gorhom/portal';
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
  const [inputY, setInputY] = useState(0);

  const inputRef = useRef<View>(null);  
  const [absoluteY, setAbsoluteY] = useState(0);

  const measureInput = () => {
    inputRef.current?.measureInWindow((x, y) => {
      setAbsoluteY(y);
    });
  };

  const onInputLayout = (e: LayoutChangeEvent) => {
    const { height, y } = e.nativeEvent.layout;
    setInputH(Math.round(height || 62));
    setInputY(y);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchAirports = (query: string): Airport[] => {
    if (query.length < 2) return [];

    const lowerQuery = query.toLowerCase();

    return airports
      .filter((airport) => {
        const iataMatch = airport.iata.toLowerCase().includes(lowerQuery);
        const cityMatch = airport.city.toLowerCase().includes(lowerQuery);
        const nameMatch = airport.name.toLowerCase().includes(lowerQuery);
        return iataMatch || cityMatch || nameMatch;
      })
      .sort((a, b) => {
        const aExact = a.iata.toLowerCase() === lowerQuery;
        const bExact = b.iata.toLowerCase() === lowerQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStarts = a.iata.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.iata.toLowerCase().startsWith(lowerQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return 0;
      })
      .slice(0, 6);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

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
    <View    style={[styles.container, { position: 'relative' }]}>

      <SkyboundText variant="primary" size={14} accessabilityLabel={label} style={{ marginBottom: 8 }}>
        {label}
      </SkyboundText>

      <View
        ref={inputRef}
        onLayout={onInputLayout}
        style={[
          styles.inputContainer,
          {
            borderColor: error ? '#DC2626' : (isFocused ? '#0071E2' : colors.divider),
            backgroundColor: colors.card,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.text, fontSize: 14 },
          ]}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor={colors.subText}
          onFocus={() => {
            measureInput();
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

        <View style={styles.iconContainer}>{icon}</View>
      </View>

      {error && (
        <SkyboundText
          variant="secondary"
          size={12}
          accessabilityLabel={error}
          style={{ color: '#DC2626', marginTop: 4 }}
        >
          {error}
        </SkyboundText>
      )}

      {/* portal for suggestions*/}
      {showSuggestions && suggestions.length > 0 && (
        <Portal>
          <View
            style={[
              styles.suggestionsContainer,
              {
                position: "absolute",
                left: 0,
                right: 0,
                top: absoluteY + inputH + 8,   // below the input
                backgroundColor: colors.card,
                borderColor: colors.divider,
                zIndex: 9999,
              }
            ]}
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.iata}
                style={[styles.suggestionItem, { borderBottomColor: colors.divider }]}
                onPress={() => handleSelectAirport(item)}
              >
                <View style={styles.suggestionContent}>
                  <Text style={[styles.suggestionMain, { color: colors.text }]}>
                    {highlightMatch(item.city, inputValue)}, {highlightMatch(item.iata, inputValue)}
                  </Text>
                  <Text style={[styles.suggestionSecondary, { color: colors.subText }]}>
                    {item.name} • {item.country}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Portal>
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
    maxHeight: 240,
    borderWidth: 1,
    borderRadius: 12,
    padding: 0,
    overflow: "hidden",
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
