import airportData from '../../airports.json'
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Marker, Circle, MapPressEvent } from 'react-native-maps';
import { getDistance, latitudeKeys } from 'geolib';
import SkyboundItemHolder from './SkyboundItemHolder';
import SkyboundText from './SkyboundText';


export type LatLng = {latitude: number, longitude: number};

  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface InteractiveMapProps {
    initialLocation?: LatLng;
    initialRadius?: number;
    minRadius?: number;
    maxRadius?: number;
    onChange?: (location: LatLng, radius: number) => void;

}   


export default function InteractiveMap({
    initialLocation,
    initialRadius,
    minRadius = 1000,
    maxRadius = 100000,
    onChange,
}: InteractiveMapProps)

{
    
    const [location, setLocation] = useState<LatLng>(initialLocation);
    const [radius, setRadus] = useState(initialRadius);

    const handleMapPress = (e : MapPressEvent) => {
        const coord = e.nativeEvent.coordinate;
        setLocation(coord);
        onChange?.(coord, radius);
    };

    const handleRadiusChange = (value : number) => {
        setRadus(value);
        onChange?.(location, value);
    }


    return(
        <SkyboundItemHolder>
            <MapView
            style={{ width: SCREEN_W * 0.95, height: SCREEN_H * 0.90}}
            initialRegion={{
                ...location,
                latitudeDelta: 1,
                longitudeDelta: 1
            }}  
            onPress={handleMapPress}
            >
                <Marker coordinate={location}/>
                <Circle
                    center={location}
                    radius={radius}
                    fillColor='rgba(0,150,255,0.2)'
                    strokeColor='rgba(0,150,255,0.5)'
                    />


            </MapView>


            <View style={styles.controls}>
            <SkyboundText variant='primary' accessabilityLabel='Radius: '>
                Radius: {(radius/1000).toFixed(1)} Km
            </SkyboundText>
            <Slider
            minimumValue={minRadius}
            maximumValue={maxRadius}
            step={5000}
            minimumTrackTintColor="#0096FF"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#0096FF"
            value={radius}
            onValueChange={handleRadiusChange}/>

            
            </View>
        </SkyboundItemHolder>
    )
}

const styles = StyleSheet.create({
    controls: {
        flexDirection: 'column',
        gap: 3,
        backgroundColor: 'transparent',
    }
})