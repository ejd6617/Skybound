import React, { ReactNode } from 'react';
import { GestureResponderEvent, StyleProp, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface CustomButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({ onPress, style, children }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={style}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
