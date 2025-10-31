import SkyboundNavBar from '@components/ui/SkyboundNavBar';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = colors.background !== '#FFFFFF';
  const insets = useSafeAreaInsets();

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', marginTop: -25,
      }}
      edges={['top']}
    >
      <LinearGradient
        colors={colors.gradient}
        start={colors.gradientStart}
        end={colors.gradientEnd}
        style={{ flex: 1 }}
      >
        <SkyboundNavBar
          title="Account"
          leftHandIcon={<Ionicons name="menu" size={30} color={colors.link} />}
          leftHandIconOnPressEvent={() => {}}
          rightHandFirstIcon={<Ionicons name="notifications-outline" size={28} color={colors.link} />}
          rightHandFirstIconOnPressEvent={() => {}}
          rightHandSecondIcon={<Ionicons name="person-circle-outline" size={30} color={colors.link} />}
          rightHandSecondIconOnPressEvent={() => {}}
        />

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
                  Damien Guy
                </SkyboundText>
                <SkyboundText variant="primary" size={12} accessabilityLabel="User email" style={{ marginTop: 4 }}>
                  {'damienguy@gmail.com'}
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

            {/* Subscription Card */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.subscriptionHeader}>
                <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Subscription">
                  Subscription
                </SkyboundText>
                {/* Active badge in green, could change later */}
                <View style={[styles.activeBadge, { backgroundColor: '#DCFCE7' }]}>
                  <SkyboundText variant="primary" size={12} accessabilityLabel="Active" style={{ color: '#15803D' }}>
                    Active
                  </SkyboundText>
                </View>
              </View>

              <View style={styles.subscriptionDetails}>
                <SkyboundText variant="primary" size={16} accessabilityLabel="Skybound Monthly">
                  Skybound Monthly
                </SkyboundText>
                <SkyboundText variant="secondary" size={14} accessabilityLabel="Price" style={{ marginTop: 4 }}>
                  $2.99/month
                </SkyboundText>
              </View>

              <View style={styles.billingInfo}>
                <View style={styles.billingRow}>
                  <SkyboundText variant="secondary" size={14} accessabilityLabel="Next billing label">
                    Next billing
                  </SkyboundText>
                  <SkyboundText variant="primary" size={14} accessabilityLabel="Next billing date">
                    Sep 19, 2025
                  </SkyboundText>
                </View>
                <View style={styles.billingRow}>
                  <SkyboundText variant="secondary" size={14} accessabilityLabel="Last payment label">
                    Last payment
                  </SkyboundText>
                  <SkyboundText variant="primary" size={14} accessabilityLabel="Last payment date">
                    Oct 19, 2024
                  </SkyboundText>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => {}}
                style={({ pressed }) => [
                  styles.manageButton,
                  { backgroundColor: colors.link },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <SkyboundText variant="primaryButton" size={16} accessabilityLabel="Manage Subscription">
                  Manage Subscription
                </SkyboundText>
              </Pressable>

              <View style={styles.secondaryButtons}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {}}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { backgroundColor: isDark ? '#262626' : '#F3F4F6' },
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <SkyboundText variant="primary" size={12} accessabilityLabel="Billing History" style={{ color: isDark ? colors.text : '#374151' }}>
                    Billing History
                  </SkyboundText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {}}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { backgroundColor: isDark ? '#262626' : '#F3F4F6' },
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <SkyboundText variant="primary" size={12} accessabilityLabel="Payment Details" style={{ color: isDark ? colors.text : '#374151' }}>
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
                onPress={() => {}}
              />
              <SettingsItem
                icon={<Ionicons name="card-outline" size={20} color={colors.link} />}
                title="Payment Methods"
                subtitle="Manage cards & payments"
                onPress={() => {}}
              />
              <SettingsItem
                icon={<Ionicons name="briefcase-outline" size={20} color={colors.link} />}
                title="Your Trips"
                subtitle="Past & upcoming trips"
                onPress={() => {}}
              />
              <SettingsItem
                icon={<Ionicons name="airplane-outline" size={20} color={colors.link} />}
                title="Airport Preferences"
                subtitle="Preferred airports"
                onPress={() => {}}
              />
              <SettingsItem
                icon={<Ionicons name="globe-outline" size={20} color={colors.link} />}
                title="Language"
                subtitle="English"
                onPress={() => {}}
              />
              <SettingsItem
                icon={<Ionicons name="cash-outline" size={20} color={colors.link} />}
                title="Currency"
                subtitle="USD ($)"
                onPress={() => {}}
              />
              {/* Get Help WITHOUT divider underneath */}
              <SettingsItem
                icon={<Ionicons name="help-circle-outline" size={20} color={colors.link} />}
                title="Get Help"
                subtitle="Support & FAQ"
                onPress={() => {}}
                hideDivider
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Login')}
              style={({ pressed }) => [
                styles.signOutButton,
                {
                  backgroundColor: colors.card,
                  borderColor: isDark ? 'transparent' : '#FECACA',
                },
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
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
    </SafeAreaView>
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