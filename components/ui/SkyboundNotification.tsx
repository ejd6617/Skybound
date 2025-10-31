import BasicStyles from '@constants/BasicComponents';
import React, { ReactNode } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import SkyboundButton from './SkyboundButton';
import SkyboundItemHolder from './SkyboundItemHolder';
import SkyboundText from './SkyboundText';

interface SkyboundNotificationProps {
    notificationTitle: string;
    notificationDate: Date;
    notificationIcon?:  ReactNode; //generic visual prop for images
    notificationText: string;
}



const SkyboundNotification: React.FC<SkyboundNotificationProps> = ({
    notificationTitle, 
    notificationDate, 
    notificationIcon,
    notificationText, }) => {


        //format date first
        const d = new Date(notificationDate); // handles both Date or string input

        const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); // collects time
        const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
        const formattedDate = `${time} ${monthNames[d.getMonth()]} ${d.getDate()}`; //collects datee

        //get screen dimensions
        const {width, height} = Dimensions.get('window')
 
        return(
            <SkyboundItemHolder width={width * .9} height={150}>
                <View style={styles.topHolder}> 
                    
                    <View style={styles.titleDateHolder}>
                        
                            <SkyboundText variant='primary' accessabilityLabel={'Notification Title: ' + notificationTitle}>{notificationTitle}</SkyboundText>
                            <SkyboundText variant='secondary' accessabilityLabel={'Notification Date: ' + notificationDate}>{formattedDate}</SkyboundText>
                        
                    </View>
                    <View style={styles.deleteButtonHolder}>
                     <SkyboundButton style={[BasicStyles.skyboundButton, BasicStyles.skyboundButtonDelete]} textVariant='deleteButton'  width={20} height={25} textSize={20} onPress={() => console.log("yippeee!!")}>X</SkyboundButton>
                     </View>

                </View>
                <View style={{width: '100%'}}>
                    <View style={styles.iconDescriptionHolder}>
                        <View style={styles.iconHolder}>
                            {notificationIcon}
                        </View>
            
                        <View style={{flex: 1}}>
                            <SkyboundText variant='primary' accessabilityLabel={'Notification Body: ' + notificationText}>{notificationText}</SkyboundText>
                        </View>
                    </View>
                </View>


            </SkyboundItemHolder>
        )
}

const styles = StyleSheet.create({
    topHolder: {
       alignContent: 'flex-start',
        padding: 5,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    titleDateHolder: {
        alignContent: 'flex-start',
        gap: 1,
        flex:1,
        
    },

    deleteButtonHolder: {
        justifyContent: "flex-start",
        alignItems: 'flex-end',
        flex: 1,

    },

    iconDescriptionHolder: {
        flexDirection: 'row',        // icon left, text right
        alignItems: 'center',        // vertically center both
        paddingHorizontal: 10,
        gap: 10, 
        justifyContent: 'flex-start'                    // space between icon and text
    },

    iconHolder: {
        width: 40,                   // give your icon room to display!
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
},

})

export default SkyboundNotification;