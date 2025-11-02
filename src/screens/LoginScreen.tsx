import basicStyles from '@constants/BasicComponents';
import { useColors } from '@constants/theme'; // to use dark/light theme
//react native imports
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import LoadingScreen from '@src/screens/LoadingScreen';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native';



// Ethan UI
import SkyboundButton from '@components/ui/SkyboundButton';
import SkyboundItemHolder from '@components/ui/SkyboundItemHolder';
import SkyboundLabelledTextBox from '@components/ui/SkyboundLabelledTextBox';
import SkyboundText from '@components/ui/SkyboundText';

//Firebase imports
//import { auth } from '@src/firebase';
//import { signInWithEmailAndPassword } from 'firebase/auth';

//toast imports
import Toast from 'react-native-toast-message';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const c = useColors(); // current theme (light/dark)

  // width for SkyboundButton
  const { width: SCREEN_W } = Dimensions.get("window");
  const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
  const H_PADDING = 18;
  const BTN_W = CARD_W - H_PADDING * 2;
  const itemHolderWidth = SCREEN_W * .9;

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
    try 
    {
      // TEMPORARY: Bypass login requirements
      /*
      console.log("Attempting Sign in...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('sign in successful!');
      navigation.navigate('Dashboard');
      setIsLoading(false);
      */
      navigation.navigate('Dashboard');
      setIsLoading(false);
    }
    catch(error :any)
    {
      Toast.show({
        type: 'error',
        text1: 'Error:',
        text2: error.message,
      });
      setIsLoading(false);
      return;
    }

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
            style={{ width: 250, height: 70, resizeMode: 'contain', marginTop:25, marginBottom: 10 }}
          />

       

          {/* Subtitle */}
          <SkyboundText variant="primary" accessabilityLabel="Skybound: Your Journey Starts Here" style={{marginBottom: 33}}> 
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
              value={email}
              onChange={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              {/* Password */}
              <SkyboundLabelledTextBox
                label="Password"
                placeholderText="Enter your password"
                width={BTN_W}
                height={45}
                value={password}
                onChange={setPassword}
                secureTextEntry
                textColor={c.text}
                placeholderColor={c.subText}
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
                <Text style={{ color: c.text, fontFamily: 'Poppins_400Regular', fontSize: 12 }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}

            <SkyboundButton
              onPress={() => navigation.navigate('ComponentTest')}
              style={basicStyles.skyboundButtonPrimaryLight}
              width={100}
              height={50}
            >
              Component Test
            </SkyboundButton>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}