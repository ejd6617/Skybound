import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import type { RootStackParamList } from '../nav/RootNavigator';

// Ethan UI
import SkyboundButton from '../../components/ui/SkyboundButton';
import SkyboundItemHolder from '../../components/ui/SkyboundItemHolder';
import SkyboundLabelledTextBox from '../../components/ui/SkyboundLabelledTextBox';
import SkyboundText from '../../components/ui/SkyboundText';

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
          <SkyboundText variant='primary' accessabilityLabel='Skybound: your journey starts here'>Your Journey Starts Here</SkyboundText>

          {/* card */}
          <SkyboundItemHolder width={CARD_W} style={{gap: 20}}>
            {/* Title */}
            <View style={{width: BTN_W, alignItems: 'flex-start'}}>
              <SkyboundText variant='primaryBold' accessabilityLabel='Create Account' size={20}>Create Account</SkyboundText>
              <SkyboundText variant='primary' accessabilityLabel='Join Skybound to track and save on flights'>Join Skybound to track and save on flights</SkyboundText>
            </View> 
            {/* Full Name */}
           
            <SkyboundLabelledTextBox
              label="Full Name"
              placeholderText="Enter your name"
              width={BTN_W}
              height={45}
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email */}
           
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

            {/* Password */}
            
            <SkyboundLabelledTextBox
              label="Password"
              placeholderText="Create a password"
              width={BTN_W}
              height={45}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Confirm Password */}
       
            <SkyboundLabelledTextBox
              label="Confirm Password"
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
                onPress={() => navigation.navigate('Dashboard')}
                width={BTN_W}
                height={50}
                style={{
                  backgroundColor: '#000000',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                textVariant="forceWhite"
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
          </SkyboundItemHolder>

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