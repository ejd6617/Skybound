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
  const [hasSelected, setHasSelected] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inputH, setInputH] = useState(62);
  const [inputY, setInputY] = useState(0);
  const [inputX, setInputX] = useState(0);
  const [inputW, setInputW] = useState(0);

  const inputRef = useRef<View>(null);
  const [absoluteY, setAbsoluteY] = useState(0);
  const [absoluteX, setAbsoluteX] = useState(0);

  const measureInput = () => {
    inputRef.current?.measureInWindow((x, y, width) => {
      setAbsoluteY(y);
      setAbsoluteX(x);
      setInputW(Math.round(width || 0));
    });
  };

  const onInputLayout = (e: LayoutChangeEvent) => {
    const { height, width, x, y } = e.nativeEvent.layout;
    setInputH(Math.round(height || 62));
    setInputY(y);
    setInputX(x);
    setInputW(Math.round(width || 0));
  };

  useEffect(() => {
    setInputValue(value);
    if (!value) {
      setHasSelected(false);
    }
  }, [value]);

  const searchAirports = (query: string): Airport[] => {
    if (query.length < 2) return [];

    const lowerQuery = query.toLowerCase();

    const matches = airports.filter((airport) => {
      const iata = airport.iata.toLowerCase();
      const city = airport.city.toLowerCase();
      const name = airport.name.toLowerCase();

      return (
        iata.startsWith(lowerQuery) ||
        city.startsWith(lowerQuery) ||
        name.startsWith(lowerQuery)
      );
    });

    const ranked = matches
      .map((airport) => {
        const iata = airport.iata.toLowerCase();
        const city = airport.city.toLowerCase();
        const name = airport.name.toLowerCase();

        const rank = (() => {
          if (iata === lowerQuery) return 0; // exact IATA
          if (iata.startsWith(lowerQuery)) return 1; // IATA prefix
          if (city === lowerQuery) return 2; // exact city
          if (city.startsWith(lowerQuery)) return 3; // city prefix
          if (name === lowerQuery) return 4; // exact airport name
          if (name.startsWith(lowerQuery)) return 5; // airport name prefix
          return 6;
        })();

        return { airport, rank };
      })
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        if (a.airport.iata !== b.airport.iata) {
          return a.airport.iata.localeCompare(b.airport.iata);
        }
        return a.airport.name.localeCompare(b.airport.name);
      });

    return ranked.slice(0, 6).map((item) => item.airport);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setHasSelected(false);

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
    setHasSelected(true);
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

  const isDropdownVisible = showSuggestions && suggestions.length > 0;

  return (
    <View style={[styles.container, { position: 'relative' }]}> 

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
            borderBottomLeftRadius: isDropdownVisible ? 0 : 12,
            borderBottomRightRadius: isDropdownVisible ? 0 : 12,
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
            if (inputValue.length >= 2 && !hasSelected) {
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
      {isDropdownVisible && (
        <Portal>
          <View
            style={[
              styles.suggestionsContainer,
              {
                position: "absolute",
                left: absoluteX || inputX,
                top: absoluteY + inputH,
                width: inputW,
                backgroundColor: colors.card,
                borderColor: colors.divider,
                zIndex: 9999,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderTopWidth: 0,
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
    fontSize: 15,
    fontFamily: 'Medium',
  },
  suggestionSecondary: {
    fontSize: 12,
    fontFamily: 'Regular',
  },
});

export default AirportAutocomplete;
