import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';

import airportInfo from '../../../assets/airports.json';


interface AirportChip {
  code: string;
  city: string;
}

const AirportPreference: React.FC = () => {
  const colors = useColors();
  const [departures, setDepartures] = useState<AirportChip[]>([
    { code: 'PIT', city: 'Pittsburgh' },
    { code: 'JFK', city: 'New York' },
    { code: 'DCA', city: 'Washington D.C.' },
  ]);
  const [arrivals, setArrivals] = useState<AirportChip[]>([
    { code: 'LAX', city: 'Los Angeles' },
    { code: 'CDG', city: 'Paris' },
  ]);

  const removeChip = (list: AirportChip[], setter: (chips: AirportChip[]) => void, code: string) => {
    setter(list.filter((chip) => chip.code !== code));
  };

  const addChip = (setter: (chips: AirportChip[]) => void) => {
    if (Alert.prompt) {
      Alert.prompt('Add airport', 'Enter IATA code (e.g., BOS)', (text) => {
        if (!text) return;

        const result = airportInfo.find(item => item.iata === text);

        if(result)
        {
           setter((prev) => [...prev, { code: text.toUpperCase(), city: result.city }]);
        }
        else
        {
            Alert.alert("ERROR: Airport code does not match an existing airport in our database.");
        }

       
      });
    } else {
      Alert.alert('Airport picker coming soon', 'We’ll let you search all airports in a future update.');
    }
  };

  const renderSection = (
    title: string,
    chips: AirportChip[],
    setter: (chips: AirportChip[]) => void,
    ctaLabel: string
  ) => (
    <SkyboundCard key={title}>
      <SkyboundText variant="primaryBold" size={18} accessabilityLabel={`${title} title`}>
        {title}
      </SkyboundText>
      <View style={styles.chipContainer}>
        {chips.map((chip) => (
          <Pressable
            key={chip.code}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
            onPress={() => removeChip(chips, setter, chip.code)}
            accessibilityRole="button"
          >
            <SkyboundText variant="primary" size={13} accessabilityLabel={`${chip.code} chip`}>
              {chip.code} · {chip.city}
            </SkyboundText>
            <Ionicons name="close" size={14} color={colors.icon} />
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => addChip(setter)}
        style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.8 }]}
      >
        <Ionicons name="add-circle" size={20} color={colors.link} />
        <SkyboundText variant="blue" size={14} accessabilityLabel={ctaLabel}>
          {ctaLabel}
        </SkyboundText>
      </Pressable>
    </SkyboundCard>
  );

  return (
    <SkyboundScreen
      title="Airport Preferences"
      subtitle="Set your favorite departure and arrival airports for smarter deal alerts."
      showLogo
    >
      {renderSection('Preferred Departure Airports', departures, setDepartures, 'Add Departure Airport')}
      {renderSection('Preferred Arrival Airports', arrivals, setArrivals, 'Add Arrival Airport')}
      <SkyboundCard muted elevate={false}>
        <SkyboundText variant="secondary" size={13} accessabilityLabel="Preference description">
          We use these airports to send personalized deal notifications on the dashboard and in your inbox. Adjust them anytime.
        </SkyboundText>
      </SkyboundCard>
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  addRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default AirportPreference;
