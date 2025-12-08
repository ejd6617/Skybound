import InteractiveMap, { LatLng } from '@/components/ui/InteractiveMap';
import SkyboundItemHolder from '@/components/ui/SkyboundItemHolder';
import { Airport, FlightLeg } from '@/skyboundTypes/SkyboundAPI';
import { auth, db } from '@/src/firebase';
import AirportIcon from '@assets/images/AirportIcon.svg';
import ArrivalIcon from '@assets/images/ArrivalIcon.svg';
import CalandarIcon from '@assets/images/CalandarIcon.svg';
import DepartureIcon from '@assets/images/DepartureIcon.svg';
import AirportAutocomplete from "@components/ui/AirportAutocomplete";
import DateSelector from "@components/ui/DateSelector";
import FlexibleChip from "@components/ui/FlexibleChip";
import MultiCityLeg from "@components/ui/MultiCityLeg";
import SkyboundButton from "@components/ui/SkyboundButton";
import SkyboundText from "@components/ui/SkyboundText";
import TripTypeSelector, { TripType } from "@components/ui/TripTypeSelector";
import basicStyles from '@constants/BasicComponents';
import { useColors } from '@constants/theme';
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp, RouteProp } from "@react-navigation/native-stack";
import { skyboundRequest } from '@src/api/SkyboundUtils';
import { RootStackParamList } from "@src/nav/RootNavigator";
import LoadingScreen from "@src/screens/LoadingScreen";
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { addDoc, collection, deleteDoc, limit as fbLimit, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path } from 'react-native-svg';
import airports from '../../airports.json';
import type { PlannedLeg } from "./FlightResultsScreen";


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

const normalizeDateValue = (value?: Date | string | null) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.toISOString();
};

export default function FlightSearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FlightSearch'>>();
  const colors = useColors();
  const API_URL = Constants.expoConfig?.extra?.API_URL;

  const { width: SCREEN_W } = Dimensions.get("window");
  const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));

  const [isLoading, setIsLoading] = useState(false);
  const [tripType, setTripType] = useState<TripType>('one-way');
  const [flexibleDates, setFlexibleDates] = useState(false);
 

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromAirport, setFromAirport] = useState<Airport | undefined>();
  const [toAirport, setToAirport] = useState<Airport | undefined>();
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  //tracking if the user has flexible airport search enabled
  const [flexibleAirportsEnabled, setFlexibleAirportsEnabled] = useState(false);
  //tracking if the flexible airport modal is shown 
  const [flexibleAiportsVisible, setFlexibleAirportsVisible] = useState(false);

  //contains the flexible airport objects
  const [flexibleAirports, setFlexibleAirports] = useState<any[]>([]);
  //contains the flexible airport codes
  const [flexibleAirportCodes, setFlexibleAirportCodes] = useState<string[]>([]);

  //updates airport codes when airport objects are collected
  useEffect(() => {
    setFlexibleAirportCodes(flexibleAirports.map(a => a.code));
    console.log(flexibleAirportCodes);
  }, [flexibleAirports])

  useEffect(() => {
    const code = route.params?.prefillDestinationCode;
    if (!code) return;
    const match: any = (airports as any[]).find(a => a.code?.toUpperCase() === code.toUpperCase());
    if (match) {
      const destination: Airport = {
        iata: match.code,
        city: match.city,
        name: match.name,
        country: match.country ?? '',
      };
      setToAirport(destination);
      setTo(destination.city || destination.name || destination.iata);
    }
  }, [route.params?.prefillDestinationCode]);

  //stores user's current location
   const [userLocation, setUserLocation] = useState<LatLng | undefined>(undefined);

  //function for getting the user's location
  const getUserLocation = async () => {
    // ask for permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    // get current location
    const location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setUserLocation(coords);
  };



  const createEmptyAirport = (): Airport => ({
    iata: "",
    city: "",
    name: "",
    country: ""
  });

  const createEmptyFlightLeg = (): FlightLeg => ({
    from: createEmptyAirport(),
    to: createEmptyAirport(),
    date: null,
    departureTime: null,
    arrivalTime: null,
    duration: 0,
    travelClass: null
  });

  const [multiCityLegs, setMultiCityLegs] = useState<FlightLeg[]>([
    createEmptyFlightLeg(),
    createEmptyFlightLeg()
  ]);

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (tripType === 'multi-city' && multiCityLegs.length < 2) {
      setMultiCityLegs([
        createEmptyFlightLeg(),
        createEmptyFlightLeg(),
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
      const newLeg: FlightLeg = createEmptyFlightLeg();
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
      from: airport,
    };
    setMultiCityLegs(newLegs);
  };

  const handleLegToChange = (index: number, airport: Airport) => {
    const newLegs = [...multiCityLegs];
    newLegs[index] = {
      ...newLegs[index],
      to: airport,
    };
    setMultiCityLegs(newLegs);
    
    if (index < multiCityLegs.length - 1) {
      newLegs[index + 1] = {
        ...newLegs[index + 1],
        from: airport,
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
        
        if (!flexibleAirportsEnabled && !leg.from) {
          legError.from = 'Departure airport is required';
          isValid = false;
        }
        
        if (!leg.to) {
          legError.to = 'Arrival airport is required';
          isValid = false;
        }
        
        if (!flexibleAirportsEnabled && leg.from && leg.to && leg.from === leg.to) {
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
      if (!flexibleAirportsEnabled && !from) {
        newErrors.from = 'Departure airport is required';
        isValid = false;
      }
      
      if (!to) {
        newErrors.to = 'Arrival airport is required';
        isValid = false;
      }
      
      if (!flexibleAirportsEnabled && from && to && from === to) {
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

  const persistRecentSearch = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      await addDoc(collection(db, "Users", userId, "recentSearches"), {
        fromCode: fromAirport?.iata,
        toCode: toAirport?.iata,
        tripType,
        departureDate: normalizeDateValue(departureDate),
        returnDate: normalizeDateValue(returnDate),
        createdAt: serverTimestamp(),
      });

      const q = query(
        collection(db, "Users", userId, "recentSearches"),
        orderBy("createdAt", "desc"),
        fbLimit(6)
      );
      const snap = await getDocs(q);
      const excess = snap.docs.slice(3);
      await Promise.all(excess.map(doc => deleteDoc(doc.ref)));
    } catch (err) {
      console.warn('Unable to save recent search', err);
    }
  }, [fromAirport?.iata, toAirport?.iata, tripType, departureDate, returnDate]);

  const handleSearch = async () => {
    if (!validateForm()) {
      return;
    }

    console.log("Searching flights...");
    setIsLoading(true);

    try {
      const legsPlan: PlannedLeg[] = (() => {
        if (tripType === 'multi-city') {
          return multiCityLegs.map(leg => ({ fromCode: leg.from?.iata, toCode: leg.to?.iata, date: leg.date }));
        }
        if (tripType === 'round-trip') {
          return [
            { fromCode: fromAirport?.iata, toCode: toAirport?.iata, date: departureDate },
            { fromCode: toAirport?.iata, toCode: fromAirport?.iata, date: returnDate },
          ];
        }
        return [{ fromCode: fromAirport?.iata, toCode: toAirport?.iata, date: departureDate }];
      })();

      const firstLeg = legsPlan[0];
      const searchResults = await skyboundRequest("searchFlightsOneWay", {
        originAirportIATA: firstLeg.fromCode,
        destinationAirportIATA: firstLeg.toCode,
        date: firstLeg.date,
        flexibleDates,
        flexibleAirports: flexibleAirports.map(airport => airport.code),
      });

      setIsLoading(false);
      const normalizeDateValue = (value?: Date | string | null) => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        return value.toISOString();
      };

      navigation.navigate('FlightResults', {
        searchResults: searchResults,
        tripType: tripType,
        fromCode: firstLeg.fromCode,
        toCode: firstLeg.toCode,
        departureDate: normalizeDateValue(firstLeg.date),
        returnDate: normalizeDateValue(returnDate),
        legsCount: legsPlan.length,
        legsDates: legsPlan.map(l => normalizeDateValue(l.date ?? null)),
        searchLegs: legsPlan,
        legIndex: 0,
        selections: [],
      });
      persistRecentSearch();
    } catch (err) {
      console.error('API call failed', err);
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: !isLoading, 
    });
  }, [navigation, isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={[basicStyles.background, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 30 }}>
        <Modal
        animationType="slide"
        transparent={true}
        visible={flexibleAiportsVisible} // use your state
        onRequestClose={() => setFlexibleAirportsVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <SkyboundItemHolder>
            <SkyboundText accessabilityLabel='Select Location' variant='primary'>Select Location</SkyboundText>

            <InteractiveMap
            mapHeight={500}
            mapWidth={450}
            onChange={setFlexibleAirports}
            location={userLocation}>

            </InteractiveMap>
            <SkyboundButton style={basicStyles.skyboundButtonPrimaryLight}width={300} height={50} onPress={() => {setFlexibleAirportsVisible(false);}}>Close</SkyboundButton>
            <SkyboundButton style={basicStyles.skyboundButtonPrimaryLight} width={300} height={50} onPress={ async () =>  await getUserLocation()}>Use My location</SkyboundButton>
          </SkyboundItemHolder> 
        </View>
      </Modal>
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
                  {!flexibleAirportsEnabled && (
                  <>
                    <AirportAutocomplete
                      label="From"
                      value={from}
                      onSelect={(airport) => {
                        setFrom(`${airport.city} (${airport.iata})`);
                        setFromAirport(airport);
                      }}
                      placeholder="Departure airport"
                      error={errors.from}
                      icon={<DepartureIcon/>}
                  />
                  </>

                  ) || (
                  <>

                  <SkyboundText accessabilityLabel={"Flexible Airports: " + flexibleAirportCodes} variant='secondary'>{"Flexible Airports: " + flexibleAirportCodes}</SkyboundText>

                  </>
                  )}

                  <View style={{ height: 0 }} />

                  <AirportAutocomplete
                    label="To"
                    value={to}
                    onSelect={(airport) => {
                      setTo(`${airport.city} (${airport.iata})`);
                      setToAirport(airport);
                    }}
                    placeholder="Arrival airport"
                    error={errors.to}
                    icon={<ArrivalIcon/>}
                  />

                  <SkyboundText accessabilityLabel={"Flexible Airports: " + flexibleAirportCodes} variant='primary'>{flexibleAiportsVisible}</SkyboundText>

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
                icon={CalandarIcon}
              />
              <FlexibleChip
                label="Flexible Airports"
                isActive={flexibleAirportsEnabled}
                onToggle={() => {
                  if(!flexibleAirportsEnabled)
                  {
                    setFlexibleAirportsEnabled(true);
                    setFlexibleAirportsVisible(true);
                  }
                  else
                  {
                    setFlexibleAirportsEnabled(false);
                    setFlexibleAirports([])
                    setFlexibleAirportCodes([])
                  }
                  
                }}
                icon={AirportIcon}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 16,
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
    gap: 8,
    marginTop: 12,
    marginBottom: 0,
  },
  tooltip: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 0,
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
