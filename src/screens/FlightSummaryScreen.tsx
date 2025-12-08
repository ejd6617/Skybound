import SkyboundText from "@components/ui/SkyboundText";
import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { db } from "@src/firebase";
import { getTravelerDetails } from "@src/firestoreFunctions";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import type { ItineraryPayload, UIFlight } from "@src/screens/FlightResultsScreen";
import type { TravelerProfile } from "@src/types/travelers";
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function FlightSummaryScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FlightSummary'>>();

  const { itinerary } = (route.params as { itinerary?: ItineraryPayload }) || {};
  const flights: UIFlight[] = itinerary?.flights ?? [];
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerProfile | null>(itinerary?.traveler ?? null);
  const [travelerModalVisible, setTravelerModalVisible] = useState(false);
  const [savedTravelers, setSavedTravelers] = useState<TravelerProfile[]>([]);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const goToTravelerDetails = useCallback(() => {
    const parent = navigation.getParent();
    parent?.navigate('Accounts' as never, { screen: 'TravelerDetails' } as never);
  }, [navigation]);

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
      setSelectedTraveler(itinerary.traveler as TravelerProfile);
    }
  }, [itinerary?.traveler]);

  const searchDetails = itinerary?.searchDetails;
  const totalPrice = flights.reduce((sum: number, f: UIFlight) => sum + (f?.price || 0), 0);
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Main Flight Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <View style={styles.airlineSection}>
              <View style={[styles.airlineIconBox, { backgroundColor: '#0071E2' }]}>
                <Ionicons name="airplane" size={14} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
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

          <View style={[styles.baggageBadge, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
            <SkyboundText variant="primary" size={14} style={{ color: '#22C55E' }}>
              Free Baggage Included
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
                  <View style={styles.segmentHeader}>
                    <View style={{ flex: 1 }}>
                      <SkyboundText variant="primaryBold" size={18}>
                        {flight.departureCode} → {flight.arrivalCode}
                      </SkyboundText>
                      <SkyboundText variant="secondary" size={14}>
                        {flight.departureCode} to {flight.arrivalCode}
                      </SkyboundText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <SkyboundText variant="primary" size={14} style={{ fontWeight: '500' }}>
                        {flight.duration}
                      </SkyboundText>
                      <SkyboundText variant="secondary" size={14}>
                        {flight.stops}
                      </SkyboundText>
                    </View>
                  </View>
                  <View style={styles.segmentTimes}>
                    <SkyboundText variant="secondary" size={14}>
                      {formatDateLabel(dateValue)} • {flight.departureTime}
                    </SkyboundText>
                    <SkyboundText variant="secondary" size={14}>
                      {formatDateLabel(dateValue)} • {flight.arrivalTime}
                    </SkyboundText>
                  </View>
                  <SkyboundText variant="secondary" size={12}>
                    Flight {flight.airlineCode}{flight.id} • {flight.cabinClass}
                  </SkyboundText>
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
                    const layoverText = legIdx === 0
                      ? null
                      : formatLayover(legs[legIdx - 1].arrivalTime, leg.departureTime);

                    return (
                      <View key={`${flightIdx}-${legIdx}`} style={{ gap: 8 }}>
                        {legIdx > 0 && (
                          <>
                            <View style={styles.dashedLine} />
                            <View style={[styles.layoverBox, { backgroundColor: '#F9FAFB' }]}>
                              <SkyboundText variant="secondary" size={14}>
                                {layoverText || 'Layover'} at {legs[legIdx - 1].to.iata}
                              </SkyboundText>
                            </View>
                          </>
                        )}
                        <View style={styles.routeSegment}>
                          <View style={styles.routeStop}>
                            <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                              {formatTimeLabel(leg.departureTime)} - {leg.from.iata}
                            </SkyboundText>
                            <SkyboundText variant="secondary" size={14}>
                              {leg.from.name}
                            </SkyboundText>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <SkyboundText variant="secondary" size={14}>
                              {flight.airlineCode} {leg.flightNumber || leg.flightId || ''}
                            </SkyboundText>
                          </View>
                        </View>
                        <View style={styles.dashedLine} />
                        <View style={styles.routeStop}>
                          <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                            {formatTimeLabel(leg.arrivalTime)} - {leg.to.iata}
                          </SkyboundText>
                          <SkyboundText variant="secondary" size={14}>
                            {leg.to.name}
                          </SkyboundText>
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
            <View style={styles.includedRow}>
              <View style={styles.includedLabel}>
                <Ionicons name="briefcase" size={16} color="#22C55E" />
                <SkyboundText variant="primary" size={14}>Checked baggage</SkyboundText>
              </View>
              <SkyboundText variant="primary" size={14} style={{ color: '#22C55E' }}>
                1 x 23kg
              </SkyboundText>
            </View>
            <View style={styles.includedRow}>
              <View style={styles.includedLabel}>
                <Ionicons name="bag-handle" size={16} color="#22C55E" />
                <SkyboundText variant="primary" size={14}>Carry-on bag</SkyboundText>
              </View>
              <SkyboundText variant="primary" size={14} style={{ color: '#22C55E' }}>
                Included
              </SkyboundText>
            </View>
            <View style={styles.includedRow}>
              <View style={styles.includedLabel}>
                <Ionicons name="person" size={16} color="#F97316" />
                <SkyboundText variant="primary" size={14}>Seat selection</SkyboundText>
              </View>
              <SkyboundText variant="primary" size={14} style={{ color: '#F97316' }}>
                Extra fee
              </SkyboundText>
            </View>
            <View style={styles.includedRow}>
              <View style={styles.includedLabel}>
                <Ionicons name="close-circle" size={16} color="#EF4444" />
                <SkyboundText variant="primary" size={14}>Cancellation</SkyboundText>
              </View>
              <SkyboundText variant="primary" size={14} style={{ color: '#EF4444' }}>
                Non-refundable
              </SkyboundText>
            </View>
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
              onPress={() => savedTravelers.length ? setTravelerModalVisible(true) : goToTravelerDetails()}
            >
              <SkyboundText variant="primary" size={14} style={{ color: colors.link }}>
                {savedTravelers.length ? 'Add traveler' : 'Add profile'}
              </SkyboundText>
            </Pressable>
          </View>

          {selectedTraveler ? (
            <View style={styles.passengerRow}>
              <View style={[styles.avatar, { backgroundColor: colors.link }]}>
                <SkyboundText variant="primaryBold" size={16} style={{ color: '#FFF' }}>
                  {`${selectedTraveler.firstName.charAt(0)}${selectedTraveler.lastName.charAt(0)}`}
                </SkyboundText>
              </View>
              <View style={{ flex: 1 }}>
                <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                  {selectedTraveler.firstName} {selectedTraveler.lastName}
                </SkyboundText>
                <SkyboundText variant="secondary" size={14}>
                  {selectedTraveler.type || 'Traveler'} • {flights[0]?.cabinClass || 'Economy'}
                </SkyboundText>
              </View>
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

            {savedTravelers.map(traveler => (
              <Pressable
                key={traveler.id}
                style={styles.travelerOption}
                onPress={() => {
                  setSelectedTraveler(traveler);
                  setTravelerModalVisible(false);
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
                {selectedTraveler?.id === traveler.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.link} />
                )}
              </Pressable>
            ))}

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
          style={[
            styles.ctaButton,
            (!selectedTraveler || flights.length === 0) && { opacity: 0.5 },
          ]}
          disabled={!selectedTraveler || flights.length === 0}
          onPress={() =>
            navigation.navigate('Payment', {
              itinerary: {
                ...(itinerary || { flights }),
                flights,
                traveler: selectedTraveler,
              },
            })
          }
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    gap: 8,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  segmentTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
    borderRadius: 8,
    marginLeft: 8,
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
});
