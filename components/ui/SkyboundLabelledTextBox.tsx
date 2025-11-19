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
    enableErrorText?: boolean,
    errorText?: string,
    touchableIcon?: boolean,
    touchableIconFunction?: () => void;
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
    secureTextEntry = false, 
    enableErrorText = false,
    errorText,
    touchableIcon,
    touchableIconFunction, }) => {

    
    return (
        <View style={styles.container}>
            {/*If the info button is enabled, render text box with info button, otherwise dont */}
            {enableinfoIcon && (
                <>
                    <View style={styles.infoButtonContainer}>
                    <SkyboundText variant={labelVariant} size={labelSize} accessabilityLabel={label}>{label}</SkyboundText>
                    <InfoButton infoText={infoIconText}></InfoButton>
                    </View>
                    </>
                 ) || (
                    <>
                        <SkyboundText variant={labelVariant} size={labelSize} accessabilityLabel={label}>{label}</SkyboundText>
                    </>
                 )}
                <SkyboundTextBox placeholderText={placeholderText} 
                    width={width} 
                    height={height} 
                    icon={icon} 
                    onChangeText={onChange}
                    secureTextEntry={secureTextEntry}
                    touchableIcon={touchableIcon}
                    touchableIconFunction={touchableIconFunction} />
                {/*Conditionally load error text  */}
                {enableErrorText &&(
                    <>
                        <SkyboundText variant='error' accessabilityLabel={errorText}>{errorText}</SkyboundText>
                    </>
                )}
            </View>
        )
    
    

   
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