import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import type { ItineraryPayload } from '@src/screens/FlightResultsScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { auth, db } from '../firebase';

export default function PaymentScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Payment'>>();
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
  const searchDetails = itinerary?.searchDetails ?? { tripType, fromCode, toCode, departureDate, returnDate };

  const [expandedFlightIndex, setExpandedFlightIndex] = useState<number | null>(null);

  // Calculate pricing
  const basePriceFromFlights = flights.reduce((sum: number, f: any) => sum + (f?.price || 0), 0);
  const basePrice = basePriceFromFlights || 398;
  const taxesAndFees = Math.round(basePrice * 0.075);
  const totalPrice = basePrice + taxesAndFees;

  const toggleFlightExpansion = (index: number) => {
    setExpandedFlightIndex(expandedFlightIndex === index ? null : index);
  };

  const renderFlightCard = (flight: any, index: number) => {
    const isExpanded = expandedFlightIndex === index;
    const isOutbound = index === 0;
    const airline = flight?.airline || 'American Airlines';
    const cabinClass = flight?.cabinClass || 'Main Basic';
    const departureTime = flight?.departureTime || '7:20 AM';
    const arrivalTime = flight?.arrivalTime || '1:05 PM';
    const departureCode = flight?.departureCode || (isOutbound ? searchDetails?.fromCode || 'CLE' : searchDetails?.toCode || 'LAX');
    const arrivalCode = flight?.arrivalCode || (isOutbound ? searchDetails?.toCode || 'LAX' : searchDetails?.fromCode || 'CLE');
    const duration = flight?.duration || '5h 45m';
    const stops = flight?.stops || '1 stop DFW';
    const price = flight?.price || basePrice;

    return (
      <Pressable
        key={index}
        onPress={() => toggleFlightExpansion(index)}
        style={({ pressed }) => [
          styles.flightCard,
          {
            backgroundColor: colors.card,
            opacity: pressed ? 0.95 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Flight ${index + 1} details`}
      >
        {/* Condensed View - Always Visible */}
        <View style={styles.flightCardHeader}>
          <View style={styles.airlineRow}>
            <View style={[styles.airlineIcon, { backgroundColor: 'rgba(47, 151, 255, 0.10)' }]}>
              <Ionicons name="airplane" size={16} color={colors.link} />
            </View>
            <View style={{ flex: 1 }}>
              <SkyboundText variant="primary" size={14} accessabilityLabel="Airline name">
                {airline}
              </SkyboundText>
            </View>
            <View
              style={[
                styles.cabinBadge,
                { backgroundColor: isDark ? '#262626' : '#E5E7EB' },
              ]}
            >
              <SkyboundText
                variant="primary"
                size={12}
                accessabilityLabel="Cabin class"
                style={{ color: isDark ? colors.text : '#4B5563' }}
              >
                {cabinClass}
              </SkyboundText>
            </View>
          </View>

          <View style={styles.flightTimeRow}>
            <View style={{ flex: 1 }}>
              <SkyboundText
                variant="primaryBold"
                size={18}
                accessabilityLabel="Departure time"
              >
                {departureTime}
              </SkyboundText>
              <SkyboundText
                variant="secondary"
                size={12}
                accessabilityLabel="Departure airport"
                style={{ marginTop: 2, color: colors.icon }}
              >
                {departureCode}
              </SkyboundText>
            </View>

            <View style={styles.flightPath}>
              <SkyboundText
                variant="secondary"
                size={12}
                accessabilityLabel="Flight duration"
                style={{ textAlign: 'center', color: colors.icon }}
              >
                {duration}
              </SkyboundText>
              <View style={styles.pathLine}>
                <View style={[styles.pathDot, { backgroundColor: colors.outline }]} />
                <View style={[styles.pathLineBar, { backgroundColor: colors.outline }]} />
                <View style={[styles.pathDot, { backgroundColor: colors.outline }]} />
              </View>
              <View style={styles.planeIconContainer}>
                <Ionicons name="airplane" size={14} color={colors.link} />
              </View>
              <SkyboundText
                variant="secondary"
                size={12}
                accessabilityLabel="Flight stops"
                style={{ textAlign: 'center', color: colors.icon, marginTop: 4 }}
              >
                {stops}
              </SkyboundText>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <SkyboundText
                variant="primaryBold"
                size={18}
                accessabilityLabel="Arrival time"
              >
                {arrivalTime}
              </SkyboundText>
              <SkyboundText
                variant="secondary"
                size={12}
                accessabilityLabel="Arrival airport"
                style={{ marginTop: 2, color: colors.icon }}
              >
                {arrivalCode}
              </SkyboundText>
            </View>
          </View>

          <View style={styles.priceRow}>
            <SkyboundText
              variant="primaryBold"
              size={24}
              accessabilityLabel="Flight price"
            >
              ${price.toFixed(2)}
            </SkyboundText>
            <SkyboundText
              variant="secondary"
              size={12}
              accessabilityLabel="Per person label"
              style={{ color: colors.icon, marginTop: 4 }}
            >
              per person
            </SkyboundText>
          </View>
        </View>

        {/* Expanded View - Show on Tap */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.expandedDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.icon} />
                <SkyboundText
                  variant="primary"
                  size={14}
                  accessabilityLabel="Flight date"
                  style={{ marginLeft: 8 }}
                >
                  {isOutbound ? 'Dec 15, 2024' : 'Dec 22, 2024'}
                </SkyboundText>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="briefcase-outline" size={18} color={colors.icon} />
                <SkyboundText
                  variant="primary"
                  size={14}
                  accessabilityLabel="Baggage info"
                  style={{ marginLeft: 8 }}
                >
                  1 checked bag included (23kg)
                </SkyboundText>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="restaurant-outline" size={18} color={colors.icon} />
                <SkyboundText
                  variant="primary"
                  size={14}
                  accessabilityLabel="Meal info"
                  style={{ marginLeft: 8 }}
                >
                  Snacks & beverages included
                </SkyboundText>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="receipt-outline" size={18} color={colors.icon} />
                <SkyboundText
                  variant="primary"
                  size={14}
                  accessabilityLabel="Flight number"
                  style={{ marginLeft: 8 }}
                >
                  Flight AA2847, AA1203
                </SkyboundText>
              </View>
            </View>
          </View>
        )}

        {/* Expand/Collapse Indicator */}
        <View style={styles.expandIndicator}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.icon}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        marginTop: -25,
      }}
    >
      <LinearGradient
        colors={colors.gradient}
        start={colors.gradientStart}
        end={colors.gradientEnd}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          {/* Flight Summary Section */}
          {flights.length > 0 ? (
            flights.map((flight: any, index: number) => renderFlightCard(flight, index))
          ) : (
            <View style={[styles.flightCard, { backgroundColor: colors.card }]}>
              <View style={styles.flightCardHeader}>
                <View style={styles.airlineRow}>
                  <View style={[styles.airlineIcon, { backgroundColor: 'rgba(47, 151, 255, 0.10)' }]}>
                    <Ionicons name="airplane" size={16} color={colors.link} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SkyboundText variant="primary" size={14} accessabilityLabel="Airline name">
                      American Airlines
                    </SkyboundText>
                  </View>
                  <View style={[styles.cabinBadge, { backgroundColor: isDark ? '#262626' : '#E5E7EB' }]}>
                    <SkyboundText
                      variant="primary"
                      size={12}
                      accessabilityLabel="Cabin class"
                      style={{ color: isDark ? colors.text : '#4B5563' }}
                    >
                      Main Basic
                    </SkyboundText>
                  </View>
                </View>

                <View style={styles.flightTimeRow}>
                  <View style={{ flex: 1 }}>
                    <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Departure time">
                      7:20 AM
                    </SkyboundText>
                    <SkyboundText
                      variant="secondary"
                      size={12}
                      accessabilityLabel="Departure airport"
                      style={{ marginTop: 2, color: colors.icon }}
                    >
                      CLE
                    </SkyboundText>
                  </View>

                  <View style={styles.flightPath}>
                    <SkyboundText
                      variant="secondary"
                      size={12}
                      accessabilityLabel="Flight duration"
                      style={{ textAlign: 'center', color: colors.icon }}
                    >
                      5h 45m
                    </SkyboundText>
                    <View style={styles.pathLine}>
                      <View style={[styles.pathDot, { backgroundColor: colors.outline }]} />
                      <View style={[styles.pathLineBar, { backgroundColor: colors.outline }]} />
                      <View style={[styles.pathDot, { backgroundColor: colors.outline }]} />
                    </View>
                    <View style={styles.planeIconContainer}>
                      <Ionicons name="airplane" size={14} color={colors.link} />
                    </View>
                    <SkyboundText
                      variant="secondary"
                      size={12}
                      accessabilityLabel="Flight stops"
                      style={{ textAlign: 'center', color: colors.icon, marginTop: 4 }}
                    >
                      1 stop DFW
                    </SkyboundText>
                  </View>

                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Arrival time">
                      1:05 PM
                    </SkyboundText>
                    <SkyboundText
                      variant="secondary"
                      size={12}
                      accessabilityLabel="Arrival airport"
                      style={{ marginTop: 2, color: colors.icon }}
                    >
                      LAX
                    </SkyboundText>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <SkyboundText variant="primaryBold" size={24} accessabilityLabel="Flight price">
                    ${totalPrice.toFixed(2)}
                  </SkyboundText>
                  <SkyboundText
                    variant="secondary"
                    size={12}
                    accessabilityLabel="Per person label"
                    style={{ color: colors.icon, marginTop: 4 }}
                  >
                    per person
                  </SkyboundText>
                </View>
              </View>
            </View>
          )}

          {/* Payment Method Section */}
          <View style={{ marginTop: 8 }}>
          <SkyboundText
            variant="primaryBold"
            size={18}
            accessabilityLabel="Payment Method Title"
            style={{ marginBottom: 12 }}
          >
            Payment Method
          </SkyboundText>

          {savedPaymentMethods.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => setSelectedPaymentId(method.id)}
              style={({ pressed }) => [
                styles.paymentOption,
                {
                  backgroundColor: colors.card,
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

          {/* Add New Card */}
          <Pressable
            onPress={() => navigation.navigate('PaymentMethod')}
            style={({ pressed }) => [
                styles.addCardButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.outline,
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

          {/* Fare Summary */}
          <View
            style={[
              styles.fareSummary,
              {
                backgroundColor: isDark ? '#262626' : '#F9FAFB',
                borderColor: colors.outline,
              },
            ]}
          >
            <View style={styles.fareRow}>
              <SkyboundText variant="secondary" size={14} accessabilityLabel="Flight label">
                Flight
              </SkyboundText>
              <SkyboundText variant="primary" size={14} accessabilityLabel="Flight price">
                ${basePrice.toFixed(2)}
              </SkyboundText>
            </View>
            <View style={styles.fareRow}>
              <SkyboundText variant="secondary" size={14} accessabilityLabel="Taxes label">
                Taxes & Fees
              </SkyboundText>
              <SkyboundText variant="primary" size={14} accessabilityLabel="Taxes amount">
                ${taxesAndFees.toFixed(2)}
              </SkyboundText>
            </View>
            <View style={[styles.fareDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.fareRow}>
              <SkyboundText variant="primaryBold" size={14} accessabilityLabel="Total label">
                Total
              </SkyboundText>
              <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Total amount">
                ${totalPrice.toFixed(2)}
              </SkyboundText>
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderTopColor: colors.divider,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: colors.link,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingTop: 10,
  },
  flightCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  flightCardHeader: {
    gap: 16,
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  airlineIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cabinBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  flightTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flightPath: {
    flex: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  pathLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
  },
  pathDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  pathLineBar: {
    flex: 1,
    height: 1,
    marginHorizontal: 4,
  },
  planeIconContainer: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -7,
  },
  priceRow: {
    alignItems: 'center',
    paddingTop: 8,
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  expandedDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  visaLogo: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 4,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  altPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fareSummary: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareDivider: {
    height: 1,
    marginVertical: 4,
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
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});
