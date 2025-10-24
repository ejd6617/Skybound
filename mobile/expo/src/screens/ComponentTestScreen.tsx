import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, View } from 'react-native';
import AccountIcon from '../../assets/images/AccountIcon.svg';
import AirplaneIcon from '../../assets/images/Airplane.svg';
import BellIcon from '../../assets/images/BellIcon.svg';
import HamburgerIcon from '../../assets/images/HamburgerIcon.svg';
//i dont know why these are underlined red. The program builds just fine.
import SimplifiedFlightDetails from '../../components/ui/SimplifiedFlightDetails';
import SkyboundButton from '../../components/ui/SkyboundButton';
import SkyboundFlashDeal from '../../components/ui/SkyboundFlashDeal';
import SkyboundFlightDetails from '../../components/ui/SkyboundFlightDetails';
import SkyboundItemHolder from '../../components/ui/SkyboundItemHolder';
import SkyboundNavBar from '../../components/ui/SkyboundNavBar';
import SkyboundText from '../../components/ui/SkyboundText';
import basicStyles from '../../constants/BasicComponents';
import SkyboundButtonGroup from '../../components/ui/SkyboundButtonGroup'
import { RootStackParamList } from '../nav/RootNavigator';

import SkyboundCalandarPicker from '../../components/ui/SkyboundCalandarPicker'





export default function ComponentTestScreen() {

      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [selected, setSelected] = useState(0);
      const [selectedDate, setSelectedDate] = useState<Date | null>(null);

      const handleDateChange = (data : Date) => {
        setSelectedDate(data);
        console.log("Selected Date: " + selectedDate)
      }



    
    return(
        <View style={[basicStyles.background, {width: "100%", height: "100%"}]}>

      <StatusBar style='dark' translucent={false}></StatusBar>
    <SkyboundNavBar leftHandIcon={<HamburgerIcon width={24} height={24}> </HamburgerIcon>}
    leftHandIconOnPressEvent={() => navigation.navigate("Login")}
    rightHandFirstIcon={<BellIcon width={24} height={24}></BellIcon>}
    rightHandFirstIconOnPressEvent={() => console.log("first right hand icon pressed")}
    rightHandSecondIcon={<AccountIcon width={24} height={24}></AccountIcon>}
    rightHandSecondIconOnPressEvent={()=> console.log("right hand second icon pressed")}
    title={"Nav Bar Test"}></SkyboundNavBar>


      <SkyboundItemHolder>
        <SkyboundText accessabilityLabel='help'  variant = 'primary' size = {60}>Test</SkyboundText>



       <SkyboundFlashDeal airlineImage={<AirplaneIcon width={24} height={24}></AirplaneIcon> } 
       airlineName='Test Airline'
       sourceCode='ERI'
       destCode='LAX'
       departureTime='1:11 PM'
       arrivalTime='2:22 PM'
       travelTime='1h 11m'
       originalPrice='$20000'
       newPrice='$0'
       onPress={() => console.log('What a great deal!')}>
       </SkyboundFlashDeal>

       
      <SkyboundButtonGroup
      options ={['Option 1', 'Option 2', 'Option 3',]}
      onChange={setSelected}>

      </SkyboundButtonGroup>

      <SkyboundText accessabilityLabel='test' variant='primary'>{'Active option: ' + selected}</SkyboundText>

      <SkyboundText variant='primary' accessabilityLabel='penis'>{'Selected Date:' + selectedDate}</SkyboundText>
    </SkyboundItemHolder>

    <SkyboundCalandarPicker onDateChange={handleDateChange}></SkyboundCalandarPicker>



    

 

    </View>
    );
}