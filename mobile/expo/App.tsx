// mobile/expo/App.tsx
import React from "react";
import RootNavigator from "./src/nav/RootNavigator";
import { useFonts } from "expo-font";

export default function App() 
{
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("./assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins/Poppins-Bold.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-Light": require("./assets/fonts/Poppins/Poppins-Light.ttf"),
  });

  if (!fontsLoaded) return null;

  return <RootNavigator />;
}