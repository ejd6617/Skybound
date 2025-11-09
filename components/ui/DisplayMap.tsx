import React, { useEffect, useRef, useState } from 'react';
import MapView, { LatLng, Marker, Polyline } from 'react-native-maps';
import airportData from '../../airports.json';
import SkyboundItemHolder from './SkyboundItemHolder';

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
  mapHeight,
}) => {
    //reference to the MapView to control it programmically
  const mapRef = useRef<MapView>(null);

  const [sourceAirportLatLng, setSourceAirportLatLng] = useState<LatLng | null>(null);
  const [destAirportLatLng, setDestAirportLatLng] = useState<LatLng | null>(null);

  function getAirportByCode(code?: string) {
    if (!code) return null;
    return airportData.find(
      (airport) => airport.code?.toUpperCase() === code.toUpperCase()
    );
  }

  // Update coordinates whenever codes change
  useEffect(() => {
    const source = getAirportByCode(sourceAirportCode);
    const dest = getAirportByCode(destAirportCode);

    if (source && dest) {
      setSourceAirportLatLng({ latitude: source.lat, longitude: source.lon });
      setDestAirportLatLng({ latitude: dest.lat, longitude: dest.lon });

      //move/zoom the map to fit both markers
      mapRef.current?.fitToCoordinates(
        [
          { latitude: source.lat, longitude: source.lon },
          { latitude: dest.lat, longitude: dest.lon },
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [sourceAirportCode, destAirportCode]);

  return (
    <SkyboundItemHolder>
      <MapView 
        ref={mapRef}
        style={{ width: mapWidth, height: mapHeight, borderRadius: 16, padding: -16 }}
        initialRegion={{
          latitude: sourceAirportLatLng?.latitude || 0,
          longitude: sourceAirportLatLng?.longitude || 0,
          latitudeDelta: 20,
          longitudeDelta: 20,
        }}
      >
        {sourceAirportLatLng && destAirportLatLng && (
          <>
            <Marker coordinate={sourceAirportLatLng} title="Source Airport" />
            <Marker coordinate={destAirportLatLng} title="Destination Airport" />
            <Polyline
              coordinates={[sourceAirportLatLng, destAirportLatLng]}
              strokeColor="#0096FF"
              strokeWidth={3}
            />
          </>
        )}
      </MapView>
    </SkyboundItemHolder>
  );
};

export default DisplayMap;
