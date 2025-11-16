import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
//i dont know why these are underlined red. The program builds just fine.
import InfoButton from '@/components/ui/InfoButton';
import InteractiveMap from '@/components/ui/InteractiveMap';
import SkyboundText from '@/components/ui/SkyboundText';
import basicStyles from '@constants/BasicComponents';
import { RootStackParamList } from '@src/nav/RootNavigator';






export default function ComponentTestScreen() {

      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
      const [airport, setAirport] = useState('ERI');
      const [airports, setAirports] =useState([]);
      const [airportCodes, setAirportCodes] = useState<string[]>([])

      useEffect(() => {
        setAirportCodes(airports.map(a => a.code))
      }, [airports])
    
    return(
        <View style={[basicStyles.background, {width: "100%", height: "100%", justifyContent: 'center', alignItems: 'center'}]}>

     
      <InteractiveMap mapHeight={300} mapWidth={500} onChange={setAirports}></InteractiveMap>
      
      <SkyboundText variant='primary' accessabilityLabel='ao;sdij'>{'airports: ' + airportCodes}</SkyboundText>

      <InfoButton infoText='Test Text'></InfoButton>


     

 

    </View>
    );
}