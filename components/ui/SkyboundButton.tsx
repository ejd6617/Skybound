import React, { ReactNode } from 'react';
import { GestureResponderEvent, StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface CustomButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children: ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({ onPress, style, textStyle, children }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={style}
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
