import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from "@react-navigation/native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import SkyboundText from './SkyboundText';

interface SkyboundNavBarProps extends NativeStackHeaderProps {
    titleText?: string;
    showLogo?: boolean;
    useBackNavigation?: boolean;
    showNotifications?: boolean;
    showUserProfile?: boolean;
    showFilter?: boolean;
    showShare?: boolean;
}

type DrawerNavProps = DrawerNavigationProp<any>;

// Accept all props so we can use utility functions like getHeaderTitle
const SkyboundNavBar: React.FC<SkyboundNavBarProps> = ({
    titleText = "Default Title (Make sure to update)",
    showLogo = false,
    useBackNavigation = false,
    showNotifications = true,
    showUserProfile = true,
    showFilter = false,
    showShare = false,
}) => { 
    const navigation = useNavigation<DrawerNavProps>();
    const {width, height} = Dimensions.get('window')
    const colorScheme = useColorScheme();
    
    const skyboundBlue = "#0071E2";
    const iconSize = 24;
    
    return(
        <SafeAreaView style={{backgroundColor: colorScheme === 'light' ? 'white' : '#1E1E1E'}} edges={['top', 'left', 'right']}>
            <View style={[styles.navBarHolder, {width: width}]}>
                { useBackNavigation
                    ? <TouchableOpacity onPress={() => navigation.goBack()}>
                        {<Ionicons name="arrow-back" size={iconSize} color={skyboundBlue} />}
                    </TouchableOpacity>
                    : <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        {<Ionicons name="menu" size={iconSize} color={skyboundBlue} />}
                    </TouchableOpacity>
                }

                { showLogo
                    ? <View style={styles.title}>
                        <SkyboundText variant='blue' accessabilityLabel={'Skybound Logo'}>
                            <Image
                                source={require("@assets/images/skybound-logo-dark.png")}
                                style={{ width: 200, height: 30, resizeMode: "contain" }}
                            />
                        </SkyboundText>
                    </View>
                    : <View style={styles.title}>
                        <SkyboundText variant='blue' accessabilityLabel={'Title: ' + titleText}>
                           {titleText}
                        </SkyboundText>
                    </View>
                }

                <View style = {styles.rightHandIconsHolder}>
                    { showNotifications
                        && <TouchableOpacity onPress={() => {
                                navigation.navigate("Notifications")
                            }}>
                            <Ionicons name="notifications-outline" size={iconSize} color={skyboundBlue} />
                        </TouchableOpacity>
                    }

                    { showUserProfile
                        && <TouchableOpacity onPress={() => {
                                navigation.navigate("Accounts")
                            }}>
                            <Ionicons name="person-circle-outline" size={iconSize} color={skyboundBlue} />
                        </TouchableOpacity>
                    }
                    
                    { showFilter
                        && <TouchableOpacity onPress={() => {
                                navigation.navigate("FilterScreen")
                            }}>
                            <Ionicons name="filter" size={iconSize} color={skyboundBlue} />
                        </TouchableOpacity>
                    }
                    
                    { showShare
                        && <TouchableOpacity onPress={() => {
                                console.log("Share pressed");
                            }}>
                            <Ionicons name="share-outline" size={iconSize} color={skyboundBlue} />
                        </TouchableOpacity>
                    }
                </View>
             </View>
         </SafeAreaView>
    )

}

// ... styles remain the same

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
