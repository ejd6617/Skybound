import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useRoute } from "@react-navigation/native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import SkyboundText from './SkyboundText';

interface SkyboundNavBarProps extends NativeStackHeaderProps {
    showLogo?: boolean;
    useBackNavigation?: boolean;
    showNotifications?: boolean;
    showUserProfile?: boolean;
    showFilter?: boolean;
    showShare?: boolean;
}

type DrawerNavProps = DrawerNavigationProp<any>;

const SkyboundNavBar: React.FC<SkyboundNavBarProps> = ({
    showLogo = false,
    useBackNavigation = false,
    showNotifications = true,
    showUserProfile = true,
    showFilter = false,
    showShare = false,
    options,
    navigation,
}) => {
    const drawerNavigation = navigation.getParent<DrawerNavProps>();
    const route = useRoute<any>();
    const {width, height} = Dimensions.get('window')
    const colorScheme = useColorScheme();
    const colors = useColors();

    const backIconColor = colors.link;
    const accentIconColor = colors.link;
    const iconSize = 24;
    
    return(
        <SafeAreaView style={{backgroundColor: colorScheme === 'light' ? 'white' : '#1E1E1E'}} edges={['top', 'left', 'right']}>
            <View style={[styles.navBarHolder, {width: width}]}>
                { useBackNavigation
                    ? <TouchableOpacity onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        }
                    }}>
                        {<Ionicons name="arrow-back" size={iconSize} color={backIconColor} />}
                    </TouchableOpacity>
                    : <TouchableOpacity onPress={() => drawerNavigation?.openDrawer()}>
                        {<Ionicons name="menu" size={iconSize} color={backIconColor} />}
                    </TouchableOpacity>
                }

                { showLogo
                    ? (
                        <View style={styles.title}>
                            <Image
                                source={require("@assets/images/skybound-logo-dark.png")}
                                style={{ width: 160, height: 28, resizeMode: "contain" }}
                                accessibilityLabel="Skybound logo"
                              />
                        </View>
                    )
                    : <View style={styles.title}>
                        <SkyboundText variant='blue' accessabilityLabel={'Title: ' + options.title}>
                           {options.title}
                        </SkyboundText>
                    </View>
                }

                <View style = {styles.rightHandIconsHolder}>
                    { showNotifications
                        && <TouchableOpacity onPress={() => {
                                drawerNavigation?.navigate("Notifications")
                            }}>
                            <Ionicons name="notifications-outline" size={iconSize} color={backIconColor} />
                        </TouchableOpacity>
                    }

                    { showUserProfile
                        && <TouchableOpacity onPress={() => {
                                drawerNavigation?.navigate("Accounts")
                            }}>
                            <Ionicons name="person-circle-outline" size={iconSize} color={backIconColor} />
                        </TouchableOpacity>
                    }
                    
                    { showFilter
                        && <TouchableOpacity onPress={() => {
                                navigation.navigate("FilterScreen", { filters: route.params?.filters, availableFlights: route.params?.availableFlights })
                            }}>
                            <Ionicons name="filter" size={iconSize} color={accentIconColor} />
                        </TouchableOpacity>
                    }
                    
                    { showShare
                        && <TouchableOpacity onPress={() => {
                                console.log("Share pressed");
                            }}>
                            <Ionicons name="share-outline" size={iconSize} color={accentIconColor} />
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
        padding: 20,
        position: 'relative',
    },

    rightHandIconsHolder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
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
