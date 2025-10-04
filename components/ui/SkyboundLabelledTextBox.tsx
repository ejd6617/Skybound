
import {StyleSheet, View} from 'react-native'
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
    
}


const SkyboundLabelledTextBox: React.FC<SkyboundLabelledTextBoxProps> = ({placeholderText, width, height, icon, label, labelVariant = 'primary', labelSize = 15, }) => {


    return(
        <View style={styles.container}>
            <SkyboundText variant={labelVariant} size={labelSize}>{label}</SkyboundText>
            <SkyboundTextBox placeholderText={placeholderText} width={width} height={height} />
        </View>
    )


   
}

const styles = StyleSheet.create({

    container: {
        justifyContent: 'flex-start',
        flexDirection: 'column',
        gap: 3

    }

})

export default SkyboundLabelledTextBox; 

