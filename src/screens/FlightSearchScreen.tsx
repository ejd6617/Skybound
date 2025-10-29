import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants';
import React, { useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, useColorScheme, View } from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Flight, Params } from "../../../../skyboundTypes/SkyboundAPI";
import AccountIcon from '../../assets/images/AccountIcon.svg';
import ArrivalIcon from '../../assets/images/ArrivalIcon.svg';
import BellIcon from '../../assets/images/BellIcon.svg';
import CalandarIcon from '../../assets/images/CalandarIcon.svg';
import DepartureIcon from '../../assets/images/DepartureIcon.svg';
import HamburgerIcon from '../../assets/images/HamburgerIcon.svg';
import SkyboundButton from "../../components/ui/SkyboundButton";
import SkyboundButtonGroup from "../../components/ui/SkyboundButtonGroup";
import SkyboundItemHolder from "../../components/ui/SkyboundItemHolder";
import SkyboundLabelledTextBox from "../../components/ui/SkyboundLabelledTextBox";
import SkyboundNavBar from "../../components/ui/SkyboundNavBar";
import basicStyles from '../../constants/BasicComponents';
import { skyboundRequest } from "../api/SkyboundUtils";
import { RootStackParamList } from "../nav/RootNavigator";
import LoadingScreen from "./LoadingScreen";



export default function FlightSearchScreen() {
    const colorScheme = useColorScheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const API_URL = Constants.expoConfig?.extra?.API_URL;
    //Dynamic size variables
    const { width: SCREEN_W } = Dimensions.get("window");
    const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
    const H_PADDING = 18;
    const BTN_W = CARD_W - H_PADDING * 2;
    const itemHolderWidth = SCREEN_W * .9;

    const [isLoading, setIsLoading] = useState(false);
    const [sourceAirport, setSourceAirport] = useState('');
    const [destAirport, setDestAirport] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [searchTypeOptions, setSearchTypeOptions] = useState(['One Way', 'Round Trip', 'Multi City']);
    const [searchTypeEndpoints, setSearchTypeEndpoints] = useState({
        'One Way': 'searchFlightsOneWay',
        'Round Trip': 'searchFlightsRoundTrip',
        'Multi City': 'searchFlightsMultiCity',
    });
    const [searchResults, setSearchResults] = useState<Flight[]>([]);
    const [selectedSearchType, setSelectedSearchType] = useState(0); // Search types like one way, round trip, multi city
    
    function setData(shuffledData: any) {
        throw new Error("Function not implemented.");
    }
    
    async function handleSearch() {
        console.log("Searching flights...");
        setIsLoading(true);
        
        try {
            const endpoint = searchTypeEndpoints[searchTypeOptions[selectedSearchType]]
            const params: Params = {
                originAirport: sourceAirport.toUpperCase(), // ex. "JFK"
                destinationAirport: destAirport.toUpperCase(), // ex. "LAX"
                date: new Date(departureDate),
            };
            setSearchResults(await skyboundRequest(endpoint, params));

            navigation.navigate('FlightResults', {searchResults: searchResults});
        } catch (err) {
            throw new Error(`Error searching for flights with Skybound API: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (

        <View style={basicStyles.background}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E'}}>
            <SkyboundNavBar title="Flight Search" 
            leftHandIcon={<HamburgerIcon width={24} height={24}/>}
            leftHandIconOnPressEvent={() => navigation.navigate("Dashboard")}
            rightHandFirstIcon={<BellIcon width={24} height={24}></BellIcon>}
            rightHandFirstIconOnPressEvent={() => console.log('Notification Icon Pressed')}
            rightHandSecondIcon={<AccountIcon width={24} height={24}></AccountIcon>}
            rightHandSecondIconOnPressEvent={() => console.log(navigation.navigate("Account"))}></SkyboundNavBar>

            <SkyboundItemHolder style={{width: CARD_W}}>
                
                <SkyboundButtonGroup
                options={searchTypeOptions}
                onChange={setSelectedSearchType}
                fontSize={18}></SkyboundButtonGroup>


                <SkyboundLabelledTextBox
                placeholderText="Source Location"
                width={BTN_W}
                height={45}
                label="From: "
                icon={<DepartureIcon width={20} height={20}></DepartureIcon>}
                onChangeText={setSourceAirport}
                ></SkyboundLabelledTextBox>

                 <SkyboundLabelledTextBox
                placeholderText="Destination Location"
                width={BTN_W}
                height={45}
                label="To: "
                icon={<ArrivalIcon width={20} height={20}></ArrivalIcon>}
                onChangeText={setDestAirport}
                ></SkyboundLabelledTextBox>

                 <SkyboundLabelledTextBox
                placeholderText="Departure Date"
                width={BTN_W}
                height={45}
                label="Departure Date "
                icon={<CalandarIcon width={20} height={20}></CalandarIcon>}
                onChangeText={setDepartureDate}
                ></SkyboundLabelledTextBox>

                {/*TODO: Refactor this button to accept variants like text does. 
                also should let you pass an svg icon  */}
                <SkyboundButton
                textVariant="primary"
                style={colorScheme === 'light' ? basicStyles.skyboundButtonSecondaryLight : basicStyles.skyboundButtonSecondaryDark}
                onPress={() => console.log("navigate to flexible dates screen")}
                width={BTN_W * .8}
                height={45}>
                Flexible Dates
                </SkyboundButton>

                <SkyboundButton
                textVariant="primary"
                style={colorScheme === 'light' ? basicStyles.skyboundButtonSecondaryLight : basicStyles.skyboundButtonSecondaryDark}
                onPress={() => console.log("navigate to search radius screen")}
                width={BTN_W * .8}
                height={45}>
                Flexible Airports
                </SkyboundButton>


                <View style={{height: 40}}></View>
                
                <SkyboundButton
                textVariant="primaryBold"
                style={basicStyles.skyboundButtonPrimaryLight}
                onPress={handleSearch}
                width={BTN_W * .8}
                height={45}>
                Search
                </SkyboundButton>



            </SkyboundItemHolder>

        </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({

    rowHolder: {
        flexDirection: 'row',
        gap: 2,
        alignContent: 'center',
        alignItems: 'center',
    },
})