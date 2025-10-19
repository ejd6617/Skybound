import React from 'react';
import { StyleSheet, View } from 'react-native';
import BallIcon from '../../assets/images/BallIcon.svg';
import SimplifiedFlightGraphic from '../../assets/images/SimplifiedFlightGraphic.svg';
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
                      <BallIcon width={24} height={24}></BallIcon>
                </View>
                 <SkyboundText accessabilityLabel={'Source Airport Code: ' + sourceCode} variant="primary">{sourceCode}</SkyboundText>
                <SkyboundText accessabilityLabel={'Source Airport Name: ' + sourceName} variant="secondary">{sourceName}</SkyboundText>
            </View>

  {/* Middle column */}
        <View style={styles.middleSubholder}>
          <SimplifiedFlightGraphic size={100}></SimplifiedFlightGraphic>

        <SkyboundText accessabilityLabel={'Total flight distance:' + totalDistance} variant="secondary">{totalDistance}</SkyboundText>
        <SkyboundText accessabilityLabel={'Estimated flight time: ' + totalTime  } variant="secondary">{totalTime}</SkyboundText>
        </View>

  {/* Right column */}
        <View style={styles.subholder}>
            <View style={{ width: 30, height: 30 }}>
                <BallIcon width={24} height={24}></BallIcon>
            </View>
            <SkyboundText accessabilityLabel={'Destination Airport Code: ' + destCode} variant="primary">{destCode}</SkyboundText>
            <SkyboundText accessabilityLabel={'Destination Airport Name: ' + destName} variant="secondary">{destName}</SkyboundText>
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
        alignContent: 'center',
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