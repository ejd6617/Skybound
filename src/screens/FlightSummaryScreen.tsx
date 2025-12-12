import SkyboundText from "@components/ui/SkyboundText";
import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getURL } from "@src/api/SkyboundUtils";
import { db } from "@src/firebase";
import { getTravelerDetails } from "@src/firestoreFunctions";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import type { ItineraryPayload, UIFlight } from "@src/screens/FlightResultsScreen";
import type { TravelerProfile } from "@src/types/travelers";
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function FlightSummaryScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FlightSummary'>>();

  const { itinerary } = (route.params as { itinerary?: ItineraryPayload }) || {};
  const flights: UIFlight[] = itinerary?.flights ?? [];
  const [selectedTravelers, setSelectedTravelers] = useState<TravelerProfile[]>(
    itinerary?.travelers
      ? itinerary.travelers as TravelerProfile[]
      : itinerary?.traveler
        ? [itinerary.traveler as TravelerProfile]
        : []
  );
  const [travelerModalVisible, setTravelerModalVisible] = useState(false);
  const [savedTravelers, setSavedTravelers] = useState<TravelerProfile[]>([]);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const goToTravelerDetails = useCallback(() => {
    const parent = navigation.getParent();
    parent?.navigate('Accounts', {
      screen: 'TravelerDetails',
      params: { returnToBooking: true, itinerary },
    });
  }, [itinerary, navigation]);

  const fetchTravelers = useCallback(async () => {
    if (!userId) {
      setSavedTravelers([]);
      return;
    }
    try {
      const travelersRef = collection(db, 'Users', userId, 'TravelerDetails');
      const snapshot = await getDocs(travelersRef);
      const found: TravelerProfile[] = [];

      for (const doc of snapshot.docs) {
        const travelerDetails = await getTravelerDetails(userId, doc.id);
        if (travelerDetails) {
          found.push({
            id: doc.id,
            firstName: travelerDetails.FirstName,
            middleName: travelerDetails.MiddleName || '',
            lastName: travelerDetails.LastName,
            birthdate: travelerDetails.Birthday,
            gender: travelerDetails.Gender,
            nationality: travelerDetails.Nationality,
            passportNumber: travelerDetails.PassportNumber,
            passportExpiry: travelerDetails.PassportExpiration,
            type: travelerDetails.Type,
          });
        }
      }
      setSavedTravelers(found);
    } catch (error) {
      console.error('Error fetching travelers', error);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchTravelers();
    }, [fetchTravelers])
  );

  useEffect(() => {
    if (itinerary?.traveler) {
      setSelectedTravelers([itinerary.traveler as TravelerProfile]);
    } else if (itinerary?.travelers) {
      setSelectedTravelers(itinerary.travelers as TravelerProfile[]);
    }
  }, [itinerary?.traveler, itinerary?.travelers]);

  const searchDetails = itinerary?.searchDetails;
  const passengerCount = Math.min(Math.max(searchDetails?.passengerCount ?? 1, 1), 10);
  const hasInfantOrChild = selectedTravelers.some(
    t => t.type === 'Infant' || t.type === 'Child'
  );
  const hasAdultOrSenior = selectedTravelers.some(
    t => t.type === 'Adult' || t.type === 'Senior'
  );

  const passengerSelectionError = (() => {
    if (!selectedTravelers.length) {
      return 'Select at least one traveler to continue.';
    }
    if (selectedTravelers.length !== passengerCount) {
      return `Select ${passengerCount} traveler${passengerCount > 1 ? 's' : ''} to match your booking.`;
    }
    if (hasInfantOrChild && !hasAdultOrSenior) {
      return 'Trips with infants or children must include at least one adult traveler.';
    }
    return null;
  })();

  const isCtaDisabled = !!passengerSelectionError || flights.length === 0;
  const totalPrice = flights.reduce((sum: number, f: UIFlight) => sum + (f?.price || 0), 0) * passengerCount;
  const taxesAndFees = Math.round(totalPrice * 0.12);
  const baseFare = Math.max(totalPrice - taxesAndFees, 0);

  const formatCurrency = useCallback((value?: number | null) => {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return '$0.00';
    return `$${numeric.toFixed(2)}`;
  }, []);

  const formatDateLabel = useCallback((date?: Date | string | null) => {
    if (!date) return 'Date TBA';
    const parsed = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(parsed);
  }, []);

  const formatTimeLabel = useCallback((dateValue?: Date | string) => {
    if (!dateValue) return '';
    const parsed = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(parsed);
  }, []);

  const formatLayover = useCallback((arrival?: Date | string, departure?: Date | string) => {
    if (!arrival || !departure) return null;
    const arrDate = typeof arrival === 'string' ? new Date(arrival) : arrival;
    const depDate = typeof departure === 'string' ? new Date(departure) : departure;
    const minutes = Math.max(Math.round((depDate.getTime() - arrDate.getTime()) / (1000 * 60)), 0);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (!Number.isFinite(minutes) || minutes === 0) return null;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m layover`;
  }, []);

  const airlinesWithoutCarryOn = ['F9', 'FRONTIER AIRLINES', 'FRONTIER'];
  const carryOnIncluded = flights.length > 0 && flights.every((f) => {
    const codeOrName = (f.airlineCode || f.airline || '').toUpperCase();
    return !airlinesWithoutCarryOn.includes(codeOrName);
  });

  const hasIncludedBaggage = flights.some((f) => f.hasBaggage) || carryOnIncluded;
  const baggageBadge = hasIncludedBaggage
    ? {
        label: 'Free baggage included',
        color: '#22C55E',
        background: 'rgba(34, 197, 94, 0.1)',
        icon: 'checkmark-circle' as const,
      }
    : {
        label: 'Baggage not included',
        color: '#EF4444',
        background: 'rgba(239, 68, 68, 0.08)',
        icon: 'alert-circle' as const,
      };

  const includedItems = [
    {
      label: 'Checked baggage',
      icon: 'briefcase' as const,
      status: flights.some((f) => f.hasBaggage) ? 'Included' : 'Not included',
      statusColor: flights.some((f) => f.hasBaggage) ? '#22C55E' : '#EF4444',
    },
    {
      label: 'Carry-on bag',
      icon: 'bag-handle' as const,
      status: carryOnIncluded ? 'Included' : 'Not included',
      statusColor: carryOnIncluded ? '#22C55E' : '#EF4444',
    },
    {
      label: 'Seat selection',
      icon: 'person' as const,
      status: 'Extra fee',
      statusColor: '#F97316',
    },
    {
      label: 'Cancellation',
      icon: 'close-circle' as const,
      status: 'Non-refundable',
      statusColor: '#EF4444',
    },
  ];

  const renderAirlineBadge = (flight: UIFlight) => {
    const logoUri = flight.airlineCode ? `${getURL()}/logos/${flight.airlineCode}.png` : undefined;

    return (
      <View style={[styles.airlineLogo, { backgroundColor: `${flight.airlineColor || '#0071E2'}20` }]}>
        {logoUri ? (
          <Image
            source={{ uri: logoUri }}
            resizeMode="contain"
            style={styles.airlineLogoImage}
          />
        ) : (
          <SkyboundText variant="primaryBold" size={12} style={{ color: flight.airlineColor || '#0071E2' }}>
            {flight.airlineCode || flight.airline?.slice(0, 2) || 'XX'}
          </SkyboundText>
        )}
      </View>
    );
  };

  const renderLayoverDetails = (previousLeg: any, currentLeg: any) => {
    const layoverText = formatLayover(previousLeg?.arrivalTime, currentLeg?.departureTime) || 'Layover';
    const airportName = previousLeg?.to?.name || 'Connecting airport';
    const airportCode = previousLeg?.to?.iata || '';
    const departureLabel = formatTimeLabel(currentLeg?.departureTime);

    return (
      <View style={[styles.layoverBox, { backgroundColor: '#F5F8FF', borderColor: '#E5EDFF' }]}> 
        <SkyboundText
          variant="secondary"
          size={13}
          style={{ color: '#1E3A8A', flexShrink: 1, flexWrap: 'wrap' }}
        >
          {layoverText} at {airportCode} • {airportName}
        </SkyboundText>
        {departureLabel ? (
          <SkyboundText variant="secondary" size={12} style={{ color: '#475569', marginTop: 4 }}>
            Next departure at {departureLabel}
          </SkyboundText>
        ) : null}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Main Flight Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <View style={styles.airlineSection}>
              {flights[0] ? (
                renderAirlineBadge(flights[0])
              ) : (
                <View style={[styles.airlineIconBox, { backgroundColor: '#0071E2' }]}>
                  <Ionicons name="airplane" size={14} color="#FFF" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <SkyboundText variant="primary" size={16} style={{ fontWeight: '500', flexShrink: 1 }}>
                  {flights[0]?.airline || 'American Airlines'}
                </SkyboundText>
                <SkyboundText variant="secondary" size={14}>
                  {flights[0]?.cabinClass || 'Main Basic'}
                </SkyboundText>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <SkyboundText variant="primary" size={24} style={{ fontWeight: '600' }}>
                {formatCurrency(totalPrice || flights[0]?.price || 428)}
              </SkyboundText>
              <SkyboundText variant="secondary" size={14}>round trip</SkyboundText>
            </View>
          </View>

          <View style={[styles.baggageBadge, { backgroundColor: baggageBadge.background }]}>
            <Ionicons name={baggageBadge.icon} size={14} color={baggageBadge.color} />
            <SkyboundText variant="primary" size={14} style={{ color: baggageBadge.color }}>
              {baggageBadge.label}
            </SkyboundText>
          </View>

          {/* Flight Segments */}
          <View style={{ gap: 16, marginTop: 16 }}>
            {flights.map((flight: UIFlight, idx: number) => {
              const isOutbound = idx === 0;
              const borderColor = isOutbound ? '#0071E2' : '#D1D5DB';
              const dateValue = isOutbound
                ? searchDetails?.departureDate
                : searchDetails?.returnDate || searchDetails?.legsDates?.[idx];

              return (
                <View key={idx} style={[styles.segment, { borderLeftColor: borderColor }]}> 
                  <View style={[styles.segmentHeader, { alignItems: 'center' }]}>
                    <View style={styles.segmentAirline}>
                      {renderAirlineBadge(flight)}
                      <View style={{ flex: 1 }}>
                        <SkyboundText variant="primaryBold" size={16} style={{ flexShrink: 1 }}>
                          {flight.airline}
                        </SkyboundText>
                        <SkyboundText variant="secondary" size={12} style={{ flexShrink: 1 }}>
                          {flight.departureCode} → {flight.arrivalCode}
                        </SkyboundText>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <SkyboundText variant="primary" size={14} style={{ fontWeight: '500' }}>
                        {flight.duration}
                      </SkyboundText>
                      <SkyboundText variant="secondary" size={13}>
                        {flight.stops}
                      </SkyboundText>
                    </View>
                  </View>

                  <View style={styles.segmentTimes}>
                    <View style={styles.timeBlock}>
                      <SkyboundText variant="primaryBold" size={18}>
                        {flight.departureTime}
                      </SkyboundText>
                      <SkyboundText variant="secondary" size={12}>
                        {formatDateLabel(dateValue)} • {flight.departureCode}
                      </SkyboundText>
                    </View>
                    <View style={styles.segmentLine}>
                      <View style={[styles.pathDot, { backgroundColor: '#CBD5E1' }]} />
                      <View style={[styles.pathLineBar, { backgroundColor: '#CBD5E1' }]} />
                      <View style={[styles.pathDot, { backgroundColor: '#CBD5E1' }]} />
                    </View>
                    <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
                      <SkyboundText variant="primaryBold" size={18}>
                        {flight.arrivalTime}
                      </SkyboundText>
                      <SkyboundText variant="secondary" size={12}>
                        {formatDateLabel(dateValue)} • {flight.arrivalCode}
                      </SkyboundText>
                    </View>
                  </View>

                  <View style={styles.flightMetaRow}>
                    <SkyboundText variant="secondary" size={12} style={{ flexShrink: 1 }}>
                      Flight {flight.airlineCode}{flight.id}
                    </SkyboundText>
                    <SkyboundText variant="secondary" size={12}>
                      {flight.cabinClass}
                    </SkyboundText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Route Details */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SkyboundText variant="primaryBold" size={18} style={{ marginBottom: 16 }}>
            Route Details
          </SkyboundText>
          <View style={{ gap: 20 }}>
            {flights.map((flight, flightIdx) => {
              const legs = flight.legs || [];
              const isRoundTrip = flights.length > 1;
              const label = isRoundTrip
                ? flightIdx === 0 ? 'Outbound' : 'Return'
                : 'Journey';
              const dateValue = flightIdx === 0
                ? searchDetails?.departureDate
                : searchDetails?.returnDate || searchDetails?.legsDates?.[flightIdx];

              if (legs.length === 0) {
                return (
                  <View key={`route-${flightIdx}`} style={{ gap: 12 }}>
                    <View style={styles.detailRow}>
                      <Ionicons name="airplane" size={18} color="#0071E2" />
                      <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                        {label} • {formatDateLabel(dateValue)}
                      </SkyboundText>
                    </View>
                    <SkyboundText variant="secondary" size={14}>
                      {flight.stops.toLowerCase().includes('nonstop') || flight.stops.toLowerCase().includes('non-stop')
                        ? 'Non-stop flight'
                        : flight.stops}
                    </SkyboundText>
                  </View>
                );
              }

              return (
                <View key={`route-${flightIdx}`} style={{ gap: 12 }}>
                  <View style={styles.detailRow}>
                    <Ionicons name="airplane" size={18} color="#0071E2" />
                    <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                      {label} • {formatDateLabel(dateValue)}
                    </SkyboundText>
                  </View>

                  {legs.map((leg, legIdx) => {
                    const previousLeg = legs[legIdx - 1];

                    return (
                      <View key={`${flightIdx}-${legIdx}`} style={{ gap: 12 }}>
                        {legIdx > 0 && renderLayoverDetails(previousLeg, leg)}

                        <View style={[styles.routeCard, { backgroundColor: colors.card }]}> 
                          <View style={styles.routeAirlineRow}>
                            {renderAirlineBadge(flight)}
                            <View style={{ flex: 1 }}>
                              <SkyboundText variant="primaryBold" size={15} style={{ flexShrink: 1 }}>
                                {flight.airline}
                              </SkyboundText>
                              <SkyboundText variant="secondary" size={12} style={{ flexShrink: 1 }}>
                                {flight.airlineCode} {leg.flightNumber || leg.flightId || ''}
                              </SkyboundText>
                            </View>
                          </View>

                          <View style={styles.routeTimesRow}>
                            <View style={styles.routeStop}>
                              <SkyboundText variant="primaryBold" size={16}>
                                {formatTimeLabel(leg.departureTime)}
                              </SkyboundText>
                              <SkyboundText variant="secondary" size={13} style={{ flexShrink: 1, flexWrap: 'wrap' }}>
                                {leg.from.iata} • {leg.from.name}
                              </SkyboundText>
                            </View>

                            <View style={styles.routeConnector}>
                              <View style={[styles.pathDot, { backgroundColor: '#CBD5E1' }]} />
                              <View style={[styles.pathLineBar, { backgroundColor: '#CBD5E1' }]} />
                              <View style={[styles.pathDot, { backgroundColor: '#CBD5E1' }]} />
                              <SkyboundText variant="secondary" size={12} style={{ marginTop: 6 }}>
                                {leg.duration ? `${Math.floor(leg.duration / 60)}h ${leg.duration % 60}m` : '—'}
                              </SkyboundText>
                            </View>

                            <View style={[styles.routeStop, { alignItems: 'flex-start' }]}>
                              <SkyboundText variant="primaryBold" size={16}>
                                {formatTimeLabel(leg.arrivalTime)}
                              </SkyboundText>
                              <SkyboundText
                                variant="secondary"
                                size={13}
                                style={{ textAlign: 'left', flexShrink: 1, flexWrap: 'wrap' }}
                              >
                                {leg.to.iata} • {leg.to.name}
                              </SkyboundText>
                          </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                  {legs.length === 1 && (
                    <SkyboundText variant="secondary" size={14}>
                      Non-stop flight
                    </SkyboundText>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* What's Included */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SkyboundText variant="primaryBold" size={18} style={{ marginBottom: 16 }}>
            What's Included
          </SkyboundText>
          <View style={{ gap: 12 }}>
            {includedItems.map((item) => (
              <View style={styles.includedRow} key={item.label}>
                <View style={styles.includedLabel}>
                  <Ionicons name={item.icon} size={16} color={item.statusColor} />
                  <SkyboundText variant="primary" size={14}>{item.label}</SkyboundText>
                </View>
                <SkyboundText variant="primary" size={14} style={{ color: item.statusColor }}>
                  {item.status}
                </SkyboundText>
              </View>
            ))}
          </View>
          <View style={[styles.infoBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="information-circle" size={12} color="#1D4ED8" />
            <SkyboundText variant="primary" size={12} style={{ color: '#1D4ED8', flex: 1 }}>
              Changes permitted for a fee. Fare rules apply.
            </SkyboundText>
          </View>
        </View>

        {/* Passenger Information */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <SkyboundText variant="primaryBold" size={18}>Traveler</SkyboundText>
            <Pressable
              onPress={() =>
                savedTravelers.length
                  ? setTravelerModalVisible(true)
                  : goToTravelerDetails()
              }
            >
              <SkyboundText variant="primary" size={14} style={{ color: colors.link }}>
                {savedTravelers.length ? 'Add traveler' : 'Add profile'}
              </SkyboundText>
            </Pressable>
          </View>

          {selectedTravelers.length > 0 ? (
            <View style={{ gap: 10 }}>
              {selectedTravelers.map((traveler) => (
                <View style={styles.passengerRow} key={traveler.id}>
                  <View style={[styles.avatar, { backgroundColor: colors.link }]}>
                    <SkyboundText variant="primaryBold" size={16} style={{ color: '#FFF' }}>
                      {`${traveler.firstName.charAt(0)}${traveler.lastName.charAt(0)}`}
                    </SkyboundText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                      {traveler.firstName} {traveler.lastName}
                    </SkyboundText>
                    <SkyboundText variant="secondary" size={14}>
                      {traveler.type || 'Traveler'} • {flights[0]?.cabinClass || 'Economy'}
                    </SkyboundText>
                  </View>
                </View>
              ))}

              <SkyboundText variant="secondary" size={12}>
                {selectedTravelers.length}/{passengerCount} traveler
                {passengerCount > 1 ? 's' : ''} selected
              </SkyboundText>

              {passengerSelectionError && (
                <SkyboundText variant="secondary" size={12} style={{ color: '#EF4444', marginTop: 4 }}>
                  {passengerSelectionError}
                </SkyboundText>
              )}
            </View>
          ) : savedTravelers.length > 0 ? (
            <SkyboundText variant="secondary" size={14}>
              Select who is flying to continue.
            </SkyboundText>
          ) : (
            <View style={{ gap: 8 }}>
              <SkyboundText variant="secondary" size={14}>
                No travelers saved. Add one to speed up checkout.
              </SkyboundText>
              <Pressable
                style={[styles.addTravelerButton, { backgroundColor: colors.link }]}
                onPress={goToTravelerDetails}
              >
                <SkyboundText variant="primaryBold" size={14} style={{ color: '#FFF' }}>
                  Add traveler
                </SkyboundText>
              </Pressable>
            </View>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SkyboundText variant="primaryBold" size={18} style={{ marginBottom: 16 }}>
            Price Breakdown
          </SkyboundText>
          <View style={{ gap: 12 }}>
            <View style={styles.priceRow}>
              <SkyboundText variant="secondary" size={14}>Passengers</SkyboundText>
              <SkyboundText variant="primary" size={14}>{passengerCount}</SkyboundText>
            </View>
            <View style={styles.priceRow}>
              <SkyboundText variant="secondary" size={14}>Base fare</SkyboundText>
              <SkyboundText variant="primary" size={14}>{formatCurrency(baseFare || totalPrice || 0)}</SkyboundText>
            </View>
            <View style={styles.priceRow}>
              <SkyboundText variant="secondary" size={14}>Taxes & fees</SkyboundText>
              <SkyboundText variant="primary" size={14}>{formatCurrency(taxesAndFees)}</SkyboundText>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <SkyboundText variant="primaryBold" size={16}>Total</SkyboundText>
              <SkyboundText variant="primaryBold" size={20}>{formatCurrency(totalPrice || 428)}</SkyboundText>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={travelerModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setTravelerModalVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <SkyboundText variant="primaryBold" size={18} style={{ marginBottom: 12 }}>
              Choose traveler
            </SkyboundText>

            {savedTravelers.length === 0 && (
              <SkyboundText variant="secondary" size={14} style={{ marginBottom: 12 }}>
                You don’t have any saved travelers yet.
              </SkyboundText>
            )}

            {savedTravelers.map(traveler => {
              const isSelected = selectedTravelers.some(t => t.id === traveler.id);

              return (
                <Pressable
                  key={traveler.id}
                  style={styles.travelerOption}
                  onPress={() => {
                    setSelectedTravelers((prev) => {
                      const already = prev.some(t => t.id === traveler.id);
                      if (already) {
                        // Unselect
                        return prev.filter(t => t.id !== traveler.id);
                      }
                      if (prev.length >= passengerCount) {
                        Alert.alert(
                          'Passenger limit reached',
                          `You can select up to ${passengerCount} traveler${passengerCount > 1 ? 's' : ''} for this booking.`
                        );
                        return prev;
                      }
                      return [...prev, traveler];
                    });
                  }}
                >
                  <View style={[styles.avatarSmall, { backgroundColor: colors.link }]}>
                    <SkyboundText variant="primaryBold" size={14} style={{ color: '#FFF' }}>
                      {`${traveler.firstName.charAt(0)}${traveler.lastName.charAt(0)}`}
                    </SkyboundText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                      {traveler.firstName} {traveler.lastName}
                    </SkyboundText>
                    <SkyboundText variant="secondary" size={13}>
                      {traveler.type || 'Traveler'} • {traveler.nationality || 'Nationality TBD'}
                    </SkyboundText>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.link} />
                  )}
                </Pressable>
              );
            })}

            <Pressable
              style={[styles.addTravelerButton, { backgroundColor: colors.link, marginTop: 12 }]}
              onPress={() => {
                setTravelerModalVisible(false);
                goToTravelerDetails();
              }}
            >
              <SkyboundText variant="primaryBold" size={14} style={{ color: '#FFF' }}>
                Add new traveler
              </SkyboundText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.divider }]}>
        <Pressable
          style={[styles.ctaButton, isCtaDisabled && { opacity: 0.5 }]}
          disabled={isCtaDisabled}
          onPress={() => {
            navigation.navigate('Payment', {
              itinerary: {
                ...(itinerary || { flights }),
                flights,
                // for backward compatibility, keep first traveler AND full list:
                traveler: selectedTravelers[0],
                travelers: selectedTravelers,
              },
            });
          }}
        >

          <LinearGradient
            colors={['#0071E2', '#2F97FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <SkyboundText variant="primaryBold" size={16} style={{ color: '#FFF' }}>
            Continue to Payment
          </SkyboundText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  airlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  airlineIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baggageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  segment: {
    borderLeftWidth: 2,
    paddingLeft: 18,
    gap: 12,
    paddingVertical: 12,
    paddingRight: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  segmentAirline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  segmentTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  timeBlock: {
    flex: 1,
    gap: 2,
  },
  segmentLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
    gap: 6,
  },
  flightMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeSegment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeStop: {
    gap: 4,
    flex: 1,
    minWidth: 140,
  },
  dashedLine: {
    height: 32,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginLeft: 8,
  },
  layoverBox: {
    padding: 12,
    borderRadius: 12,
    marginLeft: 0,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  includedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  includedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTravelerButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  travelerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  airlineLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  airlineLogoImage: {
    width: 28,
    height: 28,
  },
  routeCard: {
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  routeAirlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  routeTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  routeConnector: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
    minWidth: 82,
  },
});
