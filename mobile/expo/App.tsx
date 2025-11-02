// mobile/expo/App.tsx
import { useFonts } from "expo-font";
import React from "react";
import Toast from "react-native-toast-message";
import RootNavigator from "./src/nav/RootNavigator";
import LoadingScreen from "./src/screens/LoadingScreen";

export default function App()
{
  const [fontsLoaded] = useFonts({
    'BlackItalic': require('./assets/fonts/Poppins/Poppins-BlackItalic.ttf'),
    'Black': require('./assets/fonts/Poppins/Poppins-Black.ttf'),
    'BoldItalic': require('./assets/fonts/Poppins/Poppins-BoldItalic.ttf'),
    'Bold': require('./assets/fonts/Poppins/Poppins-Bold.ttf'),
    'ExtraBoldItalic': require('./assets/fonts/Poppins/Poppins-ExtraBoldItalic.ttf'),
    'ExtraBold': require('./assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
    'ExtraLightItalic': require('./assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf'),
    'ExtraLight': require('./assets/fonts/Poppins/Poppins-ExtraLight.ttf'),
    'Italic': require('./assets/fonts/Poppins/Poppins-Italic.ttf'),
    'LightItalic': require('./assets/fonts/Poppins/Poppins-LightItalic.ttf'),
    'Light': require('./assets/fonts/Poppins/Poppins-Light.ttf'),
    'MediumItalic': require('./assets/fonts/Poppins/Poppins-MediumItalic.ttf'),
    'Medium': require('./assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Regular': require('./assets/fonts/Poppins/Poppins-Regular.ttf'),
    'SemiBoldItalic': require('./assets/fonts/Poppins/Poppins-SemiBoldItalic.ttf'),
    'SemiBold': require('./assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'ThinItalic': require('./assets/fonts/Poppins/Poppins-ThinItalic.ttf'),
    'Thin': require('./assets/fonts/Poppins/Poppins-Thin.ttf'),
  });

  if (!fontsLoaded) return <LoadingScreen />;

  return( 
  <>
    <RootNavigator />
    <Toast/>
  </>
          
  );
}