import SkyboundFlashDeal from '@/components/ui/SkyboundFlashDeal';
import SkyboundFlightDetails from '@/components/ui/SkyboundFlightDetails';
import SkyboundItemHolder from '@components/ui/SkyboundItemHolder';
import SkyboundNavBar from '@components/ui/SkyboundNavBar';
import SkyboundText from '@components/ui/SkyboundText';
import basicStyles from '@constants/BasicComponents';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';

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

  const [data, setData] = useState([]);
  const API_URL = Constants.expoConfig?.extra?.API_URL;

  useEffect(() => {
    (async () => {
      try {
        const url = `${API_URL}/api/searchFlightsRoundTrip/`;
        console.log(url);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            "originAirport": "LAX",
            "destinationAirport": "JFK",
            "startDate": "2026-01-10",
            "endDate": "2026-01-17"
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        setData(data);
      } catch (err) {
        console.error('API call failed', err);
      }
    })();
 
  }, []);

  return (
    
    <View style={[basicStyles.background, {width: "100%", height: "100%"}]}>

      <StatusBar style='dark' translucent={false}></StatusBar>
    <SkyboundNavBar leftHandIcon={<Image source={require("../../assets/images/Notification Photo.png")}></Image>}
    leftHandIconOnPressEvent={() => console.log("left hand icon pressed")}
    rightHandFirstIcon={<Image source={require("../../assets/images/Notification Photo.png")}></Image>}
    rightHandFirstIconOnPressEvent={() => console.log("first right hand icon pressed")}
    rightHandSecondIcon={<Image source={require("../../assets/images/Notification Photo.png")}></Image>}
    rightHandSecondIconOnPressEvent={()=> console.log("right hand second icon pressed")}
    title={"Nav Bar Test"}></SkyboundNavBar>


      <SkyboundItemHolder>
        <SkyboundText variant = 'primary' size = {60}>Help</SkyboundText>



        {data.length > 0 && (
          <SkyboundFlashDeal airlineImage={<Image source={require("../../assets/images/AirplaneIcon.png")}></Image>} 
          airlineName={data[0].airline}
          sourceCode={data[0].outbound.from}
          destCode={data[0].return.from}
          departureTime={new Date(data[0].outbound.takeoff).toISOString().split('T')[0]}
          arrivalTime={new Date(data[0].return.takeoff).toISOString().split('T')[0]}
          travelTime={data[0].outbound.duration}
          originalPrice={data[0].price}
          newPrice={data[0].price}
          onPress={() => console.log('What a great deal!')}>
          </SkyboundFlashDeal>   
        )}

       



    </SkyboundItemHolder>

    <SkyboundFlightDetails airlineLogo={<Image source={require("../../assets/images/AirplaneIcon.png")}></Image>}
    airlineName='test airline'
    airlineDescription='test Description'
    price='$ 100'
    tripType='round trip'
    departureTime='1:11 AM'
    arrivalTime='2:22 PM'
    sourceCode='ERI'
    destCode='LAX'
    departureDate='10/12'
    arrivalDate='10/12'
    travelTime='1h 11m'
    stops='1 stop'
    onPress={() => console.log('flight pressed')}>


    </SkyboundFlightDetails>

   


      
      

          

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