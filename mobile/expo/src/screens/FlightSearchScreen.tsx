import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, useColorScheme, View } from "react-native";

import SkyboundFlashDeal from "../../components/ui/SkyboundFlashDeal";
import SkyboundItemHolder from "../../components/ui/SkyboundItemHolder";
import SkyboundNavBar from "../../components/ui/SkyboundNavBar";
import SkyboundText from "../../components/ui/SkyboundText";
import HamburgerIcon from '../../assets/images/HamburgerIcon.svg'
import BellIcon from '../../assets/images/BellIcon.svg'
import AccountIcon from '../../assets/images/AccountIcon.svg'
import DepartureIcon from '../../assets/images/DepartureIcon.svg'
import ArrivalIcon from '../../assets/images/ArrivalIcon.svg'
import CalandarIcon from '../../assets/images/CalandarIcon.svg'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav/RootNavigator";
import SkyboundButtonGroup from "../../components/ui/SkyboundButtonGroup";
import SkyboundLabelledTextBox from "../../components/ui/SkyboundLabelledTextBox";
import basicStyles from '../../constants/BasicComponents'
import SkyboundButton from "../../components/ui/SkyboundButton";



export default function FlightSearchScreen() {
    const colorScheme = useColorScheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
        
    //Dynamic size variables
    const { width: SCREEN_W } = Dimensions.get("window");
    const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
    const H_PADDING = 18;
    const BTN_W = CARD_W - H_PADDING * 2;
    const itemHolderWidth = SCREEN_W * .9;
    



    return (

        <View style={basicStyles.background}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E'}}>
            <SkyboundNavBar title="Flight Search" 
            leftHandIcon={<HamburgerIcon width={24} height={24}/>}
            leftHandIconOnPressEvent={() => navigation.navigate("Dashboard")}
            rightHandFirstIcon={<BellIcon width={24} height={24}></BellIcon>}
            rightHandFirstIconOnPressEvent={() => console.log('Notification Icon Pressed')}
            rightHandSecondIcon={<AccountIcon width={24} height={24}></AccountIcon>}
            rightHandSecondIconOnPressEvent={() => console.log('Account Button Pressed')}></SkyboundNavBar>

            <SkyboundItemHolder style={{width: CARD_W}}>
                
                <SkyboundButtonGroup
                options={[ 'One Way', 'Round Trip', 'Multi City']}
                fontSize={18}></SkyboundButtonGroup>


                <SkyboundLabelledTextBox
                placeholderText="Source Location"
                width={BTN_W}
                height={45}
                label="From: "
                icon={<DepartureIcon width={20} height={20}></DepartureIcon>}
                ></SkyboundLabelledTextBox>

                 <SkyboundLabelledTextBox
                placeholderText="Destination Location"
                width={BTN_W}
                height={45}
                label="To: "
                icon={<ArrivalIcon width={20} height={20}></ArrivalIcon>}
                ></SkyboundLabelledTextBox>

                 <SkyboundLabelledTextBox
                placeholderText="Departure Date"
                width={BTN_W}
                height={45}
                label="Departure Date "
                icon={<CalandarIcon width={20} height={20}></CalandarIcon>}
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
                onPress={() => console.log("navigate to search radius screen")}
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