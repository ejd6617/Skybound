import type { RootStackParamList } from '../nav/RootNavigator';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Ethan UI
import SkyboundLabelledTextBox from '../../components/ui/SkyboundLabelledTextBox';
import SkyboundButton from '../../components/ui/SkyboundButton';

//signup functionality with Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../firebase";
import { Alert } from 'react-native';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // width for SkyboundButton
  const { width: SCREEN_W } = Dimensions.get("window");
  const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
  const H_PADDING = 18;
  const BTN_W = CARD_W - H_PADDING * 2;

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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Gradient background */}
      <LinearGradient
        colors={['#2F97FF', '#000']}
        start={{ x: -1, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      >
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
            style={{ width: 220, height: 70, resizeMode: 'contain', marginBottom: 6 }}
          />

          {/* Subtitle (Poppins) */}
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              fontFamily: 'Poppins_400Regular',
              marginBottom: 30,
            }}
          >
            Your journey starts here
          </Text>

          {/* White card */}
          <View
            style={{
              width: '90%',
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 24,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 8 },
              elevation: 4,
            }}
          >
            {/* Title */}
            <Text
              style={{
                fontSize: 24,
                fontFamily: 'Poppins_700Bold',
                color: '#111827',
                marginBottom: 6,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins_400Regular',
                color: '#6B7280',
                marginBottom: 35,
              }}
            >
              Join Skybound to track and save on flights
            </Text>

            {/* Full Name */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#111827', marginBottom: 0 }}>
              Full Name
            </Text>
            <SkyboundLabelledTextBox
              label=""
              placeholderText="Enter your name"
              width={BTN_W}
              height={45}
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#111827', marginTop: 25, marginBottom: 0 }}>
              Email
            </Text>
            <SkyboundLabelledTextBox
              label=""
              placeholderText="Enter your email"
              width={BTN_W}
              height={45}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Password */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#111827', marginTop: 25, marginBottom: 0 }}>
              Password
            </Text>
            <SkyboundLabelledTextBox
              label=""
              placeholderText="Create a password"
              width={BTN_W}
              height={45}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Confirm Password */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#111827', marginTop: 25, marginBottom: 0 }}>
              Confirm Password
            </Text>
            <SkyboundLabelledTextBox
              label=""
              placeholderText="Re-enter password"
              width={BTN_W}
              height={45}
              value={password2}
              onChangeText={setPassword2}
              secureTextEntry
            />

            {/* Create Account button */}
            <View style={{ marginTop: 25 }}>
              <SkyboundButton
                onPress={handleSignup}
                width={BTN_W}
                height={50}
                style={{
                  backgroundColor: '#000000',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                textVariant="primaryButton"
                textSize={16}
              >
                Create account
              </SkyboundButton>
            </View>

            {/* OR separator */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: 16,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              <Text
                style={{
                  marginHorizontal: 8,
                  color: '#9CA3AF',
                  fontFamily: 'Poppins_400Regular',
                }}
              >
                or
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            </View>

            {/* Google button (kept path) */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                paddingVertical: 12,
              }}
            >
              <Image
                source={require('../../assets/images/google.png')}
                style={{ width: 22, height: 22, resizeMode: 'contain', marginRight: 10 }}
              />
              <Text
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  color: '#111827',
                  fontSize: 15,
                }}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Login link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              <Text style={{ color: '#6B7280', fontFamily: 'Poppins_400Regular' }}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: '#0071E2', fontFamily: 'Poppins_600SemiBold' }}>
                  Log in
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom links (unchanged) */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginTop: 35,
              width: '90%',
            }}
          >
            <TouchableOpacity>
              <Text style={{ color: 'white', fontFamily: 'Poppins_400Regular', fontSize: 12 }}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{ color: 'white', fontFamily: 'Poppins_400Regular', fontSize: 12 }}>
                Terms of Service
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{ color: 'white', fontFamily: 'Poppins_400Regular', fontSize: 12 }}>
                Help
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}