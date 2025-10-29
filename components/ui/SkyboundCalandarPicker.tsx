import React from 'react'
import CalendarPicker from 'react-native-calendar-picker'
import SkyboundItemHolder from './SkyboundItemHolder';
import { useColorScheme } from 'react-native';
import basicStyles from '../../constants/BasicComponents';

//Wrapper component for the Calandar Picker developed by stephy on GitHub. 
//Calandar picker documentation: https://github.com/stephy/CalendarPicker

interface SkyboundCalandarPickerProps {
    onDateChange : (data : Date) => void;
}


const SkyboundCalandarPicker: React.FC<SkyboundCalandarPickerProps> = ({
    onDateChange,
}) => {
    const colorScheme = useColorScheme();


    return(
        <SkyboundItemHolder>
            <CalendarPicker onDateChange={onDateChange}
            textStyle={colorScheme === 'light' ? basicStyles.skyboundTextPrimaryLight : basicStyles.skyboundTextPrimaryDark}
            selectedDayColor={'#0071E2'}
            selectedDayTextColor={'white'}>
            </CalendarPicker>
        </SkyboundItemHolder>
    )
}

export default SkyboundCalandarPicker