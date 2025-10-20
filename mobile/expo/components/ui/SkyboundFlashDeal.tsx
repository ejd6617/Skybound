import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import AirplaneTravelGraphic from '../../assets/images/AirplaneTravelGraphic.svg';
import basicStyles from '../../constants/BasicComponents';
import SkyboundItemHolder from './SkyboundItemHolder';
import SkyboundText from './SkyboundText';


interface SkyboundFlashDealProps {
    airlineImage: ReactNode;
    airlineName: string;
    sourceCode: string;
    destCode: string;
    departureTime: string;
    arrivalTime: string;
    travelTime: string;
    originalPrice: string;
    newPrice: string;
    onPress: () => void;
}


const SkyboundFlashDeal: React.FC<SkyboundFlashDealProps> = ({
    airlineImage,
    airlineName,
    sourceCode,
    destCode,
    departureTime,
    arrivalTime,
    travelTime,
    originalPrice,
    newPrice,
    onPress
}) =>
{
    const colorScheme = useColorScheme();
    return (
        <TouchableOpacity onPress={onPress} >

            <SkyboundItemHolder style={colorScheme === 'light' ? basicStyles.itemHolderLight : basicStyles.itemHolderDark}>
                <View style={styles.TopRowHolder}>
                    <View style={{alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'center'}}>
                        {airlineImage}

                        <SkyboundText accessabilityLabel={'Airline: ' + airlineName} variant='primary' style={{fontWeight: 'bold'}}>{airlineName}</SkyboundText>
                    </View>
                    <View style={styles.flashDeal}>
                        <SkyboundText accessabilityLabel={'Flash Deal'} variant='primaryButton' style={{fontWeight: 'bold'}}>Flash Deal</SkyboundText>
                    </View>
                </View>

                <View style={styles.middleRowHolder}>
                    <View style={styles.subHolder}>
                        <SkyboundText accessabilityLabel={'Airline Code: ' + sourceCode} variant='primary' size={20}>{sourceCode}</SkyboundText>

                        <SkyboundText accessabilityLabel={'Estimated departure time: ' + departureTime} variant='secondary'>{departureTime}</SkyboundText>
                    </View>

                    <View style ={styles.subHolder}>
                       <AirplaneTravelGraphic width={100} height={20}></AirplaneTravelGraphic>
                        
                        <SkyboundText accessabilityLabel={'Estimated travel time: ' + travelTime} variant='secondary'>{travelTime}</SkyboundText>
                    </View>

                    <View style={styles.subHolder}>
                        <SkyboundText accessabilityLabel={'Destination Airline Code: ' + destCode} variant='primary' size={20}>{destCode}</SkyboundText>

                        <SkyboundText accessabilityLabel={'Estimated Arrival Time: ' + arrivalTime} variant='secondary'>{arrivalTime}</SkyboundText>
                    </View>


                </View>


                    <View style={styles.middleRowHolder}>
                        <View style={styles.priceHolder}>
                            <SkyboundText accessabilityLabel={'Original Price: ' + originalPrice} variant='secondary' style={{textDecorationLine: 'line-through'}}>{originalPrice}</SkyboundText>

                            <SkyboundText accessabilityLabel={'New Price: ' + newPrice} variant='blue' style={{fontWeight: 'bold'}}>{newPrice}</SkyboundText>

                        </View>

                        <View style={styles.cheaperThanUsual}>
                            <SkyboundText accessabilityLabel={'This flight is cheaper than usual! '} variant='primaryButton'>Cheaper Than Usual</SkyboundText>
                        </View>
                    </View>

                

            </SkyboundItemHolder>
        </TouchableOpacity>
    )
}


export default SkyboundFlashDeal

const styles = StyleSheet.create({
    TopRowHolder: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 3,
        justifyContent: 'space-between'
        
    },

    middleRowHolder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        justifyContent: 'space-between'
    },

    flashDeal: {
        backgroundColor: '#EF4444',
        borderRadius: 9999,
        padding: 4
    },

    cheaperThanUsual: {
        backgroundColor: '#F97316',
        borderRadius: 9999,
        padding: 4

    },

    subHolder: {
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
    },

    priceHolder: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2
    }
})