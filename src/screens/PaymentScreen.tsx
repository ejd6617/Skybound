import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getURL } from "@src/api/SkyboundUtils";
import type { FlightStackParamList } from '@src/nav/RootNavigator';
import type { ItineraryPayload, SearchDetails } from '@src/screens/FlightResultsScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { auth, db } from '../firebase';

export default function PaymentScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<FlightStackParamList, 'Payment'>>();
  const route = useRoute<RouteProp<FlightStackParamList, 'Payment'>>();
  const isDark = colors.background !== '#FFFFFF';

  //use states for saving payment data
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  //use Effect for fetching card data from firestore:
  useEffect(() => {
    async function loadMethods() {
      if (!auth.currentUser) return;

      const uid = auth.currentUser.uid;
      const ref = collection(db, "Users", uid, "payments");
      const snap = await getDocs(ref);

      const methods = snap.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          label: "Card", // <-- used in your UI badge
          detail: `•••• ${data.lastFourDigits} · exp ${data.expirationDate}`,
          cardholderName: data.cardholderName,
          expiration: data.expirationDate,
          lastFourDigits: data.lastFourDigits,
        };
      });

      setSavedPaymentMethods(methods);

      // auto-select primary method
      const primary = snap.docs.find((d) => d.data().isPrimary);
      if (primary) setSelectedPaymentId(primary.id);
    }

    loadMethods();
  }, []);

  const {
    itinerary,
    selectedFlights = [],
    tripType,
    fromCode,
    toCode,
    departureDate,
    returnDate,
  } = (route.params as {
    itinerary?: ItineraryPayload;
    selectedFlights?: any[];
    tripType?: string;
    fromCode?: string;
    toCode?: string;
    departureDate?: Date | string | null;
    returnDate?: Date | string | null;
  }) || {};

  const flights = itinerary?.flights ?? selectedFlights ?? [];
  const searchDetails: SearchDetails | undefined =
    itinerary?.searchDetails ??
    (tripType
      ? {
          tripType: tripType as SearchDetails['tripType'],
          fromCode,
          toCode,
          departureDate,
          returnDate,
        }
      : undefined);
  const passengerCount = Math.min(Math.max(searchDetails?.passengerCount ?? 1, 1), 10);

  const formatDateLabel = (date?: Date | string | null) => {
    if (!date) return 'Date TBA';
    const parsed = typeof date === 'string' ? new Date(date) : date;
    if (!parsed || Number.isNaN(parsed.getTime())) return 'Date TBA';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(parsed);
  };

  const formatTimeLabel = (dateValue?: Date | string) => {
    if (!dateValue) return '';
    const parsed = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (!parsed || Number.isNaN(parsed.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(parsed);
  };

  const airlinesWithoutCarryOn = ['F9', 'FRONTIER AIRLINES', 'FRONTIER'];
  const carryOnIncluded = flights.length > 0 && flights.every((f) => {
    const codeOrName = (f.airlineCode || f.airline || '').toUpperCase();
    return !airlinesWithoutCarryOn.includes(codeOrName);
  });

  const hasIncludedBaggage = flights.some((f) => f.hasBaggage) || carryOnIncluded;

  const [expandedFlightIndex, setExpandedFlightIndex] = useState<number | null>(null);

  // Calculate pricing
  const basePriceFromFlights = flights.reduce((sum: number, f: any) => sum + (f?.price || 0), 0);
  const basePricePerTraveler = basePriceFromFlights || 398;
  const subtotal = basePricePerTraveler * passengerCount;
  const taxesAndFees = Math.round(subtotal * 0.075);
  const totalPrice = subtotal + taxesAndFees;

  const formatCurrency = (value?: number | null) => {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return '$0.00';
    return `$${numeric.toFixed(2)}`;
  };

  const toggleFlightExpansion = (index: number) => {
    setExpandedFlightIndex(expandedFlightIndex === index ? null : index);
  };

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

  const renderAirlineBadge = (flight: any) => {
    const logoUri = flight?.airlineCode ? `${getURL()}/logos/${flight.airlineCode}.png` : undefined;
    const badgeColor = `${flight?.airlineColor || '#0071E2'}20`;

    return (
      <View style={[styles.airlineBadge, { backgroundColor: badgeColor }]}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.airlineLogo} resizeMode="contain" />
        ) : (
          <View style={[styles.airlinePlaceholder, { backgroundColor: colors.link }]} />
        )}
        <View style={{ flex: 1 }}>
          <SkyboundText variant="primary" size={14} numberOfLines={1} style={{ flexShrink: 1 }}>
            {flight?.airline || 'Frontier Airlines'}
          </SkyboundText>
          <SkyboundText variant="secondary" size={12} style={{ color: colors.icon }}>
            {flight?.airlineCode || 'F9'}
          </SkyboundText>
        </View>
      </View>
    );
  };

  const renderFlightCard = (flight: any, index: number) => {
    const isExpanded = expandedFlightIndex === index;
    const isOutbound = index === 0;
    const cabinClass = flight?.cabinClass || 'Economy';
    const departureCode = flight?.departureCode || (isOutbound ? searchDetails?.fromCode || 'CLE' : searchDetails?.toCode || 'LAX');
    const arrivalCode = flight?.arrivalCode || (isOutbound ? searchDetails?.toCode || 'LAX' : searchDetails?.fromCode || 'CLE');
    const departureCity = flight?.departureCity || flight?.departureName || departureCode;
    const arrivalCity = flight?.arrivalCity || flight?.arrivalName || arrivalCode;
    const departureLabel = formatTimeLabel(flight?.rawDepartureTime ?? flight?.departureTime) || flight?.departureTime || '12:41 PM';
    const arrivalLabel = formatTimeLabel(flight?.rawArrivalTime ?? flight?.arrivalTime) || flight?.arrivalTime || '3:43 PM';
    const duration = flight?.duration || '3h 02m';
    const stops = flight?.stops || 'Non-stop';
    const departureDateLabel = formatDateLabel(flight?.rawDepartureTime ?? flight?.departureDate ?? departureDate);
    const arrivalDateLabel = formatDateLabel(flight?.rawArrivalTime ?? flight?.arrivalDate ?? returnDate ?? departureDate);

    return (
      <Pressable
        key={index}
        onPress={() => toggleFlightExpansion(index)}
        style={({ pressed }) => [
          styles.sectionCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.divider,
            opacity: pressed ? 0.96 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Flight ${index + 1} details`}
      >
        <View style={styles.cardHeader}>
          {renderAirlineBadge(flight)}
          <View style={[styles.cabinChip, { backgroundColor: isDark ? '#1F2937' : '#EEF2FF' }]}>
            <SkyboundText
              variant="primary"
              size={12}
              accessabilityLabel="Cabin class"
              style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}
            >
              {cabinClass}
            </SkyboundText>
          </View>
        </View>

        <View style={styles.timelineRow}>
          <View style={styles.timeBlock}>
            <SkyboundText variant="primaryBold" size={20} accessabilityLabel="Departure time">
              {departureLabel}
            </SkyboundText>
            <SkyboundText
              variant="secondary"
              size={13}
              style={{ color: colors.icon }}
              numberOfLines={2}
              accessabilityLabel="Departure airport"
            >
              {departureCode} • {departureCity}
            </SkyboundText>
            <SkyboundText variant="secondary" size={12} style={{ color: colors.icon }}>
              {departureDateLabel}
            </SkyboundText>
          </View>

          <View style={styles.timelineMiddle}>
            <SkyboundText variant="secondary" size={12} style={{ color: colors.icon }}>
              {duration}
            </SkyboundText>
            <View style={styles.timelineLineWrapper}>
              <View style={[styles.dot, { backgroundColor: colors.link }]} />
              <View style={[styles.dottedLine, { borderColor: colors.link }]} />
              <Ionicons name="time-outline" size={16} color={colors.link} />
              <View style={[styles.dottedLine, { borderColor: colors.link }]} />
              <View style={[styles.dot, { backgroundColor: colors.link }]} />
            </View>
            <SkyboundText variant="secondary" size={12} style={{ color: colors.icon }} numberOfLines={1}>
              {stops}
            </SkyboundText>
          </View>

          <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
            <SkyboundText variant="primaryBold" size={20} accessabilityLabel="Arrival time">
              {arrivalLabel}
            </SkyboundText>
            <SkyboundText
              variant="secondary"
              size={13}
              style={{ color: colors.icon, textAlign: 'right' }}
              numberOfLines={2}
              accessabilityLabel="Arrival airport"
            >
              {arrivalCode} • {arrivalCity}
            </SkyboundText>
            <SkyboundText variant="secondary" size={12} style={{ color: colors.icon }}>
              {arrivalDateLabel}
            </SkyboundText>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: baggageBadge.background }]}>
            <Ionicons name={baggageBadge.icon} size={14} color={baggageBadge.color} />
            <SkyboundText variant="primary" size={13} style={{ color: baggageBadge.color }}>
              {baggageBadge.label}
            </SkyboundText>
          </View>
          <View style={[styles.metaChip, { backgroundColor: isDark ? '#111827' : '#EFF6FF' }]}>
            <Ionicons name="people" size={14} color={colors.link} />
            <SkyboundText variant="primary" size={13} style={{ color: colors.text }}>
              {passengerCount} passenger{passengerCount > 1 ? 's' : ''}
            </SkyboundText>
          </View>
          <View style={[styles.metaChip, { backgroundColor: isDark ? '#111827' : '#F3F4F6' }]}>
            <Ionicons name="briefcase-outline" size={14} color={colors.icon} />
            <SkyboundText variant="primary" size={13} style={{ color: colors.text }}>
              {cabinClass}
            </SkyboundText>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.expandedDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.icon} />
                <SkyboundText variant="primary" size={14} style={{ marginLeft: 8 }}>
                  {departureDateLabel}
                </SkyboundText>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="bag-handle-outline" size={18} color={colors.icon} />
                <SkyboundText variant="primary" size={14} style={{ marginLeft: 8 }}>
                  Carry-on: {carryOnIncluded ? 'Included' : 'Not included'}
                </SkyboundText>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="briefcase-outline" size={18} color={colors.icon} />
                <SkyboundText variant="primary" size={14} style={{ marginLeft: 8 }}>
                  Checked bag: {flight?.hasBaggage ? 'Included' : 'Not included'}
                </SkyboundText>
              </View>
            </View>
          </View>
        )}

        <View style={styles.expandIndicator}>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.icon} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <SkyboundText variant="primaryBold" size={22} style={{ marginBottom: 12 }}>
          Payment
        </SkyboundText>

        <View style={{ gap: 16 }}>
          {flights.length > 0 ? (
            flights.map((flight: any, index: number) => renderFlightCard(flight, index))
          ) : (
            <View
              style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.divider }]}
            >
              <SkyboundText variant="secondary" size={14} style={{ color: colors.icon }}>
                Flight details will appear here once you pick an option.
              </SkyboundText>
            </View>
          )}

          <View
            style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.divider }]}
          >
            <View style={styles.sectionHeader}>
              <SkyboundText variant="primaryBold" size={18}>
                Payment Method
              </SkyboundText>
              {selectedPaymentId && (
                <View style={styles.pill}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.link} />
                  <SkyboundText variant="secondary" size={12} style={{ color: colors.link }}>
                    Selected
                  </SkyboundText>
                </View>
              )}
            </View>

            {savedPaymentMethods.length === 0 && (
              <SkyboundText variant="secondary" size={14} style={{ marginBottom: 8, color: colors.icon }}>
                You don’t have any saved payment methods yet.
              </SkyboundText>
            )}

            {savedPaymentMethods.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setSelectedPaymentId(method.id)}
                style={({ pressed }) => [
                  styles.paymentOption,
                  {
                    backgroundColor: selectedPaymentId === method.id ? `${colors.link}10` : colors.card,
                    borderColor:
                      selectedPaymentId === method.id ? colors.link : colors.outline,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select ${method.label}`}
              >
                <View style={styles.paymentOptionContent}>
                  <View style={[styles.visaLogo, { backgroundColor: colors.link }]}>
                    <SkyboundText
                      variant="primaryButton"
                      size={12}
                      accessabilityLabel={method.label}
                      style={{ color: 'white', fontWeight: '700' }}
                    >
                      {method.label.toUpperCase()}
                    </SkyboundText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <SkyboundText variant="primary" size={14} accessabilityLabel="Card number">
                      {method.detail.split('·')[0]}
                    </SkyboundText>
                    <SkyboundText
                      variant="secondary"
                      size={12}
                      accessabilityLabel="Expiration"
                      style={{ marginTop: 2, color: colors.icon }}
                    >
                      {method.detail.split('·')[1]?.trim() || ''}
                    </SkyboundText>
                  </View>
                </View>
                {selectedPaymentId === method.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.link} />
                )}
              </Pressable>
            ))}

            <Pressable
              onPress={() => navigation.navigate('PaymentMethod')}
              style={({ pressed }) => [
                styles.addCardButton,
                {
                  borderColor: colors.outline,
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Add new card"
            >
              <Ionicons name="add" size={16} color={colors.link} />
              <SkyboundText
                variant="primary"
                size={14}
                accessabilityLabel="Add New Card"
                style={{ color: colors.link, marginLeft: 8 }}
              >
                Add New Card
              </SkyboundText>
            </Pressable>
          </View>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                borderColor: colors.divider,
              },
            ]}
          >
            <SkyboundText variant="primaryBold" size={18} style={{ marginBottom: 12 }}>
              Price summary
            </SkyboundText>
            <View style={{ gap: 10 }}>
              <View style={styles.fareRow}>
                <SkyboundText variant="secondary" size={14}>Passengers</SkyboundText>
                <SkyboundText variant="primary" size={14}>{passengerCount}</SkyboundText>
              </View>
              <View style={styles.fareRow}>
                <SkyboundText variant="secondary" size={14}>
                  Base fare ({formatCurrency(basePricePerTraveler)} ea)
                </SkyboundText>
                <SkyboundText variant="primary" size={14}>{formatCurrency(subtotal)}</SkyboundText>
              </View>
              <View style={styles.fareRow}>
                <SkyboundText variant="secondary" size={14}>Taxes & fees</SkyboundText>
                <SkyboundText variant="primary" size={14}>{formatCurrency(taxesAndFees)}</SkyboundText>
              </View>
              <View style={[styles.fareRow, styles.totalRow]}>
                <SkyboundText variant="primaryBold" size={16}>Total</SkyboundText>
                <SkyboundText variant="primaryBold" size={20}>{formatCurrency(totalPrice)}</SkyboundText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.divider }]}>
        <View style={styles.totalInline}>
          <View>
            <SkyboundText variant="secondary" size={13} style={{ color: colors.icon }}>
              Due now
            </SkyboundText>
            <SkyboundText variant="primaryBold" size={18}>{formatCurrency(totalPrice)}</SkyboundText>
          </View>
          <View style={[styles.pill, { backgroundColor: `${colors.link}15` }]}>
            <Ionicons name="shield-checkmark" size={14} color={colors.link} />
            <SkyboundText variant="secondary" size={12} style={{ color: colors.link }}>
              Secure checkout
            </SkyboundText>
          </View>
        </View>

        <Pressable
          style={[styles.continueButton]}
          onPress={() =>
            navigation.navigate('FlightConfirmation', {
              itinerary: {
                ...(itinerary || { flights }),
                flights,
                traveler: itinerary?.traveler,
                paymentMethodId: selectedPaymentId,
                totalPrice,
                searchDetails: itinerary?.searchDetails,
              },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Continue to confirmation"
        >
          <LinearGradient
            colors={['#0071E2', '#2F97FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
          />
          <SkyboundText
            variant="primaryButton"
            size={16}
            accessabilityLabel="Continue"
            style={{ color: 'white', fontWeight: '600' }}
          >
            Continue
          </SkyboundText>
        </Pressable>
        <SkyboundText
          variant="secondary"
          size={12}
          accessabilityLabel="Terms and conditions"
          style={{ textAlign: 'center', marginTop: 8, color: colors.icon }}
        >
          By continuing, you agree to our Terms & Conditions
        </SkyboundText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingTop: 10,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  airlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    flex: 1,
  },
  airlineLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  airlinePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  cabinChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeBlock: {
    flex: 1,
    gap: 4,
  },
  timelineMiddle: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: 110,
  },
  timelineLineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dottedLine: {
    flex: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginHorizontal: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  expandedDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  visaLogo: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    gap: 8,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  totalInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
