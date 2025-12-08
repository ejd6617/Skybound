import { useColors } from '@constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import SkyboundText from "@components/ui/SkyboundText";

interface LoadingScreenProps {
  message?: string;
  status?: "loading" | "success";
}

export default function LoadingScreen({ message = "Loading...", status = "loading" }: LoadingScreenProps) {
  const colors = useColors();
  const isDark = colors.background !== '#FFFFFF';

  const styles = getStyles();

  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const Content = (
    <>
      <Image source={require('@assets/images/skybound-logo-white.png')} style={styles.logo} resizeMode="contain" />
      {status === "loading" ? (
        <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinner}>
            <View style={styles.spinnerArc} />
          </View>
        </Animated.View>
      ) : (
        <View style={styles.successContainer}>
          <View style={styles.successBadge}>
            <Ionicons name="checkmark" size={22} color="#0B1725" />
          </View>
        </View>
      )}
      <SkyboundText
        variant="primary"
        size={15}
        style={{ color: '#FFFFFF', marginTop: 16, textAlign: 'center', paddingHorizontal: 20 }}
        accessabilityLabel={message}
      >
        {message}
      </SkyboundText>
    </>
  );

  return (
    <LinearGradient
      colors={isDark ? ['#000000', '#2F97FF'] : ['#2F97FF', '#81beffff']} // 🌑 dark & ☀️ light gradients
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      {Content}
    </LinearGradient>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 274,
      height: 70,
      marginBottom: 27,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    spinnerContainer: { width: 40, height: 40 },
    spinner: {
      width: 40, height: 40, borderRadius: 20, borderWidth: 4,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    spinnerArc: {
      position: 'absolute', top: -4, left: -4, width: 40, height: 40,
      borderRadius: 20, borderWidth: 4, borderColor: 'transparent',
      borderTopColor: '#FFFFFF', borderLeftColor: '#FFFFFF',
    },
    successContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    successBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
  });