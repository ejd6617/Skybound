import { NATIONALITIES_TO_ISO } from '@/assets/data/nationalitiesToISO';
import InteractiveMap, { LatLng } from '@/components/ui/InteractiveMap';
import SkyboundItemHolder from '@/components/ui/SkyboundItemHolder';
import { Airport, FlightLeg, MultiCityQueryParams, OneWayQueryParams, QueryLeg, RoundTripQueryParams, Traveler, TravelerType } from '@/skyboundTypes/SkyboundAPI';
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { skyboundRequest } from '@src/api/SkyboundUtils';
import { RootStackParamList } from "@src/nav/RootNavigator";
import LoadingScreen from "@src/screens/LoadingScreen";
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path } from 'react-native-svg';

import { db } from "@src/firebase";
import { getTravelerDetails } from '@src/firestoreFunctions';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { GenderOption, TravelerProfile } from '../types/travelers';

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
  
  const [travelers, setTravelers] = useState<TravelerProfile[]>([]);

  const auth = getAuth();
  const user = auth.currentUser?.uid;

  //fetches traveler details from firebase
  const fetchTravelers = async () => {
    try {
      const travelersRef = collection(db, 'Users', user, 'TravelerDetails');
      const travelersSnap = await getDocs(travelersRef);

      const fetchedTravelers: TravelerProfile[] = [];

      for (const doc of travelersSnap.docs) {
        const travelerID = doc.id;
        const travelerDetails = await getTravelerDetails(user, travelerID);
        if (travelerDetails) {
          fetchedTravelers.push({
            id: travelerID,
            firstName: travelerDetails.FirstName,
            middleName: travelerDetails.MiddleName || "",
            lastName: travelerDetails.LastName,
            birthdate: travelerDetails.Birthday,
            gender: travelerDetails.Gender as GenderOption,
            nationality: travelerDetails.Nationality,
            passportNumber: travelerDetails.PassportNumber,
            passportExpiry: travelerDetails.PassportExpiration,
            type: travelerDetails.Type as TravelerType
          });
        }
      }

      setTravelers(fetchedTravelers);
    } catch (error) {
      console.error("Error fetching travelers: ", error);
    }
  };

 // Fetch traveler details when the screen loads
  useEffect(() => {
    fetchTravelers();
  }, []);

  //updates airport codes when airport objects are collected
  useEffect(() => {
    setFlexibleAirportCodes(flexibleAirports.map(a => a.code));
    console.log(flexibleAirportCodes);
  }, [flexibleAirports])

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
    travelClass: null,
    flightNumber: null,
    terminal: null,
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
  
  // Convert firebase traveler to API-compatible traveler
  const extractAPIRelevantTravelerDetails = (traveler: TravelerProfile): Traveler => {
    const TRAVELER_TYPE_MAP = {
      "Adult": "ADULT",
      "Child": "CHILD",
      "Elderly": "SENIOR",
    };
    
    if (!(traveler.type in TRAVELER_TYPE_MAP)) {
      throw new Error("Invalid traveler type " + traveler.type + " for API query");
    }

    if (traveler.nationality && !(traveler.nationality in NATIONALITIES_TO_ISO)) {
      throw new Error("Invalid nationality " + traveler.nationality + " for API query");
    }
    
    const nationality = (traveler.nationality)
      ? {nationality: NATIONALITIES_TO_ISO[traveler.nationality]}
      : {};

    return {
      dateOfBirth: new Date(traveler.birthdate),
      travelerType: TRAVELER_TYPE_MAP[traveler.type],
      ...nationality
    }
  };

  const handleSearch = async () => {
    if (!validateForm()) {
      return;
    }

    console.log("Searching flights...");
    setIsLoading(true);

    try {
      const searchResults = await (async () => {
        switch (tripType) {
          case 'one-way': {
            const endpoint = "searchFlightsOneWay"
            const jsonBody: OneWayQueryParams = {
              originAirportIATA: fromAirport?.iata,
              destinationAirportIATA: toAirport?.iata,
              date: departureDate,
              flexibleDates,
              flexibleAirports: flexibleAirports.map(airport => airport.code),
              travelers: travelers.map(extractAPIRelevantTravelerDetails),
              currencyCode: "USD",
            }
            return await skyboundRequest(endpoint, jsonBody);
          }

          case 'round-trip': {
            const endpoint = "searchFlightsRoundTrip"
            const jsonBody: RoundTripQueryParams = {
              originAirportIATA: fromAirport?.iata,
              destinationAirportIATA: toAirport?.iata,
              startDate: departureDate,
              endDate: returnDate,
              flexibleDates,
              flexibleAirports: flexibleAirports.map(airport => airport.code),
              travelers: travelers.map(extractAPIRelevantTravelerDetails),
              currencyCode: "USD",
            }
            return await skyboundRequest(endpoint, jsonBody);
          }

          case 'multi-city': {
            const endpoint = "searchFlightsMultiCity"
            const jsonBody: MultiCityQueryParams = {
              flexibleDates,
              legs: multiCityLegs.map((leg): QueryLeg => ({
                originAirportIATA: leg.from?.iata,
                destinationAirportIATA: leg.to?.iata,
                date: leg.date,
              })), 
              travelers: travelers.map(extractAPIRelevantTravelerDetails),
              currencyCode: "USD",
            }
            return await skyboundRequest(endpoint, jsonBody);
          }
          
          default: {
            throw new Error(`Invalid flight search type "${tripType}"`)          
          }

        }
      })();

      setIsLoading(false);
      const normalizeDateValue = (value?: Date | string | null) => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        return value.toISOString();
      };

      navigation.navigate('FlightResults', {
        searchResults: searchResults,
        tripType: tripType,
        fromCode: fromAirport?.iata,
        toCode: toAirport?.iata,
        departureDate: normalizeDateValue(departureDate),
        returnDate: normalizeDateValue(returnDate),
        legsCount: tripType === 'multi-city' ? multiCityLegs.length : (tripType === 'round-trip' ? 2 : 1),
        legsDates: tripType === 'multi-city' ? multiCityLegs.map(l => normalizeDateValue(l.date)) : undefined,
      });
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
            <SkyboundButton style={basicStyles.skyboundButtonPrimaryLight} width={300} height={50} onPress={() => {setFlexibleAirportsVisible(false);}}>Close</SkyboundButton>
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
