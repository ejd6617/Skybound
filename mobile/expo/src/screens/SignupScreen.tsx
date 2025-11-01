//react native exports
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';



//firebase and googe imports for registration
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from '../firebase';



//color scheme and root navigator imports
import { useColors } from '../../constants/theme';
import type { RootStackParamList } from '../nav/RootNavigator';

// Ethan UI
import SkyboundButton from '../../components/ui/SkyboundButton';
import SkyboundItemHolder from '../../components/ui/SkyboundItemHolder';
import SkyboundLabelledTextBox from '../../components/ui/SkyboundLabelledTextBox';
import SkyboundText from '../../components/ui/SkyboundText';

//Toast messages
import Toast from 'react-native-toast-message';

//Loading Screen Import
import LoadingScreen from './LoadingScreen';

//window for completing auth sessions with google
WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
  //account creation fields
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

 
  //navigation and color theme
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const c = useColors();

  //calculations to ensure proper scaling on different screen sizes
  const { width: SCREEN_W } = Dimensions.get('window');
  const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
  const H_PADDING = 18;
  const BTN_W = CARD_W - H_PADDING * 2;
  const itemHolderWidth = SCREEN_W * 0.9;

  // ======= HANDLING SIGN IN WITH EMAIL AND PASSWORD =======

  const registerUserWithEmail = async (name : string, email : string, password : string, password2) =>
  {
    //disable the register button
    setIsLoading(true);
    //check if email is in proper format
    if(!isVaildEmail(email))
    {
      Toast.show({
      type:'error',
      text1: 'Error: Email incorrect',
      text2: 'help' });
      //renable the register button
      setIsLoading(false);
      return;
    }
    //check if passwords match
    if(password !== password2)
    {
      Toast.show({
        type: 'error',
        text1: 'Error:',
        text2: 'Passwords do not match'
      });
      setIsLoading(false);
      return;
    }
    
    //if the passwords are not long enough
    if(password.length <=6)
    {
      Toast.show({
        type: 'error',
        text1: 'Error:',
        text2: 'Passwords must be 7+ characters long'
      });
      setIsLoading(false);
      return;
    }

    //send data to auth
    try {
      await handleRegisterWithEmail(email, password);
      //if succeeded, navigate to dashboard
      navigation.navigate('Dashboard');
      //renable the register button
      setIsLoading(false);
    }catch(error : any)
    { 
      setSignUpError(error.message);
      Toast.show({
        type: 'error',
        text1: 'Error:',
        text2: signUpError
      })
      //renable the register button
      setIsLoading(false);
    }
  }

  function isVaildEmail(email) {
    //regular expression to ensure email is in proper format
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);

  }

  const handleRegisterWithEmail = async (email : string, password : string) =>
  {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    console.log("User with email" + email + " Registered!")
  }


  // ======= HANDLING SIGN IN WITH GOOGLE =======

  //Setting up Google Auth request
   const [request, response, promptAsync] = Google.useAuthRequest({
    //this key was generated from a google clould project
    iosClientId: '367556706415-3ni93vpkp7c6hfsl72po1gf6lfle01up.apps.googleusercontent.com',
    webClientId: '367556706415-eqnunq32cebub258ogudj9s0h23b8d6v.apps.googleusercontent.com',
  });

  //watch for changes in response

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
          navigation.navigate('Dashboard');
      })
      .catch(error => {
          console.error("Failed sign in with Google: ", error.message);
      });
    }
  }, [response]) //runs automatically when response changes




  if (isLoading) {
      return <LoadingScreen />;
    }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Gradient background */}
      <LinearGradient colors={c.gradient} start={c.gradientStart} end={c.gradientEnd} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 65,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* LOGO */}
          <Image
            source={require('../../assets/images/skybound-logo-white.png')}
            style={{ width: 250, height: 70, resizeMode: 'contain', marginTop: 25, marginBottom: 10 }}
          />

          <Toast/>

          {/*check for sign up errors*/
            signUpError ? <SkyboundText accessabilityLabel={'Error Registering account: ' + signUpError}
                          variant='primary'>{signUpError}</SkyboundText> : null}

          {/* Subtitle */}
          <SkyboundText variant="primary" accessabilityLabel="Skybound: Your Journey Starts Here" style={{ marginBottom: 33 }}>
            Your Journey Starts Here
          </SkyboundText>

          {/* Card / holder */}
          <SkyboundItemHolder style={{ alignContent: 'flex-start', gap: 10, backgroundColor: c.card }} width={itemHolderWidth}>
            {/* Title */}
            <View style={{ width: BTN_W, alignItems: 'flex-start' }}>
              <SkyboundText variant="primaryBold" accessabilityLabel="Create Account" size={20} style={{ color: c.text, marginBottom: 2, marginTop: 10 }}>
                Create Account
              </SkyboundText>
              <SkyboundText variant="secondary" accessabilityLabel="Join Skybound to track and save on flights" style={{ color: c.text, marginBottom: 15 }}>
                Join Skybound to track and save on flights
              </SkyboundText>
            </View>

            {/* Full Name */}
            <SkyboundLabelledTextBox
              label="Full Name"
              placeholderText="Enter your name"
              width={BTN_W}
              height={45}
              value={fullName}
              autoCapitalize="words"
              onChange={setFullName}
            />

            {/* Email */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              <SkyboundLabelledTextBox
                label= "Email" 
                placeholderText="Enter your email"
                width={BTN_W}
                height={45}
                value={email}
                onChange={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              <SkyboundLabelledTextBox
                label="Password"
                placeholderText="Create a password"
                width={BTN_W}
                height={45}
                value={password}
                onChange={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                textColor={c.text}
                placeholderColor={c.subText}
              />
            </View>

            {/* Confirm Password */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              <SkyboundLabelledTextBox
                label="Confirm Password"
                placeholderText="Re-enter password"
                width={BTN_W}
                height={45}
                value={password2}
                onChange={setPassword2}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                textColor={c.text}
                placeholderColor={c.subText}
              />
            </View>

            {/* Create Account button */}
            <View style={{ marginTop: 25 }}>
              <SkyboundButton
                onPress={async () => await registerUserWithEmail(fullName, email, password, password2)}
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
                diasabled = {isLoading}
              >
                Create account
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
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: c.card,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: c.outline,
                paddingVertical: 12,
                paddingHorizontal: 50,
              }}
              onPress={async () => 
                { setIsLoading(true);
                  await promptAsync();
                  setIsLoading(false);}}
            >
              <Image
                source={require('../../assets/images/google.png')}
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

            {/* Login link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, marginBottom: 20 }}>
              <Text style={{ color: c.subText, fontFamily: 'Poppins_400Regular' }}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: c.link, fontFamily: 'Poppins_600SemiBold' }}>
                  Log in
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
                <Text style={{ color: c.text, fontFamily: 'Poppins_400Regular', fontSize: 12 }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}