import React, { useState } from "react";
import {
  Alert, Image, KeyboardAvoidingView, Platform, Pressable,
  SafeAreaView, StatusBar, StyleSheet, View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { login } from "../api/auth";

// Teammate components
import SkyboundText from "../../components/ui/SkyboundText";
import SkyboundTextBox from "../../components/ui/SkyboundTextBox";
import SkyboundButton from "../../components/ui/SkyboundButton";

type Nav = NativeStackNavigationProp<any>;

const COLORS = { primary:"#0071E2", primaryLight:"#2F97FF", black:"#000", white:"#FFF", divider:"rgba(255,255,255,0.25)" };

export default function LoginScreen() {
  const nav = useNavigation<Nav>();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwHidden, setPwHidden] = useState(true);

  async function handleLogin() {
    try {
      if (!email || !pw) return Alert.alert("Missing info", "Enter your email and password.");
      await login(email.trim(), pw);
      nav.replace("Dashboard");
    } catch (e: any) {
      Alert.alert("Login failed", e?.response?.data?.error ?? e.message);
    }
  }

  return (
    <LinearGradient
      colors={[COLORS.primaryLight, COLORS.primary]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
          <View style={styles.card}>
            <Image source={require("../../assets/images/skybound-logo-white.png")} resizeMode="contain" style={styles.logo} />

            <SkyboundText variant="primaryBold" size={20} style={{ marginTop: 6, color: COLORS.black }}>
              Welcome Back
            </SkyboundText>
            <SkyboundText variant="secondary" size={12} style={{ marginBottom: 10 }}>
              Sign in to your account
            </SkyboundText>

            {/* Email */}
            <SkyboundText variant="primaryBold" size={12} style={styles.fieldLabel}>Email</SkyboundText>
            <View style={styles.textBoxWrap}>
              <SkyboundTextBox
                placeholderText="Enter your email"
                height={44}
                width={undefined}
              />
            </View>

            {/* Password */}
            <SkyboundText variant="primaryBold" size={12} style={[styles.fieldLabel, { marginTop: 12 }]}>Password</SkyboundText>
            <View style={[styles.textBoxWrap, styles.passwordWrap]}>
              <SkyboundTextBox
                placeholderText="Enter your password"
                height={44}
                width={undefined}
                // SkyboundTextBox doesn't expose secure prop; keep the eye to match mock,
                // and bind native state via an overlay TextInput if your BasicComponents supports it.
              />
              <Pressable onPress={() => setPwHidden(v => !v)} hitSlop={8} style={styles.eyeBtn}>
                <Ionicons name={pwHidden ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(0,0,0,0.55)" />
              </Pressable>
            </View>

            {/* Primary */}
            <SkyboundButton width={undefined as any} height={48} onPress={handleLogin} textVariant="primaryButton">
              Log in
            </SkyboundButton>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <SkyboundText variant="secondary" size={12} style={{ marginHorizontal: 10 }}>or</SkyboundText>
              <View style={styles.divider} />
            </View>

            {/* Google */}
            <Pressable style={styles.googleBtn} onPress={() => Alert.alert("Google Sign-In", "Wire to your Google auth flow.")}>
              <Image
                source={require("../../assets/images/google.png")}
                style={{ width: 18, height: 18, marginRight: 8 }}
                resizeMode="contain"
              />
              <SkyboundText variant="primaryBold" size={13}>Continue with Google</SkyboundText>
            </Pressable>

            {/* Bottom link */}
            <View style={styles.bottomRow}>
              <SkyboundText variant="secondary" size={12}>Don’t have an account? </SkyboundText>
              <Pressable onPress={() => nav.navigate("Signup")}>
                <SkyboundText variant="blue" size={12}>Sign up</SkyboundText>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { width: "86%", backgroundColor: COLORS.white, borderRadius: 24, padding: 18, shadowColor: "#000",
    shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  logo: { width: 180, height: 56, alignSelf: "center", marginBottom: 8 },
  fieldLabel: { color: COLORS.black, marginBottom: 6 },
  textBoxWrap: { borderRadius: 12, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.03)", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", marginBottom: 6 },
  passwordWrap: { position: "relative" },
  eyeBtn: { position: "absolute", right: 8, top: 10, paddingHorizontal: 6, paddingVertical: 6 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 14 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(0,0,0,0.15)" },
  googleBtn: { borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", backgroundColor: COLORS.white, borderRadius: 12, paddingVertical: 10, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
});