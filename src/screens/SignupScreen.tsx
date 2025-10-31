import { useColors } from '@constants/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
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

// Ethan UI
import SkyboundButton from '@components/ui/SkyboundButton';
import SkyboundItemHolder from '@components/ui/SkyboundItemHolder';
import SkyboundLabelledTextBox from '@components/ui/SkyboundLabelledTextBox';
import SkyboundText from '@components/ui/SkyboundText';

//signup functionality with Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Alert } from 'react-native';
import { auth } from "../firebase";

export default function SignupScreen() {
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const c = useColors();

  const { width: SCREEN_W } = Dimensions.get('window');
  const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
  const H_PADDING = 18;
  const BTN_W = CARD_W - H_PADDING * 2;
  const itemHolderWidth = SCREEN_W * 0.9;

  //signup functionality with Firebase
  async function handleSignup() {
    if (!email || !password || !password2 || !fullName) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    if (password !== password2) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      navigation.navigate('Dashboard');

    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert('Signup failed', error.message);
    }
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
            source={require('@assets/images/skybound-logo-white.png')}
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
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            {/* Email */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              <SkyboundLabelledTextBox
                label="Email"
                placeholderText="Enter your email"
                width={BTN_W}
                height={45}
                value={email}
                onChangeText={setEmail}
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
                onChangeText={setPassword}
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
                onChangeText={setPassword2}
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
                onPress={handleSignup}
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