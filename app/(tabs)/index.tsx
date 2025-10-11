import SkyboundLabelledTextBox from '@/components/ui/SkyboundLabelledTextBox';
import SkyboundButton from '@components/ui/SkyboundButton';
import SkyboundItemHolder from '@components/ui/SkyboundItemHolder';
import SkyboundText from '@components/ui/SkyboundText';
import SkyboundTextBox from '@components/ui/SkyboundTextBox';
import basicStyles from '@constants/BasicComponents';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { GestureResponderEvent, View } from 'react-native';

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    'BlackItalic': require('@fonts/Poppins/Poppins-BlackItalic.ttf'),
    'Black': require('@fonts/Poppins/Poppins-Black.ttf'),
    'BoldItalic': require('@fonts/Poppins/Poppins-BoldItalic.ttf'),
    'Bold': require('@fonts/Poppins/Poppins-Bold.ttf'),
    'ExtraBoldItalic': require('@fonts/Poppins/Poppins-ExtraBoldItalic.ttf'),
    'ExtraBold': require('@fonts/Poppins/Poppins-ExtraBold.ttf'),
    'ExtraLightItalic': require('@fonts/Poppins/Poppins-ExtraLightItalic.ttf'),
    'ExtraLight': require('@fonts/Poppins/Poppins-ExtraLight.ttf'),
    'Italic': require('@fonts/Poppins/Poppins-Italic.ttf'),
    'LightItalic': require('@fonts/Poppins/Poppins-LightItalic.ttf'),
    'Light': require('@fonts/Poppins/Poppins-Light.ttf'),
    'MediumItalic': require('@fonts/Poppins/Poppins-MediumItalic.ttf'),
    'Medium': require('@fonts/Poppins/Poppins-Medium.ttf'),
    'Regular': require('@fonts/Poppins/Poppins-Regular.ttf'),
    'SemiBoldItalic': require('@fonts/Poppins/Poppins-SemiBoldItalic.ttf'),
    'SemiBold': require('@fonts/Poppins/Poppins-SemiBold.ttf'),
    'ThinItalic': require('@fonts/Poppins/Poppins-ThinItalic.ttf'),
    'Thin': require('@fonts/Poppins/Poppins-Thin.ttf'),
  });

  const [apiResponse, setApiResponse] = useState<string>("Loading...");
  useEffect(() => {
    const API_URL = Constants.expoConfig?.extra?.API_URL;
    fetch(`${API_URL}/hello`)
      .then(res => res.text())
      .then(setApiResponse)
      .catch(err => {
        console.error(err);
        console.error(`${API_URL}/hello`)
        setApiResponse("Error fetching data");
      });
  }, []);
  
  /*
  const [apiResponse, setApiResponse] = useState<string>("Loading...");
  useEffect(() => {
    const API_URL = Constants.expoConfig?.extra?.API_URL;
    const url = `${API_URL}/api/searchFlightsOneWay`;
    const requestBody = {
      originAirport: 'JFK',
      destinationAirport: 'LAX',
      date: new Date('2025-11-01'), // can be new Date() or a selected date
    };
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Update this line based on what your API actually returns
        setApiResponse(JSON.stringify(data, null, 2));
      })
      .catch((err) => {
        console.error(err);
        setApiResponse('Error fetching data');
      });
  }, []);
   */

  return (
    <View style={[basicStyles.background, {width: "100%", height: "100%"}]}>
      <SkyboundItemHolder style={basicStyles.itemHolder} width={300} height={500}>
        <SkyboundText variant = 'primary' size = {60}>Help</SkyboundText>
        <SkyboundButton style={[basicStyles.skyboundButton, basicStyles.skyboundButtonPrimary]} width={200} height={100} textVariant='primaryButton'
          onPress={function (event: GestureResponderEvent): void {
            console.log("Button pressed!");
          } }
        >
          Click Me
        </SkyboundButton>
        <SkyboundTextBox placeholderText={apiResponse} width={250} height={50}></SkyboundTextBox>

        <SkyboundLabelledTextBox placeholderText="this is a labelled text box" width={250} height={50} label="Label:"></SkyboundLabelledTextBox>
      </SkyboundItemHolder>
    </View>
  );
};

export default App;

// Code from generated template

/*
import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
*/