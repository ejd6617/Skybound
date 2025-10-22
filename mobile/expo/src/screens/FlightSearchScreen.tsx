import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, useColorScheme, View } from "react-native";

import SkyboundFlashDeal from "../../components/ui/SkyboundFlashDeal";
import SkyboundItemHolder from "../../components/ui/SkyboundItemHolder";
import SkyboundNavBar from "../../components/ui/SkyboundNavBar";
import SkyboundText from "../../components/ui/SkyboundText";
import BackArrowIcon from '../../assets/images/HamburgerIcon.svg'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav/RootNavigator";



export default function FlightSearchScreen() {
    const colorScheme = useColorScheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
        


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E'}}>
            <SkyboundNavBar title="Flight Search" 
            leftHandIcon={<HamburgerIcon width={24} height={24}/>}
            leftHandIconOnPressEvent={() => navigation.navigate("Dashboard")}></SkyboundNavBar>

        </SafeAreaView>
    );
}