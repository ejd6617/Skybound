// screens/SignupScreen.tsx
import React, { useState } from "react";
import { Alert, Dimensions, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import SkyboundButton from "../../components/ui/SkyboundButton";
import SkyboundLabelledTextBox from "../../components/ui/SkyboundLabelledTextBox";
import SkyboundText from "../../components/ui/SkyboundText";
import { register } from "../api/auth";

type Nav = NativeStackNavigationProp<any>;
const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
const H_PADDING = 18;
const BTN_W = CARD_W - H_PADDING * 2;
const COLORS = { primary:"#0071E2", primaryLight:"#2F97FF", black:"#000", white:"#FFF", divider:"rgba(0,0,0,0.15)" };

export default function SignupScreen() 
{
  const nav = useNavigation<Nav>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwHidden, setPwHidden] = useState(true);
  const [pw2Hidden, setPw2Hidden] = useState(true);

  async function handleSignup() 
  {
    try 
    {
      if (!name || !email || !pw || !pw2) 
        return Alert.alert("Missing info", "Please fill all fields.");
      if (pw !== pw2) 
        return Alert.alert("Password mismatch", "Passwords must match.");

      await register(name.trim(), email.trim(), pw);
      nav.replace("Dashboard");
    } catch (e:any) {
      Alert.alert("Signup failed", e?.response?.data?.error ?? e.message);
    }
  }

  return (
    <LinearGradient colors={[COLORS.primaryLight, COLORS.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
          <View style={[styles.card, { width: CARD_W, paddingHorizontal: H_PADDING }]}>
            <Image source={require("../../assets/images/skybound-logo-white.png")} resizeMode="contain" style={styles.logo} />
            <SkyboundText variant="primaryBold" size={20} style={{ color: COLORS.black, marginTop: 6 }}>Create Account</SkyboundText>
            <SkyboundText variant="secondary" size={12} style={{ marginBottom: 10 }}>Join Skybound to track and save on flights</SkyboundText>

            <SkyboundLabelledTextBox label="Full Name" placeholderText="Enter your name" width={BTN_W} height={48} value={name} onChangeText={setName} />
            <SkyboundLabelledTextBox label="Email" placeholderText="Enter your email" width={BTN_W} height={48} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

            <View style={{ marginTop: 12 }}>
              <SkyboundLabelledTextBox label="Password" placeholderText="Create a password" width={BTN_W} height={48} value={pw} onChangeText={setPw} secureTextEntry={pwHidden} />
              <Pressable onPress={() => setPwHidden(v => !v)} hitSlop={8} style={styles.eyeBtn}><Ionicons name={pwHidden ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(0,0,0,0.55)" /></Pressable>
            </View>

            <View style={{ marginTop: 12 }}>
              <SkyboundLabelledTextBox label="Confirm Password" placeholderText="Re-enter password" width={BTN_W} height={48} value={pw2} onChangeText={setPw2} secureTextEntry={pw2Hidden} />
              <Pressable onPress={() => setPw2Hidden(v => !v)} hitSlop={8} style={styles.eyeBtn}><Ionicons name={pw2Hidden ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(0,0,0,0.55)" /></Pressable>
            </View>

            <SkyboundButton onPress={handleSignup} width={BTN_W} height={48} style={styles.blackBtn} textVariant="primaryButton">Create account</SkyboundButton>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <SkyboundText variant="secondary" size={12} style={{ marginHorizontal: 10 }}>or</SkyboundText>
              <View style={styles.divider} />
            </View>

            <Pressable style={[styles.googleBtn, { width: BTN_W }]}>
              <Image source={require("../../assets/images/google.png")} style={{ width: 18, height: 18, marginRight: 8 }} resizeMode="contain" />
              <SkyboundText variant="primaryBold" size={13}>Continue with Google</SkyboundText>
            </Pressable>

            <View style={styles.bottomRow}>
              <SkyboundText variant="secondary" size={12}>Already have an account? </SkyboundText>
              <Pressable onPress={() => nav.navigate("Login")}><SkyboundText variant="blue" size={12}>Log in</SkyboundText></Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: 24, 
    paddingVertical: 18, 
    shadowColor: "#000", 
    shadowOpacity: 0.18, 
    shadowRadius: 16, 
    shadowOffset: { width: 0, height: 8 }, 
    elevation: 6 
  },
  logo: { 
    width: 180, 
    height: 56, 
    alignSelf: "center", 
    marginBottom: 8 
  },
  eyeBtn: { 
    position: "absolute", 
    right: 12, 
    top: 38, 
    padding: 4 
  },
  blackBtn: { 
    marginTop: 12, 
    backgroundColor: COLORS.black, 
    borderRadius: 12, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  dividerRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginVertical: 14 
  },
  divider: { 
    flex: 1, 
    height: StyleSheet.hairlineWidth, 
    backgroundColor: COLORS.divider 
  },
  googleBtn: { 
    borderWidth: 1, 
    borderColor: "rgba(0,0,0,0.12)", 
    backgroundColor: COLORS.white, 
    borderRadius: 12, 
    paddingVertical: 10, 
    alignItems: "center", 
    justifyContent: "center", 
    flexDirection: "row" 
  },
  bottomRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 12 
  },
});