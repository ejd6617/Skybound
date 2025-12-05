import SkyboundItemHolder from '@/components/ui/SkyboundItemHolder';
import SkyboundText from '@/components/ui/SkyboundText';
import { useColors } from '@constants/theme'; // to use dark/light theme
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React from 'react';
import { SafeAreaView, useColorScheme, View } from 'react-native';
import AccountIcon from '../../assets/images/AccountIcon.svg';
import BackArrowIcon from '../../assets/images/BackArrowIcon.svg';
import NotificationIcon from '../../assets/images/Notification Photo.svg';
import SkyboundNavBar from '../../components/ui/SkyboundNavBar';
import { RootStackParamList } from '../nav/RootNavigator';

export default function NotificationsScreen() {

    const theme = useColors();
    const colorScheme = useColorScheme()
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <LinearGradient
                colors={theme.gradient}
                start={theme.gradientStart}
                end={theme.gradientEnd}
                style={{ flex: 1 }}
              >
                 <SafeAreaView style={{backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E'}}></SafeAreaView>
                  
                        <SkyboundNavBar leftHandIcon={<BackArrowIcon width={24} height={24} />} 
                        leftHandIconOnPressEvent={() => navigation.navigate("Dashboard")}
                        rightHandFirstIcon={<NotificationIcon width={24} height={24}/>} 
                        rightHandFirstIconOnPressEvent={() => console.log("thing pressed 2")}
                        rightHandSecondIcon={<AccountIcon width={24} height={24}/>} 
                        rightHandSecondIconOnPressEvent={() => navigation.navigate("Account")}
                        title={"Notifications"} />
                        <View style={{padding: 20}} />
                            
                     
                        <SkyboundItemHolder>
                            <SkyboundText variant='primary' accessabilityLabel='Notifications'>Notifications go here</SkyboundText>
                            {/* At this point, you have to search the database for notifications that the user can receive and display them here  */}
                            
                        </SkyboundItemHolder>
                    
        </LinearGradient>

       
    )
}