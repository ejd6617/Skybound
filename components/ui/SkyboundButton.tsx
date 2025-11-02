import SkyboundText, { TextVariant } from '@components/ui/SkyboundText';
import basicStyles from '@constants/BasicComponents';
import React, { ReactNode } from 'react';
import { GestureResponderEvent, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

interface CustomButtonProps {
  onPress: (event: GestureResponderEvent) => void; //on press event
  style?: StyleProp<ViewStyle>;// optional style overide 
  children: ReactNode; // children
  width: number; // width of the button
  height: number; //height of the button
  textVariant?: TextVariant// type of SkyboundText that is displayed on the button
  textSize?: number // optional text size override 
  diasabled? : boolean //boolean to determine if the button should be disabled
}

const CustomButton: React.FC<CustomButtonProps> = ({
  width = 100,
  height = 40,
  textSize,
  textVariant = 'primaryButton',
  children,
  style,
  onPress,
  diasabled = false,
}) => {
  const fontSize = textSize ?? Math.min(Math.max(height * 0.4, 12), 20);

  return (
    <TouchableOpacity style={[basicStyles.skyboundButton, style, { width, height }]} onPress={onPress} disabled={diasabled}>
      <SkyboundText  variant={textVariant} size={fontSize} accessabilityLabel={'Label: ' + children}>
        {children}
      </SkyboundText>
    </TouchableOpacity>
  );
};

export default CustomButton;