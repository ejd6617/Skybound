import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import { LinearGradient } from "expo-linear-gradient";

import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import SkyboundText from "@components/ui/SkyboundText";
import { auth, db } from "@src/firebase";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

export default function ChoosePaymentMethod() {
  const colors = useColors();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  // ---- Fetch User Payment Methods ----
  useEffect(() => {
    async function loadPayments() {
      if (!user) return;

      try {
        const ref = collection(db, "Users", user.uid, "payments");
        const snap = await getDocs(ref);

        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPaymentMethods(data);
      } catch (e) {
        console.error("Error loading payment methods:", e);
      }

      setLoading(false);
    }

    loadPayments();
  }, []);

  // ---- Select Payment Method & Activate Subscription ----
  const choosePaymentMethod = async (methodId: string) => {
    if (!user) return;

    const userRef = doc(db, "Users", user.uid);

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    await updateDoc(userRef, {
      subscriptionTier: "pro",
      billing: {
        paymentMethodId: methodId,
        lastPaymentDate: today.toISOString().split("T")[0],
        nextBillingDate: nextMonth.toISOString().split("T")[0],
      },
    });

    navigation.navigate("ManageSubscription");
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={colors.gradient}
        start={colors.gradientStart}
        end={colors.gradientEnd}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <SkyboundText
            variant="primaryBold"
            size={24}
            accessabilityLabel="Choose payment method title"
            style={{ marginBottom: 20 }}
          >
            Choose Payment Method
          </SkyboundText>

          {loading && (
            <ActivityIndicator size="large" color={colors.link} />
          )}

          {!loading && paymentMethods.length === 0 && (
            <SkyboundText
              variant="secondary"
              size={14}
              accessabilityLabel="No saved payment methods"
              style={{ marginTop: 20 }}
            >
              You don’t have any saved payment methods. Add one in Payment
              Details.
            </SkyboundText>
          )}

          {/* ---- List of payment methods ---- */}
          {!loading && paymentMethods.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => choosePaymentMethod(m.id)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={styles.row}>
                <Ionicons
                  name="card-outline"
                  size={26}
                  color={colors.link}
                />

                <View style={{ marginLeft: 12 }}>
                  <SkyboundText
                    variant="primary"
                    size={16}
                    accessabilityLabel={`Payment method ending in ${m.lastFourDigits}`}
                  >
                    {m.cardholderName}
                  </SkyboundText>

                  <SkyboundText
                    variant="secondary"
                    size={13}
                    accessabilityLabel={`Card ending with ${m.lastFourDigits}`}
                  >
                    •••• {m.lastFourDigits}
                  </SkyboundText>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.icon}
              />
            </Pressable>
          ))}

          {/* Return button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.returnButton,
              { opacity: pressed ? 0.9 : 1, backgroundColor: "#6B7280" },
            ]}
          >
            <SkyboundText
              variant="primary"
              size={16}
              accessabilityLabel="Return to manage subscription"
              style={{ color: "white" }}
            >
              Back
            </SkyboundText>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    // Shadows
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  returnButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
