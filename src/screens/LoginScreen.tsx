import { useColors } from '@constants/theme'; // to use dark/light theme
//react native imports
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import LoadingScreen from '@src/screens/LoadingScreen';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ShowPasswordIcon from '../../assets/images/ShowPasswordIcon.svg';



// Ethan UI
import SkyboundButton from '@components/ui/SkyboundButton';
import SkyboundItemHolder from '@components/ui/SkyboundItemHolder';
import SkyboundLabelledTextBox from '@components/ui/SkyboundLabelledTextBox';
import SkyboundText from '@components/ui/SkyboundText';

//Firebase imports
import { auth } from '@src/firebase';
import { updateUserData } from '@src/firestoreFunctions';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { serverTimestamp } from "firebase/firestore";

import * as Google from "expo-auth-session/providers/google";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const c = useColors(); // current theme (light/dark)
  const [loginError, setLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [hidePassword, setHidePassword] = useState(true)

  // width for SkyboundButton
  const { width: SCREEN_W } = Dimensions.get("window");
  const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
  const H_PADDING = 18;
  const BTN_W = CARD_W - H_PADDING * 2;
  const itemHolderWidth = SCREEN_W * .9;

  const [request, response, promptAsync] = Google.useAuthRequest({
          //this key was generated from a google clould project
          iosClientId: '367556706415-3ni93vpkp7c6hfsl72po1gf6lfle01up.apps.googleusercontent.com',
          webClientId: '367556706415-eqnunq32cebub258ogudj9s0h23b8d6v.apps.googleusercontent.com',
          androidClientId: '367556706415-i5pntol41teebgo0cd82ogh991i5jklv.apps.googleusercontent.com'
      } );

  
    useEffect(() => {
      //if response was successful
      if(response?.type === 'success')
      {
        const { idToken } = response.params;
  
        //convert the Google crediantial to a Firebase credential
        const credential = GoogleAuthProvider.credential(idToken)
  
        //Sign in with Firebase using crediential
        signInWithCredential(auth, credential)
        .then(userCredential => {
            console.log('Google sign in successful: ', userCredential.user.email);
            navigation.reset({
              index: 0,
              routes: [{ name: 'App' }],
            });
        })
        .catch(error => {
            console.error("Failed sign in with Google: ", error.message);
        });
      }
    }, [response]) //runs automatically when response changes

  //resetting email and password when user renavigates to the login screen

  useFocusEffect(
    useCallback(() =>{
      setEmail('');
      setPassword('');

    }, [])
  );

  //handling login with email
  const handleLogin = async (email : string, password : string) => {
    setIsLoading(true);
    setLoginError(false);
    setLoginErrorMessage("");

    try 
    {
     
      console.log("Attempting Sign in...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('sign in successful!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'App' }],
      });
      setIsLoading(false);

      updateUserData(userCredential.user.uid, {LastLogIn: serverTimestamp()});
    }
    catch(error :any)
    {
      setLoginError(true);
      setLoginErrorMessage("Email and password combination is not found in our system");
      setIsLoading(false);
      return;
    }

  }

  //helpler function for password hiding
  function toggleShowPassword()
  {
    if(hidePassword)
      setHidePassword(false);
    else
      setHidePassword(true);
  }

  //displays loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Gradient background from theme */}
      <LinearGradient
        colors={c.gradient}
        start={c.gradientStart}
        end={c.gradientEnd}
        style={{ flex: 1 }}
      >

       
        <View
          style={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 65,
          }}
        >
          {/* LOGO */}
          <Image
            source={require('@assets/images/skybound-logo-white.png')}
            style={{ width: 500, height: 70, resizeMode: 'contain', marginTop:25, marginBottom: 20 }}
          />

       

          {/* Subtitle */}
          <SkyboundText variant="primary" accessabilityLabel="Skybound: Your Journey Starts Here" style={{color: '#ffffffff', marginBottom: 40, fontSize: 16}}> 
            Your Journey Starts Here
          </SkyboundText>

             

          {/* Card / holder */}
          <SkyboundItemHolder style={{ alignContent: 'flex-start', gap: 10, backgroundColor: c.card }} width={itemHolderWidth}>
            {/* Title */}
            <View style={{ width: BTN_W, alignItems: 'flex-start' }}>
              <SkyboundText variant="primaryBold" accessabilityLabel="Welcome back to Skybound" size={20} style={{ color: c.text, marginBottom: 2, marginTop: 10 }}>
                Welcome Back
              </SkyboundText>
              <SkyboundText variant="secondary" accessabilityLabel="Please sign into your account" style={{ color: c.text, marginBottom: 15 }}>
                Please Sign In to your account
              </SkyboundText>
            </View>

            {/* Email */}
            <SkyboundLabelledTextBox
              label="Email"
              placeholderText="Enter your email"
              width={BTN_W}
              height={45}
              onChange={setEmail}
              enableErrorText={loginError}
              errorText={loginErrorMessage}
            />

            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              {/* Password */}
              <SkyboundLabelledTextBox
                label="Password"
                placeholderText="Enter your password"
                width={BTN_W}
                height={45}
                onChange={setPassword}
                secureTextEntry={hidePassword}
                enableErrorText={loginError}
                errorText={loginErrorMessage}
                touchableIcon={true}
                touchableIconFunction={toggleShowPassword}
                icon={<ShowPasswordIcon height={24} width={24}/>}

              />
            </View>

            {/* Login button */}
            <View style={{ marginTop: 25 }}>
              <SkyboundButton
                onPress={async () => await handleLogin(email, password)}
                width={BTN_W}
                height={50}
                style={{
                  backgroundColor: c.buttonBg,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                textVariant="forceWhite"
                textSize={15}
              >
                Log In
              </SkyboundButton>
            </View>

            {/* OR separator */}
            <View style={{ width: BTN_W, alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 10,
                  width: '100%',
                }}
              >
                <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
                <Text
                  style={{
                    marginHorizontal: 10,
                    color: c.subText,
                    fontFamily: 'Poppins_400Regular',
                  }}
                >
                  or
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
              </View>
            </View>

            {/* Google button */}
            <View style={{ width: BTN_W, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={async () => {
                  setIsLoading(true);
                  await promptAsync();
                  setIsLoading(false);
                }}
                style={{
                  width: '100%',              
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: c.card,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: c.outline,
                  paddingVertical: 12,
                }}
              >
                <Image
                  source={require('@assets/images/google.png')}
                  style={{ width: 22, height: 22, resizeMode: 'contain', marginRight: 10 }}
                />
                <Text
                  style={{
                    fontFamily: 'Poppins_600SemiBold',
                    color: c.text,
                    fontSize: 15,
                  }}
                >
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign up link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, marginBottom: 20 }}>
              <Text style={{ color: c.subText, fontFamily: 'Poppins_400Regular' }}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={{ color: c.link, fontFamily: 'Poppins_600SemiBold' }}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </SkyboundItemHolder>

          {/* Bottom links */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginTop: 30,
              width: '90%',
            }}
          >
            {['Privacy Policy', 'Terms of Service', 'Help'].map((label) => (
              <TouchableOpacity key={label}>
                <Text style={{ color: c.text, fontFamily: 'Poppins_400Regular', fontSize: 16 }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
