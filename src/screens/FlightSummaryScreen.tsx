import SkyboundNavBar from "@components/ui/SkyboundNavBar";
import SkyboundText from "@components/ui/SkyboundText";
import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function FlightSummaryScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FlightSummary'>>();

  const {
    selectedFlights = [],
    tripType,
    fromCode,
    toCode,
    departureDate,
    returnDate,
    legsCount,
    legsDates,
  } = (route.params as {
    selectedFlights?: any[];
    tripType?: string;
    fromCode?: string;
    toCode?: string;
    departureDate?: Date | string | null;
    returnDate?: Date | string | null;
    legsCount?: number;
    legsDates?: (Date | string | null)[];
  }) || {};

  const totalPrice = selectedFlights.reduce((sum: number, f: any) => sum + (f?.price || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.card, marginTop: 15 }}>
        <SkyboundNavBar
          title="Flight Summary"
          leftHandIcon={<Ionicons name="arrow-back" size={22} color={colors.text} />}
          leftHandIconOnPressEvent={() => navigation.goBack()}
          rightHandFirstIcon={<Ionicons name="share-outline" size={22} color={colors.text} />}
          rightHandFirstIconOnPressEvent={() => console.log('Share pressed')}
        />
      </View>

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
                  {selectedFlights[0]?.airline || 'American Airlines'}
                </SkyboundText>
                <SkyboundText variant="secondary" size={14}>
                  {selectedFlights[0]?.cabinClass || 'Main Basic'}
                </SkyboundText>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <SkyboundText variant="primary" size={24} style={{ fontWeight: '600' }}>
                ${totalPrice || 428}
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
            {selectedFlights.map((flight: any, idx: number) => {
              const isOutbound = idx === 0;
              const borderColor = isOutbound ? '#0071E2' : '#D1D5DB';
              return (
                <View key={idx} style={[styles.segment, { borderLeftColor: borderColor }]}>
                  <View style={styles.segmentHeader}>
                    <View style={{ flex: 1 }}>
                      <SkyboundText variant="primaryBold" size={18}>
                        {flight.departureCode} → {flight.arrivalCode}
                      </SkyboundText>
                      <SkyboundText variant="secondary" size={14}>
                        {flight.departureCode === 'CLE' ? 'Cleveland to Los Angeles' : 'Los Angeles to Cleveland'}
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
                      Dec {isOutbound ? '15' : '22'} • {flight.departureTime}
                    </SkyboundText>
                    <SkyboundText variant="secondary" size={14}>
                      Dec {isOutbound ? '15' : '22'} • {flight.arrivalTime}
                    </SkyboundText>
                  </View>
                  <SkyboundText variant="secondary" size={12}>
                    Flight {flight.airlineCode}2847, {flight.airlineCode}1203 • Economy
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
          <View style={{ gap: 12 }}>
            <View style={styles.detailRow}>
              <Ionicons name="airplane" size={18} color="#0071E2" />
              <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                Outbound - Dec 15
              </SkyboundText>
            </View>
            <View style={styles.routeSegment}>
              <View style={styles.routeStop}>
                <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                  8:15 AM - Cleveland (CLE)
                </SkyboundText>
                <SkyboundText variant="secondary" size={14}>Terminal A</SkyboundText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <SkyboundText variant="secondary" size={14}>AA 2847</SkyboundText>
              </View>
            </View>
            <View style={styles.dashedLine} />
            <View style={styles.routeStop}>
              <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                11:30 AM - Dallas (DFW)
              </SkyboundText>
              <SkyboundText variant="secondary" size={14}>Terminal C</SkyboundText>
            </View>
            <View style={[styles.layoverBox, { backgroundColor: '#F9FAFB' }]}>
              <SkyboundText variant="secondary" size={14}>Layover: 1h 15m at DFW</SkyboundText>
            </View>
            <View style={styles.routeSegment}>
              <View style={styles.routeStop}>
                <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                  12:45 PM - Dallas (DFW)
                </SkyboundText>
                <SkyboundText variant="secondary" size={14}>Terminal C</SkyboundText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <SkyboundText variant="secondary" size={14}>AA 1523</SkyboundText>
              </View>
            </View>
            <View style={styles.dashedLine} />
            <View style={styles.routeStop}>
              <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                2:00 PM - Los Angeles (LAX)
              </SkyboundText>
              <SkyboundText variant="secondary" size={14}>Terminal 4</SkyboundText>
            </View>
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
            <SkyboundText variant="primaryBold" size={18}>Passenger Information</SkyboundText>
            <Pressable onPress={() => console.log('Edit passenger')}>
              <SkyboundText variant="primary" size={14} style={{ color: '#0071E2' }}>
                Edit
              </SkyboundText>
            </Pressable>
          </View>
          <View style={styles.passengerRow}>
            <View style={[styles.avatar, { backgroundColor: '#0071E2' }]}>
              <Ionicons name="person" size={14} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <SkyboundText variant="primary" size={16} style={{ fontWeight: '500' }}>
                Valentina Aguirre
              </SkyboundText>
              <SkyboundText variant="secondary" size={14}>Adult • Economy</SkyboundText>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SkyboundText variant="primaryBold" size={18} style={{ marginBottom: 16 }}>
            Price Breakdown
          </SkyboundText>
          <View style={{ gap: 12 }}>
            <View style={styles.priceRow}>
              <SkyboundText variant="secondary" size={14}>Base fare (1 adult)</SkyboundText>
              <SkyboundText variant="primary" size={14}>$368</SkyboundText>
            </View>
            <View style={styles.priceRow}>
              <SkyboundText variant="secondary" size={14}>Taxes & fees</SkyboundText>
              <SkyboundText variant="primary" size={14}>$60</SkyboundText>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <SkyboundText variant="primaryBold" size={16}>Total</SkyboundText>
              <SkyboundText variant="primaryBold" size={20}>${totalPrice || 428}</SkyboundText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.divider }]}>
        <Pressable
          style={styles.ctaButton}
          onPress={() =>
            navigation.navigate('Payment', {
              selectedFlights,
              tripType,
              fromCode,
              toCode,
              departureDate,
              returnDate,
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
});
