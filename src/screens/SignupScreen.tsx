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
import ShowPasswordIcon from '../../assets/images/ShowPasswordIcon.svg';


//firebase and googe imports for registration
import * as Google from "expo-auth-session/providers/google";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, updateProfile } from "firebase/auth";



//color scheme and root navigator imports
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';

// Ethan UI
import SkyboundButton from '@components/ui/SkyboundButton';
import SkyboundItemHolder from '@components/ui/SkyboundItemHolder';
import SkyboundLabelledTextBox from '@components/ui/SkyboundLabelledTextBox';
import SkyboundText from '@components/ui/SkyboundText';

//signup functionality with Firebase
import { auth } from "@src/firebase";
import { setUserData } from '@src/firestoreFunctions';
import LoadingScreen from '@src/screens/LoadingScreen';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

export default function SignupScreen() {
  //account creation fields
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwrodError, setPasswordError ] = useState(false);
  const [passwordsNotMatchError, setPasswordsNotMatchError] = useState(false);
  const [passwordInsufficentLengthError, setPasswordInsufficentLengthError] = useState(false);
  const [nameBoxErrorText, setNameBoxErrorText] = useState('');
  const [emailBoxErrorText, setEmailBoxErrorText] = useState('');
  const [passwordBoxErrorText, setPasswordBoxErrorText] = useState('');
  const [hidePassword1, setHidePassword1] = useState(true);
  const [hidePassword2, setHidePassword2] = useState(true);
 
 
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
  setIsLoading(true);

  // reset "visible" error flags 
  setNameError(false);
  setEmailError(false);
  setPasswordError(false);

  // LOCAL booleans
  let localHasError = false;
  const localEmptyFields =
    fullName.trim() === "" ||
    email.trim() === "" ||
    password === "" ||
    password2 === "";

  if (localEmptyFields) {
    console.log("one or more fields is empty");
    localHasError = true;
   
    setLoginError(true);
  }

  const localEmailInvalid = !isVaildEmail(email);
  if (localEmailInvalid) {
    console.log("email is invalid");
    localHasError = true;
    setEmailError(true);
  }
  //passwords do not match 
  const localPasswordsNotMatch = password !== password2;
  if (localPasswordsNotMatch) {
    console.log("passwords do not match");
    localHasError = true;
    setPasswordError(true);
  
  }
  //password is too short
  const localPasswordTooShort = password.length <= 6;
  if (localPasswordTooShort) {
    console.log("Password is too short");
    localHasError = true;
    setPasswordError(true);
    // setPasswordInsufficentLengthError(true);
  }

  //password has insufficent security 
  
  const securityRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]).+$/;
  
  const localPasswordHasInsufficentSecurity = !securityRegex.test(password);
  
  if(localPasswordHasInsufficentSecurity)
  {
    console.log("Password has insufficent security");
    localHasError = true;
    setPasswordError(true);
  }

  if (localHasError) {
    // pass the local booleans into the helpers 
    getNameBoxErrors(fullName);
    getEmailBoxErrors(email, localEmailInvalid);
    getPasswordBoxErrors(localPasswordsNotMatch, localPasswordTooShort, localPasswordHasInsufficentSecurity);

    setIsLoading(false);
    return;
  }

  // --- continue with try/catch for actual registration ---
  try {
    console.log("attempting login");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
      await updateProfile(user, {
    displayName: fullName,   
  });

  // Optional: reload to ensure name is updated
  await user.reload();

    const success = await setUserData(user.uid, fullName, email);
    if (!success) {
      Alert.alert("Error", "Failed to save user data.");
      setIsLoading(false);
      return;
    }


    navigation.reset({
      index: 0,
      routes: [{ name: "App" }],
    });
    setIsLoading(false);
  } catch (error: any) {
    setSignUpError(error.message);
    Toast.show({
      type: "error",
      text1: "Error:",
      text2: error.message,
    });
    setIsLoading(false);
    //send data to auth
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      //using setUserData to store new user info into db
      const success = await setUserData(user.uid, fullName, email);
      if (!success) {
        Alert.alert('Error', 'Failed to save user data. Please Try again.');
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'App' }],
      });
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
};

  function isVaildEmail(email) {
    //regular expression to ensure email is in proper format
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);

  }



  //error message helper functions

function getNameBoxErrors(fullName: string) {
  let text = "";
  if (!fullName.trim()) text = "Name Cannot Be Empty.";
  setNameBoxErrorText(text);
  setNameError(Boolean(text));
}

 function getEmailBoxErrors(email: string, emailInvalid: boolean) {
  let text = "";

  if (!email.trim()) {
    text += "Email Cannot Be Empty.";
    setEmailBoxErrorText(text);
    return;
  }

  if (emailInvalid) {
    text += "Email is invalid.";
  }

  setEmailBoxErrorText(text);
}

function getPasswordBoxErrors(passwordsNotMatch: boolean, passwordTooShort: boolean, passwordInsufficentSecurity: Boolean) {
  let text = "";

  if (passwordsNotMatch) {
    text += "Passwords do not match. ";
  }
  if (passwordTooShort) {
    text += "Password must be 7+ characters.";
  }
  if (passwordInsufficentSecurity)
  {
    text += 'Password must contain an uppercase letter, a lowercase letter, and a special character. '
  }
  

  setPasswordBoxErrorText(text);

 
  setPasswordError(Boolean(text));
}

  // ======= HANDLING SIGN IN WITH GOOGLE =======

  //for now, this doesnt work. The request sends fine, Google just rejects it because it doesnt recognize the expo go container. 

  //Setting up Google Auth request
      const [request, response, promptAsync] = Google.useAuthRequest({
        //this key was generated from a google clould project
        iosClientId: '367556706415-3ni93vpkp7c6hfsl72po1gf6lfle01up.apps.googleusercontent.com',
        webClientId: '367556706415-eqnunq32cebub258ogudj9s0h23b8d6v.apps.googleusercontent.com',
        androidClientId: '367556706415-i5pntol41teebgo0cd82ogh991i5jklv.apps.googleusercontent.com'
    } );

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
          navigation.navigate('App');
      })
      .catch(error => {
          console.error("Failed sign in with Google: ", error.message);
      });
    }
  }, [response]) //runs automatically when response changes


  //helper functions to toggle showing the passwords

function toggleHidePassword1()
  {
    if(hidePassword1)
        setHidePassword1(false);
    else
        setHidePassword1(true);
  }

  
  function toggleHidePassword2()
  {
    if(hidePassword2)
        setHidePassword2(false);
    else
        setHidePassword2(true);
  }

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
              onChange={setFullName}
              enableErrorText={nameError}
              errorText={nameBoxErrorText}
            />

            {/* Email */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              <SkyboundLabelledTextBox
                label= "Email" 
                placeholderText="Enter your email"
                width={BTN_W}
                height={45}
                onChange={setEmail}
                enableErrorText={emailError}
                errorText={emailBoxErrorText}
              />
            </View>

            {/* Password */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              <SkyboundLabelledTextBox
                label="Password"
                placeholderText="Create a password"
                 width={BTN_W}
                height={45}
                onChange={setPassword}
                secureTextEntry={hidePassword1}
                enableinfoIcon={true}
                infoIconText='Password must be 7+ characters,contain one uppercase letter and one special character.'
                enableErrorText={passwrodError}
                errorText={passwordBoxErrorText}
                icon={<ShowPasswordIcon height={24} width={24}/>}
                touchableIcon={true}
                touchableIconFunction={toggleHidePassword1}
                
              />
            </View>

            {/* Confirm Password */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              <SkyboundLabelledTextBox
                label="Confirm Password"
                placeholderText="Re-enter password"
                width={BTN_W}
                height={45}
                onChange={setPassword2}
                secureTextEntry={hidePassword2}
                enableErrorText={passwrodError}
                errorText={passwordBoxErrorText}
                icon={<ShowPasswordIcon height={24} width={24}/>}
                touchableIcon={true}
                touchableIconFunction={toggleHidePassword2}
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
                <Text style={{ color: c.text, fontFamily: 'Poppins_400Regular', fontSize: 16 }}>
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
