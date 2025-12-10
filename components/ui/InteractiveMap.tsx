import Slider from '@react-native-community/slider';
import { getDistance } from 'geolib';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Circle, MapPressEvent, Marker } from 'react-native-maps';
import airportData from '../../airports.json';
import SkyboundItemHolder from './SkyboundItemHolder';
import SkyboundText from './SkyboundText';

export type LatLng = { latitude: number; longitude: number };

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Utility function for implementing debounce on radius/location change
// Uses leading-edge debounce so logic executes immediately but subsequent calls are subject to the timeout
function createLeadingEdgeAirportDebounce(
  callback: () => void,
  wait: number
): { debounced: () => void; cancel: () => void; updateCallback: (newCallback: () => void) => void } {
  let timeout: NodeJS.Timeout | null = null;
  let lastCallback = callback;

  function updateCallback(newCallback: () => void) {
    lastCallback = newCallback;
  }

  function debounced() {
    const callNow = !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
    }, wait);

    if (callNow) {
      lastCallback();
    }
  }

  function cancel() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }

  return { debounced, updateCallback, cancel };
}

interface InteractiveMapProps {
  location?: LatLng;           // <-- new prop
  initialRadius?: number;
  minRadius?: number;
  maxRadius?: number;
  onChange?: (airports: any[]) => void;
  mapWidth?: number;
  mapHeight?: number;
}

export default function InteractiveMap({
  location: propLocation,
  initialRadius,
  minRadius = 1000,
  maxRadius = 1000000,
  onChange,
  mapWidth,
  mapHeight,
}: InteractiveMapProps) {
  const mapRef = useRef<MapView>(null);

  // internal state
  const [location, setLocation] = useState<LatLng | null>(propLocation || { latitude: 37.78825, longitude: -122.4324 });
  const [radius, setRadius] = useState(initialRadius || 10000);
  const [nearbyAirports, setNearbyAirports] = useState<any[]>([]);
  
  // Keeps track of airports within the max search range of the current location
  // Optimize nearby airport search by limiting the dataset size
  const [localAirportData, setLocalAirportData] = useState<any[]>([]) ;

  const handleMapPress = (e: MapPressEvent) => {
    const coord = e.nativeEvent.coordinate;
    setLocation(coord);
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
  };

  function findNearbyAirports(dataset, center: LatLng, range: number) {
    return dataset.filter((airport) => {
      if (!airport.lat || !airport.lon) return false;
      const distance = getDistance(center, { latitude: airport.lat, longitude: airport.lon });
      return distance <= range;
    });
  }
  
  // Update localAirportData (the set of airports within the maximum radius) on location change
  useEffect(() => {
    setLocalAirportData(findNearbyAirports(airportData, location, maxRadius));
  }, [location]);

  // Center map when propLocation changes
  useEffect(() => {
    if (propLocation) {
      setLocation(propLocation);
      mapRef.current?.animateToRegion(
        {
          ...propLocation,
          latitudeDelta: 1,
          longitudeDelta: 1,
        },
        500
      );
    }
  }, [propLocation]);

  // Init with placeholder callback
  const debouncerRef = useRef(
    createLeadingEdgeAirportDebounce(() => {}, 500)
  );

  // Logic for finding nearby airports
  // Updates upon change in location, radius, and localAirportData
  const computeAirports = useCallback(() => {
      if (!location || !radius) return;
      const nearby = findNearbyAirports(localAirportData, location, radius);
      setNearbyAirports(nearby);
      onChange?.(nearby);
  }, [location, radius, localAirportData, onChange]);

  // detect changes in marker or circle
  useEffect(() => {
    // Update the callback to use new location, radius, airport data, etc
    debouncerRef.current.updateCallback(computeAirports);
    debouncerRef.current.debounced();
    return () => {
      debouncerRef.current.cancel();
    };
  }, [computeAirports]);

  return (
    <SkyboundItemHolder>
      <MapView
        ref={mapRef}
        style={{ width: mapWidth ?? SCREEN_W * 0.95, height: mapHeight ?? SCREEN_H * 0.85 }}
        initialRegion={{
          ...(location ?? { latitude: 37.78825, longitude: -122.4324 }),
          latitudeDelta: 1,
          longitudeDelta: 1,
        }}
        onPress={handleMapPress}
      >
        {location && <Marker coordinate={location} />}
        {location && (
          <Circle
            center={location}
            radius={radius}
            fillColor="rgba(0,150,255,0.2)"
            strokeColor="rgba(0,150,255,0.5)"
          />
        )}
        {nearbyAirports.map((a, i) => (
          <Marker key={i} coordinate={{ latitude: a.lat, longitude: a.lon }} title={a.code} pinColor="#0096FF" />
        ))}
      </MapView>

      <View style={styles.controls}>
        <SkyboundText variant="primary" accessabilityLabel="Radius: ">
          Radius: {(radius / 1000).toFixed(1)} Km
        </SkyboundText>
        <Slider
          minimumValue={minRadius}
          maximumValue={maxRadius}
          step={5000}
          minimumTrackTintColor="#0096FF"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#0096FF"
          value={radius}
          onValueChange={handleRadiusChange}
        />
      </View>
    </SkyboundItemHolder>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'column',
    gap: 3,
    backgroundColor: 'transparent',
  },
});
