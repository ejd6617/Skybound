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
import basicStyles from '../../constants/BasicComponents';
import type { RootStackParamList } from '../nav/RootNavigator';

// Ethan UI
import SkyboundButton from '../../components/ui/SkyboundButton';
import SkyboundItemHolder from '../../components/ui/SkyboundItemHolder';
import SkyboundLabelledTextBox from '../../components/ui/SkyboundLabelledTextBox';
import SkyboundText from '../../components/ui/SkyboundText';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // width for SkyboundButton
  const { width: SCREEN_W } = Dimensions.get("window");
  const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
  const H_PADDING = 18;
  const BTN_W = CARD_W - H_PADDING * 2;
  const itemHolderWidth = SCREEN_W * .9; 

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Gradient background */}
      <LinearGradient
        colors={['#FFFFFF', '#0071E2']}
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
          <SkyboundText variant='primary' accessabilityLabel="Skybound: Your Journey Starts Here">Your Journey Starts Here</SkyboundText>

          {/* White card */}
          <SkyboundItemHolder style={{alignContent: 'flex-start', gap: 5}} width={itemHolderWidth}>
          
            {/* Title */}
            <View style={{width: BTN_W, alignItems: 'flex-start',}}>
              <SkyboundText variant='primaryBold' accessabilityLabel='Welcome back to Skybound' size={20}>Welcome Back</SkyboundText>
              <SkyboundText variant='secondary' accessabilityLabel='Please sign into your account'>Please Sign In to your account</SkyboundText>
            </View>

            {/* Email (Ethan component) */}
           
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

            {/* Password (Ethan component) */}
            
            <SkyboundLabelledTextBox
              label="Password"
              placeholderText="Enter your password"
              width={BTN_W}
              height={45}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Login button (Ethan component, styled black) */}
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
                Log In
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

            {/* Sign up link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              <Text style={{ color: '#6B7280', fontFamily: 'Poppins_400Regular' }}>
                Don’t have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={{ color: '#0071E2', fontFamily: 'Poppins_600SemiBold' }}>
                  Sign up
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

            <SkyboundButton
            onPress={()=> navigation.navigate("ComponentTest")}
            style={basicStyles.skyboundButtonPrimaryLight}
            width={100}
            height={50}
            >Component Test</SkyboundButton>

          </View>
          
          </ScrollView>
      </LinearGradient>
        

   
    </KeyboardAvoidingView>

    
  );
}