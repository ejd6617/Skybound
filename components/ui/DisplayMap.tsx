import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import MapView, { LatLng, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import airportData from '../../airports.json';
import SkyboundItemHolder from './SkyboundItemHolder';
import SkyboundText from './SkyboundText';

interface DisplayMapProps {
  sourceAirportCode?: string;
  destAirportCode?: string;
  waypointCodes?: string[];
  mapWidth: number;
  mapHeight: number;
  showDistanceLabel?: boolean;
}

const DisplayMap: React.FC<DisplayMapProps> = ({
  sourceAirportCode,
  destAirportCode,
  waypointCodes,
  mapWidth,
  mapHeight,
  showDistanceLabel = true,
}) => {
    //reference to the MapView to control it programmically
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();

  const [sourceAirportLatLng, setSourceAirportLatLng] = useState<LatLng | null>(null);
  const [destAirportLatLng, setDestAirportLatLng] = useState<LatLng | null>(null);
  const [waypointLatLngs, setWaypointLatLngs] = useState<LatLng[]>([]);
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);

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
    const waypointList = (waypointCodes || [])
      .map(code => getAirportByCode(code))
      .filter(Boolean)
      .map((airport: any) => ({ latitude: airport.lat, longitude: airport.lon } as LatLng));

    const coordsToFit: LatLng[] = [];

    if (source) {
      const srcLatLng = { latitude: source.lat, longitude: source.lon } as LatLng;
      setSourceAirportLatLng(srcLatLng);
      coordsToFit.push(srcLatLng);
    }

    if (dest) {
      const destLatLng = { latitude: dest.lat, longitude: dest.lon } as LatLng;
      setDestAirportLatLng(destLatLng);
      coordsToFit.push(destLatLng);
    }

    if (waypointList.length > 0) {
      setWaypointLatLngs(waypointList);
      coordsToFit.push(...waypointList);
    } else {
      setWaypointLatLngs([]);
    }

    if (coordsToFit.length > 0) {
      mapRef.current?.fitToCoordinates(coordsToFit, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }

    if (coordsToFit.length >= 2) {
      setDistanceMiles(calculatePathDistance(coordsToFit));
    } else {
      setDistanceMiles(null);
    }
  }, [sourceAirportCode, destAirportCode, waypointCodes]);

  const polylineCoords = useMemo(() => (
    (sourceAirportLatLng ? [sourceAirportLatLng] : [])
      .concat(waypointLatLngs)
      .concat(destAirportLatLng ? [destAirportLatLng] : [])
  ), [destAirportLatLng, sourceAirportLatLng, waypointLatLngs]);

  return (
    <SkyboundItemHolder style={{ padding: 0, overflow: 'hidden' }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={{ width: mapWidth, height: mapHeight, borderRadius: 16 }}
        mapType={colorScheme === 'dark' ? 'standard' : 'standard'}
        initialRegion={{
          latitude: sourceAirportLatLng?.latitude || waypointLatLngs[0]?.latitude || 0,
          longitude: sourceAirportLatLng?.longitude || waypointLatLngs[0]?.longitude || 0,
          latitudeDelta: 20,
          longitudeDelta: 20,
        }}
      >
        {(sourceAirportLatLng || destAirportLatLng || waypointLatLngs.length > 0) && (
          <>
            {sourceAirportLatLng && <Marker coordinate={sourceAirportLatLng} title="Source Airport" />}
            {waypointLatLngs.map((point, idx) => (
              <Marker key={`waypoint-${idx}`} coordinate={point} title={`Stop ${idx + 1}`} />
            ))}
            {destAirportLatLng && <Marker coordinate={destAirportLatLng} title="Destination Airport" />}
            {polylineCoords.length >= 2 && (
              <Polyline
                coordinates={polylineCoords}
                strokeColor="#0071E2"
                strokeWidth={3}
              />
            )}
          </>
        )}
      </MapView>
      {showDistanceLabel && distanceMiles !== null && (
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 12,
            backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.9)',
          }}
        >
          <SkyboundText variant="primaryBold" size={12}>
            {distanceMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })} mi
          </SkyboundText>
        </View>
      )}
    </SkyboundItemHolder>
  );
};

export default DisplayMap;

function calculatePathDistance(coords: LatLng[]): number {
  let total = 0;

  for (let i = 0; i < coords.length - 1; i += 1) {
    total += haversine(coords[i], coords[i + 1]);
  }

  return total;
}

// Approx haversine distance in miles
function haversine(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}
