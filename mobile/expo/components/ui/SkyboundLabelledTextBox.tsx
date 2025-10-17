
import {StyleSheet, View, TextInputProps, KeyboardTypeOptions} from 'react-native'
import SkyboundText, { TextVariant } from './SkyboundText';
import SkyboundTextBox from './SkyboundTextBox';

//this is a component for a label + text box combo.

interface SkyboundLabelledTextBoxProps {
    placeholderText: string;
    width: number;
    height: number;
    icon?: any;
    label: string;
    labelVariant?: TextVariant
    labelSize?: number;
    value?: string;
    onChangeText?: (t: string) => void;
    secureTextEntry?: boolean;
    autoCapitalize?: TextInputProps['autoCapitalize'];
    keyboardType?: KeyboardTypeOptions;
}

const SkyboundLabelledTextBox: React.FC<SkyboundLabelledTextBoxProps> = ({
  placeholderText, width, height, icon, label, labelVariant = 'primary', labelSize = 15,
  value, onChangeText, secureTextEntry, autoCapitalize, keyboardType,
}) => {
  return (
    <View style={styles.container}>
      <SkyboundText variant={labelVariant} size={labelSize} accessabilityLabel={'Text Box Label: ' + label}>{label}</SkyboundText>
      <SkyboundTextBox
        placeholderText={placeholderText}
        width={width}
        height={height}
        icon={icon}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        flexDirection: 'column',
        gap: 3
    }
})
export default SkyboundLabelledTextBox; 