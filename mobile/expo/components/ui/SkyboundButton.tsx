import React, { ReactNode } from 'react';
import { GestureResponderEvent, StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import SkyboundText, { TextVariant } from './SkyboundText';



interface CustomButtonProps {
  onPress: (event: GestureResponderEvent) => void; //on press event
  style?: StyleProp<ViewStyle>;// optional style overide 
  children: ReactNode; // children
  width: number; // width of the button
  height: number; //height of the button
  textVariant?: TextVariant// type of SkyboundText that is displayed on the button
  textSize?: number // optional text size override 
}

const CustomButton: React.FC<CustomButtonProps> = ({
  width = 100,
  height = 40,
  textSize,
  textVariant = 'primaryButton',
  children,
  style,
  onPress,
}) => {
  const fontSize = textSize ?? Math.min(Math.max(height * 0.4, 12), 20);

  return (
    <TouchableOpacity style={[style, { width, height }]} onPress={onPress}>
      <SkyboundText variant={textVariant} size={fontSize}>
        {children}
      </SkyboundText>
    </TouchableOpacity>
  );
};

export default CustomButton;
