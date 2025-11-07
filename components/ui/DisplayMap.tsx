import airportData from '../../airports.json'
import React, { FC, LabelHTMLAttributes, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Marker, Circle, MapPressEvent, LatLng, Polyline } from 'react-native-maps';
import { getDistance, latitudeKeys } from 'geolib';
import SkyboundItemHolder from './SkyboundItemHolder';
import SkyboundText from './SkyboundText';
import { Line } from 'react-native-svg';

interface DisplayMapProps {
    sourceAirportCode?: string;
    destAirportCode?: string;
    mapWidth: number;
    mapHeight: number;
}




const DisplayMap: React.FC<DisplayMapProps> = ({
    sourceAirportCode,
    destAirportCode, 
    mapWidth,
    mapHeight

}) => {
    
    //function for finding the source and dest airports 
    function getAirportByCode(code: string) {
        return airportData.find(
        (airport) =>
            airport.code?.toUpperCase() === code.toUpperCase() 
        );
    }

    if(sourceAirportCode)
    {
        const sourceAirport = getAirportByCode(sourceAirportCode);
    }
    else
    {
         const sourceAirport = getAirportByCode(sourceAirportCode);
    }
    
    if(destAirportCode)
    {
    const destAirport = getAirportByCode(destAirportCode);
    }

    //gather the lat and lon of source airport
    const [sourceAirportLatLng, setSourceAirportLatLng] = useState<LatLng>({
    latitude: sourceAirport.lat,
    longitude: sourceAirport.lon,       
    });
   
    //gather the lat and lon of dest airport 
     const [destAirportLatLng, setDestAirportLatLng] = useState<LatLng>({
    latitude: destAirport.lat,
    longitude: destAirport.lon,       
    });
    


    return (

        <SkyboundItemHolder>
            <MapView
            style={{width: mapWidth, height: mapHeight}}
            initialRegion={{
                latitude: sourceAirportLatLng?.latitude,
                longitude: sourceAirportLatLng?.longitude,
                latitudeDelta: 20,
                longitudeDelta: 20,}}
                >
                {sourceAirportLatLng && destAirportLatLng && (
                    <>
                    <Marker coordinate={sourceAirportLatLng} title='Source Airport'/>
                    <Marker coordinate={destAirportLatLng} title ='Destination Airport'/>

                    <Polyline 
                    coordinates={[sourceAirportLatLng, destAirportLatLng]}
                    strokeColor="#0096FF"        
                    strokeWidth={3} />
                    </>
                )}
            </MapView>
        </SkyboundItemHolder>
    )
}

export default DisplayMap