import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle, StyleSheet, Image } from 'react-native';
import BasicStyles from '../../constants/BasicComponents'
import SkyboundText from './SkyboundText';

interface SimplifiedFlightDetailsProps {
    sourceCode: string; // the airport code of the source airport
    sourceName: string; // the airport name fo the source airport
    totalDistance: number; // the total distance
    totalTime: number; //the total time
    destCode: string; //the airport code of the destination airport
    destName: string; // the airport name of the destination airport
}


const SimplifiedFlightDetails: React.FC<SimplifiedFlightDetailsProps> = ( {
    sourceCode,
    sourceName,
    totalDistance,
    totalTime,
    destCode,
    destName,
}) => {
    return (
        <View style={styles.itemHolder}>
            {/* Left column */}
            <View style={styles.subholder}>
                 <View style={{ width: 30, height: 30 }}>
                      <Image
                         source={require('../../assets/images/CircleGraphic.png')}
                        style={{ width: '100%', height: '100%' }}
                        />
                </View>
                 <SkyboundText variant="primary">{sourceCode}</SkyboundText>
                <SkyboundText variant="secondary">{sourceName}</SkyboundText>
            </View>

  {/* Middle column */}
        <View style={styles.middleSubholder}>
            <View style={{ width: 30, height: 30 }}>
                <Image
                    source={require('../../assets/images/AirplaneIcon.png')}
                     style={{ width: '100%', height: '100%' }}
                />
            </View>
            <View style={{ width: 100, height: 30 }}>
                <Image source={require('../../assets/images/DistanceLine.png')} 
                style={{width: '100%'}}/>
            </View>

        <SkyboundText variant="secondary">{totalDistance}</SkyboundText>
        <SkyboundText variant="secondary">{totalTime}</SkyboundText>
        </View>

  {/* Right column */}
        <View style={styles.subholder}>
            <View style={{ width: 30, height: 30 }}>
                <Image
                    source={require('../../assets/images/CircleGraphic.png')}
                    style={{ width: '100%', height: '100%' }}
                />
            </View>
            <SkyboundText variant="primary">{destCode}</SkyboundText>
            <SkyboundText variant="secondary">{destName}</SkyboundText>
        </View>
</View>


    )
}



const styles = StyleSheet.create({

    itemHolder: {
        padding: -16,
        backgroundColor: '#E8EFF0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // side columns stay at edges
         width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 20,
        position: 'relative', // parent relative for absolute child
    },

    subholder: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        maxWidth: '30%',           // side columns take up at most 30% of parent width
        minWidth: 0, 
       
    },
    
    middleSubholder: {
       position: 'absolute', // absolutely positioned in the parent
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 3,
    }

})

export default SimplifiedFlightDetails;