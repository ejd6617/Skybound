import React, { ReactNode } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
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
    return (
        <TouchableOpacity onPress={onPress} >

            <SkyboundItemHolder style={{
        
            backgroundColor: '#fff',
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
            gap: 3,
            padding: 10
            
            }}>
                <View style={styles.TopRowHolder}>
                    <View style={{alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'center'}}>
                        {airlineImage}

                        <SkyboundText variant='primary' style={{fontWeight: 'bold'}}>{airlineName}</SkyboundText>
                    </View>
                    <View style={styles.flashDeal}>
                        <SkyboundText variant='primaryButton' style={{fontWeight: 'bold'}}>Flash Deal</SkyboundText>
                    </View>
                </View>

                <View style={styles.middleRowHolder}>
                    <View style={styles.subHolder}>
                        <SkyboundText variant='primary' size={20}>{sourceCode}</SkyboundText>

                        <SkyboundText variant='secondary'>{departureTime}</SkyboundText>
                    </View>

                    <View style ={styles.subHolder}>
                        <Image source={require('../../assets/images/AirlineTravelGraphic.png')} ></Image>
                        
                        <SkyboundText variant='secondary'>{travelTime}</SkyboundText>
                    </View>

                    <View style={styles.subHolder}>
                        <SkyboundText variant='primary' size={20}>{destCode}</SkyboundText>

                        <SkyboundText variant='secondary'>{arrivalTime}</SkyboundText>
                    </View>


                </View>


                    <View style={styles.middleRowHolder}>
                        <View style={styles.priceHolder}>
                            <SkyboundText variant='secondary' style={{textDecorationLine: 'line-through'}}>{originalPrice}</SkyboundText>

                            <SkyboundText variant='blue' style={{fontWeight: 'bold'}}>{newPrice}</SkyboundText>

                        </View>

                        <View style={styles.cheaperThanUsual}>
                            <SkyboundText variant='primaryButton'>Cheaper Than Usual</SkyboundText>
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