import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';

type AirportInfoRoute = RouteProp<RootStackParamList, 'AirportInfo'>;

const mockReviews = [
  {
    id: 'rev-1',
    author: 'Michelle R.',
    rating: 5,
    text: 'Security was smooth and the lounges were spotless. Love the charging pods everywhere.',
  },
  {
    id: 'rev-2',
    author: 'James K.',
    rating: 4,
    text: 'Crowded but efficient. Follow the express signage and you will breeze through.',
  },
];

const AirportInfo: React.FC = () => {
  const colors = useColors();
  const route = useRoute<AirportInfoRoute>();
  const airportName = route.params?.airportName ?? 'London Heathrow';
  const airportCode = route.params?.airportCode ?? 'LHR';

  return (
    <SkyboundScreen
      title={`${airportName} (${airportCode})`}
      subtitle="Trusted notes from Skybound travelers"
      showLogo
    >
      <SkyboundCard>
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Location title">
          Location
        </SkyboundText>
        <SkyboundText variant="primary" size={14} style={{ marginTop: 8 }} accessabilityLabel="Location value">
          London, United Kingdom
        </SkyboundText>
        <SkyboundText variant="secondary" size={13} style={{ marginTop: 4 }} accessabilityLabel="Feedback placeholder">
          Traveler feedback · 4.6 / 5
        </SkyboundText>
      </SkyboundCard>

      <SkyboundCard>
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Amenities title">
          Amenities
        </SkyboundText>
        {[
          'SkyTeam & Priority Pass lounges',
          'Free high-speed Wi-Fi',
          'Charging stations at every gate',
          'Family play zones & nursing suites',
          'Retail corridor with duty-free shopping',
        ].map((item) => (
          <View style={styles.iconRow} key={item}>
            <Ionicons name="checkmark-circle" size={18} color={colors.link} />
            <SkyboundText variant="primary" size={14} accessabilityLabel={item}>
              {item}
            </SkyboundText>
          </View>
        ))}
      </SkyboundCard>

      <SkyboundCard>
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Airport map title">
          Airport Map
        </SkyboundText>
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.surfaceMuted }]}> 
          <SkyboundText variant="secondary" size={13} accessabilityLabel="Map placeholder">
            Terminal map coming soon
          </SkyboundText>
        </View>
      </SkyboundCard>

      <SkyboundCard>
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Practical info title">
          Practical Info
        </SkyboundText>
        {[
          { label: 'Bathrooms', value: 'Every concourse, look for teal signage.' },
          { label: 'Pet relief areas', value: 'Outdoor terraces near gates B10 & C20.' },
          { label: 'Security wait time', value: 'Usually 15–30 minutes (longer mornings).' },
        ].map((row) => (
          <View style={styles.detailRow} key={row.label}>
            <SkyboundText variant="secondary" size={13} accessabilityLabel={`${row.label} label`}>
              {row.label}
            </SkyboundText>
            <SkyboundText variant="primary" size={14} style={styles.detailValue} accessabilityLabel={`${row.label} value`}>
              {row.value}
            </SkyboundText>
          </View>
        ))}
      </SkyboundCard>

      <SkyboundCard>
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Food title">
          Food & Prices
        </SkyboundText>
        <SkyboundText variant="primary" size={14} style={{ marginTop: 8 }} accessabilityLabel="Food info">
          Expect $–$$$ pricing. Highlights include Ahi Poke, Pret, and local coffee roasters in Terminal 5.
        </SkyboundText>
      </SkyboundCard>

      <SkyboundCard>
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Reviews title">
          From Google Maps reviews
        </SkyboundText>
        {mockReviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <SkyboundText variant="primaryBold" size={14} accessabilityLabel={`Reviewer ${review.author}`}>
                {review.author}
              </SkyboundText>
              <View style={styles.ratingRow}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Ionicons
                    key={`star-${review.id}-${index}`}
                    name={index < review.rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FBBF24"
                  />
                ))}
              </View>
            </View>
            <SkyboundText variant="secondary" size={13} style={{ marginTop: 4 }} accessabilityLabel="Review text">
              “{review.text}”
            </SkyboundText>
          </View>
        ))}
      </SkyboundCard>
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  detailRow: {
    marginTop: 12,
  },
  detailValue: {
    marginTop: 4,
  },
  reviewCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
});

export default AirportInfo;
