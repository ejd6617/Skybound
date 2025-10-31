import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Constants from 'expo-constants';
import React, { useEffect, useState } from "react";
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path } from 'react-native-svg';
import AccountIcon from '../../assets/images/AccountIcon.svg';
import BellIcon from '../../assets/images/BellIcon.svg';
import HamburgerIcon from '../../assets/images/HamburgerIcon.svg';
import AirportAutocomplete from "../../components/ui/AirportAutocomplete";
import DateSelector from "../../components/ui/DateSelector";
import FlexibleChip from "../../components/ui/FlexibleChip";
import MultiCityLeg from "../../components/ui/MultiCityLeg";
import SkyboundButton from "../../components/ui/SkyboundButton";
import SkyboundNavBar from "../../components/ui/SkyboundNavBar";
import SkyboundText from "../../components/ui/SkyboundText";
import TripTypeSelector, { TripType } from "../../components/ui/TripTypeSelector";
import basicStyles from '../../constants/BasicComponents';
import { useColors } from '../../constants/theme';
import { RootStackParamList } from "../nav/RootNavigator";
import LoadingScreen from "./LoadingScreen";

interface Airport {
  iata: string;
  city: string;
  name: string;
  country: string;
}

interface FlightLeg {
  from: string;
  to: string;
  date: Date | null;
  fromAirport?: Airport;
  toAirport?: Airport;
}

interface ValidationErrors {
  from?: string;
  to?: string;
  departureDate?: string;
  returnDate?: string;
  legs?: Array<{
    from?: string;
    to?: string;
    date?: string;
  }>;
}

const AddIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path d="M10 4V16M4 10H16" stroke="#0071E2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function FlightSearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useColors();
  const API_URL = Constants.expoConfig?.extra?.API_URL;

  const { width: SCREEN_W } = Dimensions.get("window");
  const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));

  const [isLoading, setIsLoading] = useState(false);
  const [tripType, setTripType] = useState<TripType>('one-way');
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [flexibleAirports, setFlexibleAirports] = useState(false);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromAirport, setFromAirport] = useState<Airport | undefined>();
  const [toAirport, setToAirport] = useState<Airport | undefined>();
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  const [multiCityLegs, setMultiCityLegs] = useState<FlightLeg[]>([
    { from: '', to: '', date: null },
    { from: '', to: '', date: null },
  ]);

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (tripType === 'multi-city' && multiCityLegs.length < 2) {
      setMultiCityLegs([
        { from: '', to: '', date: null },
        { from: '', to: '', date: null },
      ]);
    }
  }, [tripType]);

  const handleSwap = () => {
    const tempFrom = from;
    const tempFromAirport = fromAirport;
    setFrom(to);
    setFromAirport(toAirport);
    setTo(tempFrom);
    setToAirport(tempFromAirport);
  };

  const handleAddLeg = () => {
    if (multiCityLegs.length < 6) {
      const lastLeg = multiCityLegs[multiCityLegs.length - 1];
      const newLeg: FlightLeg = {
        from: lastLeg.to,
        to: '',
        date: null,
        fromAirport: lastLeg.toAirport,
      };
      setMultiCityLegs([...multiCityLegs, newLeg]);
    }
  };

  const handleRemoveLeg = (index: number) => {
    if (multiCityLegs.length > 2) {
      setMultiCityLegs(multiCityLegs.filter((_, i) => i !== index));
      const newLegErrors = errors.legs?.filter((_, i) => i !== index);
      setErrors({ ...errors, legs: newLegErrors });
    }
  };

  const handleLegFromChange = (index: number, airport: Airport) => {
    const newLegs = [...multiCityLegs];
    newLegs[index] = {
      ...newLegs[index],
      from: `${airport.city} (${airport.iata})`,
      fromAirport: airport,
    };
    setMultiCityLegs(newLegs);
  };

  const handleLegToChange = (index: number, airport: Airport) => {
    const newLegs = [...multiCityLegs];
    newLegs[index] = {
      ...newLegs[index],
      to: `${airport.city} (${airport.iata})`,
      toAirport: airport,
    };
    setMultiCityLegs(newLegs);
    
    if (index < multiCityLegs.length - 1) {
      newLegs[index + 1] = {
        ...newLegs[index + 1],
        from: `${airport.city} (${airport.iata})`,
        fromAirport: airport,
      };
      setMultiCityLegs(newLegs);
    }
  };

  const handleLegDateChange = (index: number, date: Date) => {
    const newLegs = [...multiCityLegs];
    newLegs[index] = {
      ...newLegs[index],
      date,
    };
    setMultiCityLegs(newLegs);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (tripType === 'multi-city') {
      const legErrors: Array<{ from?: string; to?: string; date?: string }> = [];
      
      multiCityLegs.forEach((leg, index) => {
        const legError: { from?: string; to?: string; date?: string } = {};
        
        if (!leg.from) {
          legError.from = 'Departure airport is required';
          isValid = false;
        }
        
        if (!leg.to) {
          legError.to = 'Arrival airport is required';
          isValid = false;
        }
        
        if (leg.from && leg.to && leg.from === leg.to) {
          legError.to = 'Departure and arrival cannot be the same';
          isValid = false;
        }
        
        if (!leg.date) {
          legError.date = 'Departure date is required';
          isValid = false;
        }
        
        if (index > 0 && leg.date && multiCityLegs[index - 1].date) {
          if (leg.date < multiCityLegs[index - 1].date!) {
            legError.date = 'Date must be on or after previous flight';
            isValid = false;
          }
        }
        
        legErrors.push(legError);
      });
      
      newErrors.legs = legErrors;
    } else {
      if (!from) {
        newErrors.from = 'Departure airport is required';
        isValid = false;
      }
      
      if (!to) {
        newErrors.to = 'Arrival airport is required';
        isValid = false;
      }
      
      if (from && to && from === to) {
        newErrors.to = 'Departure and arrival cannot be the same';
        isValid = false;
      }
      
      if (!departureDate) {
        newErrors.departureDate = 'Departure date is required';
        isValid = false;
      }
      
      if (tripType === 'round-trip') {
        if (!returnDate) {
          newErrors.returnDate = 'Return date is required';
          isValid = false;
        }
        
        if (departureDate && returnDate && returnDate < departureDate) {
          newErrors.returnDate = 'Return date must be on or after departure date';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSearch = async () => {
    if (!validateForm()) {
      return;
    }

    console.log("Searching flights...");
    setIsLoading(true);

    try {
      const endpoint = tripType === 'one-way' ? 'searchFlightsOneWay' :
                      tripType === 'round-trip' ? 'searchFlightsRoundTrip' :
                      'searchFlightsMultiCity';
      
      const url = `${API_URL}/api/${endpoint}/`;
      console.log(url);

      const jsonBody = tripType === 'multi-city'
        ? {
            legs: multiCityLegs.map(leg => ({
              originAirport: leg.fromAirport?.iata,
              destinationAirport: leg.toAirport?.iata,
              date: leg.date?.toISOString().split('T')[0],
            })),
            flexibleDates,
            flexibleAirports,
          }
        : {
            originAirport: fromAirport?.iata,
            destinationAirport: toAirport?.iata,
            startDate: departureDate?.toISOString().split('T')[0],
            endDate: tripType === 'round-trip' ? returnDate?.toISOString().split('T')[0] : undefined,
            flexibleDates,
            flexibleAirports,
          };

      console.log(jsonBody);

      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('FlightResults');
      }, 1500);

    } catch (err) {
      console.error('API call failed', err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={[basicStyles.background, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <SkyboundNavBar
          title="Flight Search"
          leftHandIcon={<HamburgerIcon width={24} height={24} />}
          leftHandIconOnPressEvent={() => navigation.navigate("Dashboard")}
          rightHandFirstIcon={<BellIcon width={24} height={24} />}
          rightHandFirstIconOnPressEvent={() => console.log('Notification Icon Pressed')}
          rightHandSecondIcon={<AccountIcon width={24} height={24} />}
          rightHandSecondIconOnPressEvent={() => console.log('Account Button Pressed')}
        />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, { width: CARD_W }]}>
            <TripTypeSelector
              selectedType={tripType}
              onTypeChange={(type) => {
                setTripType(type);
                setErrors({});
              }}
            />

            {tripType !== 'multi-city' ? (
              <>
                <View style={{...styles.columnContainer}}>
                  <AirportAutocomplete
                    label="From"
                    value={from}
                    onSelect={(airport) => {
                      setFrom(`${airport.city} (${airport.iata})`);
                      setFromAirport(airport);
                    }}
                    placeholder="Departure airport"
                    error={errors.from}
                  />

                  <View style={{ height: 8 }} />

                  <AirportAutocomplete
                    label="To"
                    value={to}
                    onSelect={(airport) => {
                      setTo(`${airport.city} (${airport.iata})`);
                      setToAirport(airport);
                    }}
                    placeholder="Arrival airport"
                    error={errors.to}
                  />

                  <View style={{ height: 8 }} />

                  <DateSelector
                    label="Depart Date"
                    value={departureDate}
                    onSelect={setDepartureDate}
                    placeholder="Select departure date"
                    minDate={new Date()}
                    error={errors.departureDate}
                  />

                  {tripType === 'round-trip' && (
                    <>
                      <View style={{ height: 8 }} />
                      <DateSelector
                        label="Return Date"
                        value={returnDate}
                        onSelect={setReturnDate}
                        placeholder="Select return date"
                        minDate={departureDate || new Date()}
                        error={errors.returnDate}
                      />
                    </>
                  )}
                </View>
              </>
            ) : (
              <>
                {multiCityLegs.map((leg, index) => (
                  <MultiCityLeg
                    key={index}
                    leg={leg}
                    legNumber={index + 1}
                    totalLegs={multiCityLegs.length}
                    onFromChange={(airport) => handleLegFromChange(index, airport)}
                    onToChange={(airport) => handleLegToChange(index, airport)}
                    onDateChange={(date) => handleLegDateChange(index, date)}
                    onRemove={multiCityLegs.length > 2 ? () => handleRemoveLeg(index) : undefined}
                    errors={errors.legs?.[index]}
                  />
                ))}

                {multiCityLegs.length < 6 && (
                  <TouchableOpacity
                    style={[styles.addLegButton, { borderColor: colors.divider }]}
                    onPress={handleAddLeg}
                    accessible={true}
                    accessibilityLabel="Add another flight"
                    accessibilityRole="button"
                  >
                    <AddIcon />
                    <SkyboundText variant="primary" size={14} accessabilityLabel="Add another flight" style={{ color: '#0071E2' }}>
                      Add another flight
                    </SkyboundText>
                  </TouchableOpacity>
                )}
              </>
            )}

            <View style={[styles.flexibleOptionsRow, CARD_W < 380 ? { flexDirection: 'column' } : {}]}>
              <FlexibleChip
                label="Flexible Dates"
                isActive={flexibleDates}
                onToggle={() => setFlexibleDates(!flexibleDates)}
                iconType="calendar"
              />
              <FlexibleChip
                label="Flexible Airports"
                isActive={flexibleAirports}
                onToggle={() => setFlexibleAirports(!flexibleAirports)}
                iconType="airport"
              />
            </View>

            {flexibleDates && (
              <View style={[styles.tooltip, { backgroundColor: colors.surfaceMuted }]}>
                <SkyboundText variant="secondary" size={12} accessabilityLabel="Flexible dates tip">
                  We'll search for the cheapest dates near your selection (±3 days)
                </SkyboundText>
              </View>
            )}

            <View style={styles.searchButtonContainer}>
              <SkyboundButton
                textVariant="forceWhite"
                style={styles.searchButton}
                onPress={handleSearch}
                width={CARD_W * 0.5}
                height={50}
              >
                Continue
              </SkyboundButton>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  columnContainer: {
    flexDirection: 'column',
  },
  fromToContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  swapContainer: {
    paddingTop: 32,
  },
  flexibleOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  tooltip: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addLegButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  searchButtonContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  searchButton: {
    backgroundColor: '#0071E2',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
