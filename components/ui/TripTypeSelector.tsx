import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useColors } from '../../constants/theme';
import SkyboundText from './SkyboundText';

export type TripType = 'one-way' | 'round-trip' | 'multi-city';

interface TripTypeSelectorProps {
  selectedType: TripType;
  onTypeChange: (type: TripType) => void;
}

const TripTypeSelector: React.FC<TripTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  const colors = useColors();
  const SKYBOUND_BLUE = '#0071E2';

  const tabs = [
    { type: 'one-way' as TripType, label: 'One Way' },
    { type: 'round-trip' as TripType, label: 'Round Trip' },
    { type: 'multi-city' as TripType, label: 'Multi-City' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isSelected = selectedType === tab.type;

        return (
          <TouchableOpacity
            key={tab.type}
            style={[
              styles.tab,
              {
                flex: 1,
                backgroundColor: isSelected ? SKYBOUND_BLUE : colors.background,
                borderColor: SKYBOUND_BLUE,
              }
            ]}
            onPress={() => onTypeChange(tab.type)}
            accessible={true}
            accessibilityLabel={`${tab.label} trip type`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <SkyboundText
              variant={isSelected ? 'forceWhite' : 'primary'}
              size={13}
              accessabilityLabel={tab.label}
              style={{ color: isSelected ? '#FFFFFF' : SKYBOUND_BLUE }}
            >
              {tab.label}
            </SkyboundText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default TripTypeSelector;
