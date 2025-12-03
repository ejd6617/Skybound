import basicStyles from '@constants/BasicComponents';
import React from 'react';
import { Dimensions, useColorScheme } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import SkyboundItemHolder from './SkyboundItemHolder';

//Wrapper component for the Calandar Picker developed by stephy on GitHub. 
//Calandar picker documentation: https://github.com/stephy/CalendarPicker

interface SkyboundCalandarPickerProps {
    onDateChange : (data : Date) => void;
}

//
function disablePastDates(date: Date)
{
    let currentDate = new Date();

    if(date < currentDate)
        return true

    return false

}

const SkyboundCalandarPicker: React.FC<SkyboundCalandarPickerProps> = ({
    onDateChange,
}) => {
    const colorScheme = useColorScheme();
    const {width, height} = Dimensions.get("window");
    return(
        <SkyboundItemHolder>
            <CalendarPicker onDateChange={onDateChange}
            textStyle={colorScheme === 'light' ? basicStyles.skyboundTextPrimaryLight : basicStyles.skyboundTextPrimaryDark}
            selectedDayColor={'#0071E2'}
            selectedDayTextColor={'white'}
            width={width * .9}
            disabledDates={disablePastDates}>
            </CalendarPicker>
        </SkyboundItemHolder>
    )
}

export default SkyboundCalandarPicker