import AccountIcon from '@assets/images/AccountIcon.svg';
import AirplaneIcon from '@assets/images/Airplane.svg';
import BellIcon from '@assets/images/BellIcon.svg';
import HamburgerIcon from '@assets/images/HamburgerIcon.svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View } from 'react-native';
//i dont know why these are underlined red. The program builds just fine.
import SkyboundButtonGroup from '@components/ui/SkyboundButtonGroup';
import SkyboundFlashDeal from '@components/ui/SkyboundFlashDeal';
import SkyboundItemHolder from '@components/ui/SkyboundItemHolder';
import SkyboundNavBar from '@components/ui/SkyboundNavBar';
import SkyboundText from '@components/ui/SkyboundText';
import basicStyles from '@constants/BasicComponents';
import { RootStackParamList } from '@src/nav/RootNavigator';
import DisplayMap from '../../components/ui/DisplayMap'

import SkyboundCalandarPicker from '@components/ui/SkyboundCalandarPicker';

import InteractiveMap from '../../components/ui/InteractiveMap';




export default function ComponentTestScreen() {

      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [selected, setSelected] = useState(0);
      const [selectedDate, setSelectedDate] = useState<Date | null>(null);

      const handleDateChange = (data : Date) => {
        setSelectedDate(data);
        console.log("Selected Date: " + selectedDate)
      }



    
    return(
        <View style={[basicStyles.background, {width: "100%", height: "100%", justifyContent: 'center', alignItems: 'center'}]}>

      <InteractiveMap>

      </InteractiveMap>

      <DisplayMap mapWidth={300} mapHeight={200}></DisplayMap>



    

 

    </View>
    );
}