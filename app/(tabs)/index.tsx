import SkyboundButton from '@components/ui/SkyboundButton';
import SkyboundItemHolder from '@components/ui/SkyboundItemHolder';
import basicStyles from '@constants/BasicComponents';
import { useFonts } from 'expo-font';
import React from 'react';
import { GestureResponderEvent, Text, TextInput, View } from 'react-native';

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

  // Don't display anything yet if fonts aren't yet loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[basicStyles.background, {width: "100%", height: "100%"}]}>
      <SkyboundItemHolder style={basicStyles.itemHolder}>
        <Text style={[basicStyles.skyboundTextPrimary, {width: 200, height: 100}]}>Login</Text>
        <SkyboundButton
          style={[[basicStyles.skyboundButtonPrimary, basicStyles.skyboundButton],{width: 80, height: 50}]}
          textStyle={basicStyles.skyboundTextPrimary}
          onPress={function (event: GestureResponderEvent): void {
            console.log("Button pressed!");
          } }
        >
          Click Me
        </SkyboundButton>
        <TextInput placeholder="Type here" style={basicStyles.skyboundTextBox} />
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