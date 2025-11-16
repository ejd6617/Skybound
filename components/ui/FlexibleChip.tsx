import { useColors } from '@constants/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import SkyboundText from './SkyboundText';

interface FlexibleChipProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  icon: React.ComponentType<{ color: string }>;

}



const FlexibleChip: React.FC<FlexibleChipProps> = ({ label, isActive, onToggle, icon }) => {
  const colors = useColors();
  const SKYBOUND_BLUE = '#0071E2';
  const Icon = icon;


  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isActive ? SKYBOUND_BLUE : colors.background,
          borderColor: isActive ? SKYBOUND_BLUE : '#D9D9D9',
        }
      ]}
      onPress={onToggle}
      accessible={true}
      accessibilityLabel={`${label}, ${isActive ? 'active' : 'inactive'}`}
      accessibilityRole="switch"
      accessibilityState={{ checked: isActive }}
    >
      <Icon color={isActive ? '#49454F' : '#FFFFFF'} />
      <SkyboundText
        variant={isActive ? 'forceWhite' : 'secondary'}
        size={14}
        accessabilityLabel={label}
        style={{ color: isActive ? '#FFFFFF' : '#585858' }}
      >
        {label}
      </SkyboundText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderRadius: 100,
    borderWidth: 1,
    minHeight: 56,
    flex: 1,
    marginBottom: 8,
  },
});

export default FlexibleChip;
