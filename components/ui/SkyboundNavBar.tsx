import React, { ReactNode } from 'react';
import { View, StyleSheet, Image, Dimensions, Touchable, TouchableOpacity} from 'react-native';
import SkyboundText from './SkyboundText'
import { SafeAreaView } from 'react-native-safe-area-context';



interface SkybounNavBarProps{
    title: string;           //the title text the NavBar dispalys
    leftHandIcon: ReactNode; //the icon that will be displayed on the left hand side
    leftHandIconOnPressEvent: () => void; //the event that will happen when the left hand icon is pressed
    rightHandFirstIcon: ReactNode; //the icon that will be displayed first on the right hand side
    rightHandFirstIconOnPressEvent: () => void; //the event that will happen when the first right hand icon is pressed
    rightHandSecondIcon: ReactNode; //the icon that will be displayed second on the right hand side
    rightHandSecondIconOnPressEvent: () => void; //the event that will happen when the second right hand icon is pressed
}


const SkyboundNavBar: React.FC<SkybounNavBarProps> =({
    title,
    leftHandIcon,
    leftHandIconOnPressEvent,
    rightHandFirstIcon,
    rightHandFirstIconOnPressEvent,
    rightHandSecondIcon,
    rightHandSecondIconOnPressEvent,
}) => {

    const {width, height} = Dimensions.get('window')

    return(
        <SafeAreaView style={{backgroundColor: 'white'}}>
        <View style={[styles.navBarHolder, {width: width}]}>
            <TouchableOpacity onPress={leftHandIconOnPressEvent}>
                    {leftHandIcon}
            </TouchableOpacity>
            
            <View style={styles.title}>
                <SkyboundText variant='navBar'>{title}</SkyboundText>
            </View>

            <View style = {styles.rightHandIconsHolder}>
                    <TouchableOpacity onPress={rightHandFirstIconOnPressEvent}>
                        {rightHandFirstIcon}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={rightHandSecondIconOnPressEvent}>
                        {rightHandSecondIcon}
                    </TouchableOpacity>
            </View>

         </View>
         </SafeAreaView>
    )

}


const styles = StyleSheet.create({

    navBarHolder: {
        height: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        backgroundColor: 'white',
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
        height: '100%', 
  },
        
})

export default SkyboundNavBar