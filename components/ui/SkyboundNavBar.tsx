import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from "@react-navigation/native";
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import SkyboundText from './SkyboundText';

type DrawerNavProps = DrawerNavigationProp<any>;

const SkyboundNavBar: React.FC<NativeStackHeaderProps> = (props) => {
    const navigation = useNavigation<DrawerNavProps>();
    const {width, height} = Dimensions.get('window')
    const colorScheme = useColorScheme();

    return(
        <SafeAreaView style={{backgroundColor: colorScheme === 'light' ? 'white' : '#1E1E1E'}} edges={['top', 'left', 'right']}>
            <View style={[styles.navBarHolder, {width: width}]}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    {<Ionicons name="menu" size={22} color="#0071E2" />}
                </TouchableOpacity>
                
                <View style={styles.title}>
                    <SkyboundText variant='blue' accessabilityLabel={'Navigation Bar Title (Skybound)'}>
                        <Image
                            source={require("@assets/images/skybound-logo-dark.png")}
                            style={{ width: 200, height: 30, resizeMode: "contain" }}
                        />
                    </SkyboundText>
                </View>

                <View style = {styles.rightHandIconsHolder}>
                    <TouchableOpacity onPress={() => {}}>
                        <Ionicons name="notifications-outline" size={22} color="#0071E2" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                            navigation.navigate("Account")
                        }}>
                        <Ionicons name="person-circle-outline" size={24} color="#0071E2" />
                    </TouchableOpacity>
                </View>

             </View>
         </SafeAreaView>
    )

}


const styles = StyleSheet.create({
    navBarHolder: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        position: 'relative',
    },

    rightHandIconsHolder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

     title: {
        position: 'absolute', // absolute so it ignores flex row
        left: 0,
        right: 0,
        alignItems: 'center', 
        justifyContent: 'center',
  },
        
})

export default SkyboundNavBar