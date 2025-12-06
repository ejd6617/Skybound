import SkyboundItemHolder from '@/components/ui/SkyboundItemHolder';
import SkyboundText from '@/components/ui/SkyboundText';
import { useColors } from '@constants/theme'; // to use dark/light theme
import { LinearGradient } from "expo-linear-gradient";
import React from 'react';
import { useColorScheme, View } from 'react-native';

export default function NotificationsScreen() {

    const theme = useColors();
    const colorScheme = useColorScheme()

    return (
        <LinearGradient
                colors={theme.gradient}
                start={theme.gradientStart}
                end={theme.gradientEnd}
                style={{ flex: 1 }}
            >
                <View style={{padding: 20}} />
                    
             
                <SkyboundItemHolder>
                    <SkyboundText variant='primary' accessabilityLabel='Notifications'>Notifications go here</SkyboundText>
                    {/* At this point, you have to search the database for notifications that the user can receive and display them here  */}
                    
                </SkyboundItemHolder>
                    
        </LinearGradient>

       
    )
}