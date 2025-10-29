// still to be implemented; I dont like how it looks right now, but the
// functionality is there so we should use it in the future
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SwapButtonProps {
  onPress: () => void;
}

const SwapIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M16 17V7M16 17L12 13M16 17L20 13M8 7V17M8 7L12 11M8 7L4 11" stroke="#0071E2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SwapButton: React.FC<SwapButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessible={true}
      accessibilityLabel="Swap from and to locations"
      accessibilityRole="button"
      accessibilityHint="Swaps the departure and arrival airports"
    >
      <SwapIcon />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default SwapButton;
