import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '../../constants/theme';
import AirportAutocomplete from './AirportAutocomplete';
import DateSelector from './DateSelector';
import SkyboundText from './SkyboundText';

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

interface MultiCityLegProps {
  leg: FlightLeg;
  legNumber: number;
  totalLegs: number;
  onFromChange: (airport: Airport) => void;
  onToChange: (airport: Airport) => void;
  onDateChange: (date: Date) => void;
  onRemove?: () => void;
  errors?: {
    from?: string;
    to?: string;
    date?: string;
  };
}

const RemoveIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path d="M15 5L5 15M5 5L15 15" stroke="#DC2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const MultiCityLeg: React.FC<MultiCityLegProps> = ({
  leg,
  legNumber,
  totalLegs,
  onFromChange,
  onToChange,
  onDateChange,
  onRemove,
  errors,
}) => {
  const colors = useColors();
  const canRemove = totalLegs > 2 && onRemove;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.divider }]}>
      <View style={styles.header}>
        <SkyboundText variant="primaryBold" size={14} accessabilityLabel={`Flight ${legNumber}`}>
          Flight {legNumber}
        </SkyboundText>
        {canRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeButton}
            accessible={true}
            accessibilityLabel={`Remove flight ${legNumber}`}
            accessibilityRole="button"
          >
            <RemoveIcon />
          </TouchableOpacity>
        )}
      </View>

      <AirportAutocomplete
        label="From"
        value={leg.from}
        onSelect={onFromChange}
        placeholder="Departure airport"
        error={errors?.from}
      />

      <AirportAutocomplete
        label="To"
        value={leg.to}
        onSelect={onToChange}
        placeholder="Arrival airport"
        error={errors?.to}
      />

      <DateSelector
        label="Depart Date"
        value={leg.date}
        onSelect={onDateChange}
        placeholder="Select departure date"
        error={errors?.date}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  removeButton: {
    padding: 8,
  },
});

export default MultiCityLeg;
