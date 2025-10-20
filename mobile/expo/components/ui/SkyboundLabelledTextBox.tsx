import React from 'react';
import { StyleProp, Text, TextInput, TextInputProps, TextStyle, View } from 'react-native';
import { useColors } from '../../constants/theme';

//this is a component for a label + text box combo.

export type SkyboundLabelledTextBoxProps = {
  label?: string;
  placeholderText?: string;
  width: number;
  height: number;
  value?: string;
  onChangeText?: (t: string) => void;
  secureTextEntry?: boolean;
  textColor?: string;
  placeholderColor?: string;
  inputStyle?: StyleProp<TextStyle>;
} & Omit<TextInputProps, 'style' | 'placeholderTextColor' | 'onChangeText' | 'value'>;

export default function SkyboundLabelledTextBox(props: SkyboundLabelledTextBoxProps) {
  const {
    label,
    placeholderText,
    width,
    height,
    value,
    onChangeText,
    secureTextEntry,
    textColor,
    placeholderColor,
    inputStyle,
    ...rest
  } = props;

  const C = useColors();

  return (
    <View style={{ width }}>
      {label ? (
        <Text style={{ fontFamily: 'Poppins_600SemiBold', color: C.text, marginBottom: 4 }}>
          {label}
        </Text>
      ) : null}

      <TextInput
        style={[
          {
            width: '100%',
            height,
            borderColor: C.outline,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 10,
            fontFamily: 'Poppins_400Regular',
            color: textColor ?? C.text,       
            backgroundColor: C.card,
          },
          inputStyle,                       
        ]}
        placeholder={placeholderText}
        placeholderTextColor={placeholderColor ?? C.subText}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        selectionColor={textColor ?? C.text}
        {...rest}
      />
    </View>
  );
}