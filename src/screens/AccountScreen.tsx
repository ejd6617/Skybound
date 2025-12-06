import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';

//Components and navigator imports
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//firebase imports
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';

import { doc, onSnapshot } from 'firebase/firestore';
import LoadingScreen from './LoadingScreen';

//Stripe imports

export default  function AccountScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = colors.background !== '#FFFFFF';
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  //load the user data through auth
 const [userData, setUserData] = useState<any>(null);
const [loadingUser, setLoadingUser] = useState(true);

useEffect(() => {
  if (!user) return;

  const ref = doc(db, "Users", user.uid);

  const unsubscribe = onSnapshot(ref, (snapshot) => {
    const data = snapshot.data();
    console.log(
      "🔥 ACCOUNT SCREEN USERDATA (LIVE):",
      JSON.stringify(data, null, 2)
    );
    setUserData(data || null);
    setLoadingUser(false);
  });

  return unsubscribe;
}, [user]);

  const [isLoading, setIsLoading] = useState(false);

  // const functionsInstance = getFunctions();
  // const createPortalLink = httpsCallable(functionsInstance, 'ext-firestore-stripe-subscriptions-createPortalLink');
  
  // const startSubscription = async () => {
  //   const checkoutSessionsRef = collection(db, 'Users', user.uid, 'checkout_sessions');

  //   const docRef = await addDoc(checkoutSessionsRef, {
  //     price: 'price_1GqIC8HYgolSBA35zoTTN2Zl',
  //     success_url: window.location.origin,
  //     cancel_url: window.location.origin,
  //   });

  //   onSnapshot(docRef, (snap) => {
  //     const data = snap.data();
  //     if (!data) return;
  //     const { error, url } = data;

  //     if (error) {
  //       alert(`An error occurred: ${error.message}`);
  //     }

  //     if (url) {
  //       window.location.assign(url);
  //     }
  //   });
  // };

  // const manageSubscription = async () => {};

  const pressableStyle = ({ pressed }: { pressed: boolean }) => [
    { opacity: pressed ? 0.7 : 1 },
  ];

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    hideDivider = false,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress?: () => void;
    hideDivider?: boolean;
  }) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress ?? (() => {})}
      style={({ pressed }) => [
        styles.settingsItem,
        { borderBottomColor: colors.divider, borderBottomWidth: hideDivider ? 0 : StyleSheet.hairlineWidth },
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: 'rgba(47, 151, 255, 0.10)' }]}>
        {icon}
      </View>
      <View style={styles.settingsTextContainer}>
        <SkyboundText variant="primary" size={16} accessabilityLabel={title}>
          {title}
        </SkyboundText>
        <SkyboundText variant="secondary" size={12} accessabilityLabel={subtitle}>
          {subtitle}
        </SkyboundText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.icon} />
    </Pressable>
  );

  if (isLoading) {
        return <LoadingScreen />;
      }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      }}
    >
      <LinearGradient
        colors={colors.gradient}
        start={colors.gradientStart}
        end={colors.gradientEnd}
        style={{ flex: 1 }}
      >
        <View
          style={{ flex: 1, backgroundColor: 'transparent', marginTop: 10 }}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
            contentInsetAdjustmentBehavior= "automatic"
            >
            {/* User Info Card */}
            <View style={[styles.card, styles.userCard, { backgroundColor: colors.card }]}>
              <View style={styles.userPhotoContainer}>
                <Ionicons name="person-circle-outline" size={100} color={isDark ? colors.text : colors.link} />
                {/* Pencil overlay: with 85% gray opacity background */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {}}
                  style={({ pressed }) => [
                    styles.editPhotoButton,
                    { backgroundColor: 'rgba(128,128,128,0.85)', opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Ionicons name="pencil" size={14} color='white' />
                </Pressable>
              </View>

              <View style={styles.userInfoText}>
                <SkyboundText variant="primaryBold" size={20} accessabilityLabel="User name">
                  {user.displayName}
                </SkyboundText>
                <SkyboundText variant="primary" size={12} accessabilityLabel="User email" style={{ marginTop: 4 }}>
                  {user.email}
                </SkyboundText>
                <Pressable onPress={() => {}} style={pressableStyle}>
                  <SkyboundText
                    variant="blue"
                    size={12}
                    accessabilityLabel="Update Info"
                    style={{ marginTop: 8, fontSize: 12, color: colors.link }}
                  >
                    Update Info
                  </SkyboundText>
                </Pressable>
              </View>
            </View>

           <View style={[styles.card, { backgroundColor: colors.card }]}>

                          {/* Header */}
            <View style={styles.subscriptionHeader}>
              <SkyboundText
                variant="primaryBold"
                accessabilityLabel="Subscription section title"
                size={18}
              >
                Subscription
              </SkyboundText>

              {/* Active / Inactive Badge */}
              <View
                style={[
                  styles.activeBadge,
                  {
                    backgroundColor:
                      userData?.subscriptionTier === "pro" ? "#DCFCE7" : "#FEE2E2",
                  },
                ]}
              >
                <SkyboundText
                  variant="primaryBold"
                  accessabilityLabel={
                    userData?.subscriptionTier === "pro"
                      ? "Subscription status: Active"
                      : "Subscription status: Inactive"
                  }
                  size={12}
                  style={{
                    color:
                      userData?.subscriptionTier === "pro" ? "#15803D" : "#B91C1C",
                  }}
                >
                  {userData?.subscriptionTier === "pro" ? "Active" : "Inactive"}
                </SkyboundText>
              </View>
            </View>

            {/* Chosen Plan */}
            <View style={styles.subscriptionDetails}>
              <SkyboundText
                variant="primary"
                size={16}
                accessabilityLabel={`Current subscription plan: ${
                  userData?.subscriptionTier === "pro" ? "Skybound Pro" : "Free Plan"
                }`}
              >
                {userData?.subscriptionTier === "pro" ? "Skybound Pro" : "Free Plan"}
              </SkyboundText>

              <SkyboundText
                variant="primary"
                size={14}
                style={{ marginTop: 4 }}
                accessabilityLabel={`Subscription price: ${
                  userData?.subscriptionTier === "pro" ? "$2.99 / month" : "$0"
                }`}
              >
                {userData?.subscriptionTier === "pro" ? "$2.99 / month" : "$0"}
              </SkyboundText>
            </View>

             {/* Billing Info (Only for paying users) */}
            {userData?.subscriptionTier !== "free" && (
              <View style={styles.billingInfo}>
                <View style={styles.billingRow}>
                  <SkyboundText
                    variant="primary"
                    size={14}
                    accessabilityLabel="Next billing label"
                  >
                    Next billing
                  </SkyboundText>

                  <SkyboundText
                    variant="primary"
                    size={14}
                    accessabilityLabel={`Next billing date: ${
                      userData?.nextRenewal || "Unavailable"
                    }`}
                  >
                    {userData?.nextRenewal || "Unavailable"}
                  </SkyboundText>
                </View>

                <View style={styles.billingRow}>
                  <SkyboundText
                    variant="primary"
                    size={14}
                    accessabilityLabel="Last payment label"
                  >
                    Last payment
                  </SkyboundText>

                  <SkyboundText
                    variant="primary"
                    size={14}
                    accessabilityLabel={`Last payment date: ${
                      userData?.lastPayment || "Unavailable"
                    }`}
                  >
                    {userData?.lastPayment || "Unavailable"}
                  </SkyboundText>
                </View>
              </View>
            )}

            {/* Manage Subscription */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Manage Subscription button"
              onPress={() => navigation.navigate("ManageSubscription")}
              style={({ pressed }) => [
                styles.manageButton,
                { backgroundColor: colors.link },
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <SkyboundText
                variant="primary"
                accessabilityLabel="Manage Subscription"
                size={16}
              >
                Manage Subscription
              </SkyboundText>
            </Pressable>

            {/* Secondary buttons */}
            <View style={styles.secondaryButtons}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Navigate to Billing History"
                onPress={() => navigation.navigate("BillingHistory")}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { backgroundColor: isDark ? "#262626" : "#F3F4F6" },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <SkyboundText
                  variant="primary"
                  accessabilityLabel="Billing History"
                  size={12}
                  style={{ color: isDark ? colors.text : "#374151" }}
                >
                  Billing History
                </SkyboundText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Navigate to Payment Details"
                onPress={() => navigation.navigate("PaymentDetails")}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { backgroundColor: isDark ? "#262626" : "#F3F4F6" },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <SkyboundText
                  variant="primary"
                  accessabilityLabel="Payment Details"
                  size={12}
                  style={{ color: isDark ? colors.text : "#374151" }}
                >
                  Payment Details
                </SkyboundText>
              </Pressable>
            </View>
            </View>
            {/* Settings & Preferences Card */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Settings & Preferences" style={{ marginBottom: 12 }}>
                Settings & Preferences
              </SkyboundText>

              <SettingsItem
                icon={<Ionicons name="id-card-outline" size={20} color={colors.link} />}
                title="Traveler Details"
                subtitle="Add and manage traveler profiles"
                onPress={() => navigation.navigate('TravelerDetails')}
              />
              <SettingsItem
                icon={<Ionicons name="card-outline" size={20} color={colors.link} />}
                title="Payment Methods"
                subtitle="Manage cards & payments"
                onPress={() => navigation.navigate('PaymentMethod')}
              />
              <SettingsItem
                icon={<Ionicons name="briefcase-outline" size={20} color={colors.link} />}
                title="Your Trips"
                subtitle="Past & upcoming trips"
                onPress={() => navigation.navigate('Trips')}
              />
              <SettingsItem
                icon={<Ionicons name="airplane-outline" size={20} color={colors.link} />}
                title="Airport Preferences"
                subtitle="Preferred airports"
                onPress={() => navigation.navigate('AirportPreference')}
              />
              <SettingsItem
                icon={<Ionicons name="globe-outline" size={20} color={colors.link} />}
                title="Language"
                subtitle="English"
                onPress={() => navigation.navigate('Language')}
              />
              <SettingsItem
                icon={<Ionicons name="cash-outline" size={20} color={colors.link} />}
                title="Currency"
                subtitle="USD ($)"
                onPress={() => navigation.navigate('Currency')}
              />
              {/* Get Help WITHOUT divider underneath */}
              <SettingsItem
                icon={<Ionicons name="help-circle-outline" size={20} color={colors.link} />}
                title="Get Help"
                subtitle="Support & FAQ"
                onPress={() => navigation.navigate('GetHelp')}
                hideDivider
              />
            </View>

            <Pressable
              accessibilityRole="button"
               onPress={async () => {
                setIsLoading(true);
                try {
                  await signOut(auth);
                  console.log('User Signed out successfully!');
                  navigation.navigate('Login');
                }
                catch(error : any)
                {
                  console.error('Error Signing out: ' + error.message);
                }
                setIsLoading(false);
              }}
              style={({ pressed }) => [
                styles.signOutButton,
                {
                  backgroundColor: colors.card,
                  borderColor: isDark ? 'transparent' : '#FECACA',
                },
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" 
              />
              <SkyboundText
                variant="primary"
                size={16}
                accessabilityLabel="Sign Out"
                style={{ color: '#DC2626', marginLeft: 8 }}

              >
                Sign Out
              </SkyboundText>
            </Pressable>

            {/* Skybound logo at the bottom (like Version 1) */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@assets/images/skybound-logo-white.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 24,
  },
  userPhotoContainer: {
    position: 'relative',
    marginRight: 20,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 3,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoText: { flex: 1, paddingTop: 8 },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionDetails: { marginBottom: 16 },
  billingInfo: { marginBottom: 20 },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  manageButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtons: { flexDirection: 'row', gap: 12 },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsTextContainer: { flex: 1 },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 0,
  },
  logo: { width: 160, height: 40 },
});