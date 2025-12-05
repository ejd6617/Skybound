import BasicStyles from '@/constants/BasicComponents';
import React, { useState } from 'react';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { StyleSheet, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

//this custom text box component creates a text box with an optional icon placed on the right hand side.

interface SkyboundTextBoxProps {
  placeholderText: string;
  width?: number;
  height: number;
  icon?: any;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: KeyboardTypeOptions;
  touchableIcon?: boolean
  touchableIconFunction?: () => void;

}

const SkyboundTextBox: React.FC<SkyboundTextBoxProps> = ({
  placeholderText,
  width,
  height,
  icon,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  touchableIcon,
  touchableIconFunction,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme(); 
  const borderColor = colorScheme === 'light'? '#E5E7EB' : '#3A3A3A'

  return (
    <View style={[styles.container, { width, height }]}>
      <TextInput
        style={[
          BasicStyles.skyboundTextBox,
          { flex: 1, height: undefined, borderColor: isFocused ? '#3b82f6' : borderColor, 
            backgroundColor: colorScheme === 'light' ? '#ffffff' : '#1E1E1E',
            color: colorScheme === 'light' ? 'black' : 'white'
          },
        ]}
        placeholder={placeholderText}
        placeholderTextColor={colorScheme === 'light'? '#585858' : '#9CA3AF'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={100}
      />
      {/*Conditional loading based on if the button should be tappable */}
      {icon && touchableIcon &&  (
        <TouchableOpacity onPress={touchableIconFunction}>
          <View style={[styles.icon, { right: 8 }]}>
            {icon}
          </View>
        </TouchableOpacity>
      ) || (
        <View style={[styles.icon, { right: 8 }]}>
          {icon}
        </View>
      )}
    </View>
  );
};

//local stylesheet for the icon and text box to fit nicely togather
const styles = StyleSheet.create({
  container: {
    position: 'relative', // important for absolute positioning of icon
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 5,
   
  },
  icon: {
    position: 'absolute',
    top: '50%',
    marginTop: -30, // half of icon height to vertically center
  },
});

export default SkyboundTextBox;