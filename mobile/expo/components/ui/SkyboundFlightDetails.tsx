import React, { ReactNode } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import SkyboundItemHolder from './SkyboundItemHolder';
import SkyboundText from './SkyboundText';

interface SkyboundFlightDetailsProps {
    airlineLogo: ReactNode;
    airlineName: string;
    airlineDescription: string;
    price: string;
    tripType: string;
    departureTime: string;
    arrivalTime: string;
    sourceCode: string;
    destCode: string;
    departureDate: string;
    arrivalDate: string;
    travelTime: string;
    stops: string;
    onPress: () => void;
}


const SkyboundFlightDetails: React.FC<SkyboundFlightDetailsProps> =({
    airlineLogo,
    airlineName,
    airlineDescription,
    price,
    tripType,
    departureTime,
    arrivalTime,
    sourceCode,
    destCode,
    departureDate,
    arrivalDate,
    travelTime,
    stops,
    onPress
}) => {

    return(
        <TouchableOpacity onPress={onPress}>
        <SkyboundItemHolder>
    
        <View style={styles.rowHolder}>
            {airlineLogo}
            
            <View style={styles.subHolder}>
                <SkyboundText accessabilityLabel={'Airline Name: ' + airlineName} variant='primary' size={16}>{airlineName}</SkyboundText>

                <SkyboundText accessabilityLabel={'Airline Description: ' + airlineDescription}variant='secondary'>{airlineDescription}</SkyboundText>
            </View>

            <View style={styles.subHolder}>
                
                <SkyboundText accessabilityLabel={'Price: ' + price} variant='blue'>{price}</SkyboundText>

                <SkyboundText accessabilityLabel={'Trip Type: ' + tripType} variant='secondary'>{tripType}</SkyboundText>

            </View>

        </View>


        <View style={styles.rowHolder}>
                <View style={styles.subHolder}>

                    <SkyboundText accessabilityLabel={'Estimated departure time: ' + departureTime} variant='primary' size={20}>{departureTime}</SkyboundText>

                    <View style={styles.rowHolder}>
                            <SkyboundText accessabilityLabel={'Source Airport Code: ' + sourceCode} variant='secondary'>{sourceCode}</SkyboundText>

                            <SkyboundText accessabilityLabel={'Departure Date: ' + departureDate} variant='secondary'>{departureDate}</SkyboundText>

                    </View>

                </View>
                <View style={{justifyContent: 'center'}}>
                <View style={styles.subHolder}>

                    <SkyboundText accessabilityLabel={'Estimated travel time: ' + travelTime} variant='secondary'>{travelTime}</SkyboundText>

                    <Image source={require('../../assets/images/AirlineTravelGraphic.png')}></Image>

                    <SkyboundText accessabilityLabel={'Number of stops: ' + stops} variant='secondary'>{stops}</SkyboundText>

                </View>
                </View>

                <View style={styles.subHolder}>

                    <SkyboundText accessabilityLabel={'Estimated arrival time: ' + arrivalTime} variant='primary' size={20}>{arrivalTime}</SkyboundText>

                    <View style={styles.rowHolder}>
                            <SkyboundText accessabilityLabel={'Destination Airport code: ' + destCode} variant='secondary'>{destCode}</SkyboundText>

                            <SkyboundText accessabilityLabel={'Estimated Arrival Date: ' + arrivalDate } variant='secondary'>{arrivalDate}</SkyboundText>

                    </View>

                </View>

        </View>

        </SkyboundItemHolder>
        </TouchableOpacity>

    )
}

const styles = StyleSheet.create({

    rowHolder: {
        gap: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    subHolder: {
        gap: 2,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2
    }

})


export default SkyboundFlightDetails
