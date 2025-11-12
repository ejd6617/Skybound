import { StyleSheet, View } from 'react-native';
import InfoButton from './InfoButton';
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
    onChange?: (text : string) => void;
    enableinfoIcon? : boolean
    infoIconText?: string
    secureTextEntry?: boolean
    
}


const SkyboundLabelledTextBox: React.FC<SkyboundLabelledTextBoxProps> = ({placeholderText, 
    width, 
    height, 
    icon, 
    label, 
    labelVariant = 'primary', 
    labelSize = 15,
    onChange,
    enableinfoIcon = false,
    infoIconText,
    secureTextEntry = false, }) => {

    if(enableinfoIcon)
    {
        return (
             <View style={styles.container}>
                <View style={styles.infoButtonContainer}>
                <SkyboundText variant={labelVariant} size={labelSize} accessabilityLabel={label}>{label}</SkyboundText>
                <InfoButton infoText={infoIconText}></InfoButton>
                </View>
                <SkyboundTextBox placeholderText={placeholderText} width={width} height={height} icon={icon} onChangeText={onChange}
                secureTextEntry={secureTextEntry} />
            </View>
        )
    }
    else
    {

        return(
            <View style={styles.container}>
                <SkyboundText variant={labelVariant} size={labelSize} accessabilityLabel={label}>{label}</SkyboundText>
                <SkyboundTextBox placeholderText={placeholderText} width={width} height={height} icon={icon} onChangeText={onChange} />
            </View>
        )
    }

   
}

const styles = StyleSheet.create({

    container: {
        justifyContent: 'flex-start',
        flexDirection: 'column',
        gap: 3

    },

    infoButtonContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
    }

})

export default SkyboundLabelledTextBox; 