import { useColors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@src/nav/RootNavigator";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import SkyboundText from "@components/ui/SkyboundText";
import { auth, db } from "@src/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ManageSubscription() {
  const colors = useColors();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePaymentMethod, setActivePaymentMethod] = useState<any | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    async function loadUser() {
      if (!user) return;

      const ref = doc(db, "Users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserData(snap.data());
      }

      setLoading(false);
    }

    loadUser();

    async function loadActiveMethod() {
    if (!user || !userData?.billing?.paymentMethodId) return;

    try {
      const ref = doc(
        db,
        "Users",
        user.uid,
        "payments",
        userData.billing.paymentMethodId
      );
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setActivePaymentMethod({ id: snap.id, ...snap.data() });
      }
    } catch (err) {
      console.error("Failed to load active payment method:", err);
    }
  }

  loadActiveMethod();
  }, [userData]);

  if (loading) return null;

  const subscriptionTier = userData?.subscriptionTier ?? "free";
  const billing = userData?.billing ?? {};

  const lastPayment = billing.lastPaymentDate || "N/A";
  const nextBilling = billing.nextBillingDate || "N/A";

  const isPro = subscriptionTier.toLowerCase() === "pro";

  const cancelSubscription = async () => {
    if (!user) return;

    const ref = doc(db, "Users", user.uid);

    await updateDoc(ref, {
      subscriptionTier: "free",
      billing: {
        lastPaymentDate: null,
        nextBillingDate: null,
      },
    });

    navigation.goBack();
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

          {/* Header */}
          <SkyboundText
            variant="primaryBold"
            size={24}
            accessabilityLabel="Subscription management title"
            style={{ marginBottom: 20 }}
          >
            Manage Subscription
          </SkyboundText>

          {/* Subscription Status Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>

            <SkyboundText
              variant="primaryBold"
              size={18}
              accessabilityLabel="Current subscription tier"
            >
              Current Plan
            </SkyboundText>

            <SkyboundText
              variant="primary"
              size={16}
              accessabilityLabel={`Subscription tier is ${subscriptionTier}`}
              style={{ marginTop: 6 }}
            >
              {isPro ? "SkyboundPro" : "Skybound Free"}
            </SkyboundText>

            {isPro && (
              <>
                {/* Billing Section */}
                <View style={styles.billingSection}>
                  <View style={styles.billingRow}>
                    <SkyboundText
                      variant="secondary"
                      size={14}
                      accessabilityLabel="Last payment date label"
                    >
                      Last Payment
                    </SkyboundText>
                    <SkyboundText
                      variant="primary"
                      size={14}
                      accessabilityLabel={`Last payment date is ${lastPayment}`}
                    >
                      {lastPayment}
                    </SkyboundText>
                  </View>

                  <View style={styles.billingRow}>
                    <SkyboundText
                      variant="secondary"
                      size={14}
                      accessabilityLabel="Next billing date label"
                    >
                      Next Billing
                    </SkyboundText>
                    <SkyboundText
                      variant="primary"
                      size={14}
                      accessabilityLabel={`Next billing date is ${nextBilling}`}
                    >
                      {nextBilling}
                    </SkyboundText>
                  </View>

                  {activePaymentMethod && (
                  <View style={{ marginBottom: 20 }}>
                    <SkyboundText
                      variant="primary"
                      size={15}
                      accessabilityLabel="Active payment method title"
                      style={{ marginBottom: 6 }}
                    >
                      Active Payment Method
                    </SkyboundText>

                    <SkyboundText
                      variant="primary"
                      size={14}
                      accessabilityLabel="Card holder name"
                    >
                      {"Card Holder Name: " + activePaymentMethod.cardholderName}
                    </SkyboundText>

                    <SkyboundText
                      variant="primary"
                      size={14}
                      accessabilityLabel="Card ending in digits"
                      style={{ marginTop: 4 }}
                    >
                     {"Last 4 digits: " + activePaymentMethod.lastFourDigits}
                    </SkyboundText>
                  </View>
                )}
                </View>

                {/* Payment Method Summary */}
                <Pressable
                  onPress={() =>
                    navigation.navigate("ChoosePaymentMethod")
                  }
                  style={({ pressed }) => [
                    styles.paymentMethodBox,
                    {
                      backgroundColor: colors.background,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <SkyboundText
                    variant="primary"
                    size={15}
                    accessabilityLabel="Change payment method button"
                  >
                    Change Payment Method
                  </SkyboundText>

                  <Ionicons
                    name="chevron-forward"
                    color={colors.icon}
                    size={20}
                  />
                </Pressable>

                {/* Cancel Subscription */}
                <Pressable
                  onPress={cancelSubscription}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <SkyboundText
                    variant="primaryButton"
                    size={16}
                    accessabilityLabel="Cancel subscription"
                    style={{ color: "white" }}
                  >
                    Cancel Subscription
                  </SkyboundText>
                </Pressable>
              </>
            )}

            {!isPro && (
              <Pressable
                onPress={() => navigation.navigate("ChoosePaymentMethod")}
                style={({ pressed }) => [
                  styles.upgradeButton,
                  { backgroundColor: colors.link, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <SkyboundText
                  variant="primaryButton"
                  size={16}
                  accessabilityLabel="Upgrade to SkyboundPro"
                  style={{ color: "white" }}
                >
                  Upgrade to SkyboundPro
                </SkyboundText>
              </Pressable>
            )}
          </View>

          {/* Return Button */}
          <Pressable
            onPress={() => navigation.navigate("Account")}
            style={({ pressed }) => [
              styles.returnButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <SkyboundText
              variant="primaryButton"
              size={16}
              accessabilityLabel="Return to account page"
              style={{ color: "white" }}
            >
              Return to Account
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
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  billingSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentMethodBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upgradeButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },
  returnButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#6B7280",
  },
});
