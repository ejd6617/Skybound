import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';

//Components and navigator imports

//firebase imports
import { signOut, updateEmail, updateProfile } from 'firebase/auth';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

import SkyboundButton from '@components/ui/SkyboundButton';
import SkyboundLabelledTextBox from '@components/ui/SkyboundLabelledTextBox';
import BasicComponents from '@constants/BasicComponents';
import { updateUserData } from '@src/firestoreFunctions';
import { doc, onSnapshot } from 'firebase/firestore';
import LoadingScreen from './LoadingScreen';

//Stripe imports

export default  function AccountScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = colors.background !== '#FFFFFF';
  const user = auth.currentUser;
  const rootNavigation = navigation.getParent()?.getParent();
  const scrollRef = useRef<ScrollView | null>(null);

  //load the user data through auth
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
      setProfileName(user?.displayName || data?.Name || data?.fullName || '');
      setProfileEmail(user?.email || data?.Email || '');
      setProfilePhoto(user?.photoURL || data?.photoURL || null);
    });

    return unsubscribe;
  }, [user]);

  const [signOutStatus, setSignOutStatus] = useState<'idle' | 'signing' | 'done'>('idle');

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: signOutStatus === 'idle' && !loadingUser,
    });
  }, [navigation, signOutStatus, loadingUser]);

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const uploadImageAsync = async (uri: string) => {
    if (!user?.uid) throw new Error('Missing user');
    const response = await fetch(uri);
    const blob = await response.blob();
    const photoRef = ref(storage, `users/${user.uid}/profilePhoto.jpg`);
    await uploadBytes(photoRef, blob);
    const downloadUrl = await getDownloadURL(photoRef);
    return downloadUrl;
  };

  const handlePickImage = async (source: 'camera' | 'library') => {
    if (!user) return;
    setUploadingPhoto(true);

    try {
      const permissionResult =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera and photo permissions to update your picture.');
        setUploadingPhoto(false);
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });

      if (result.canceled) {
        setUploadingPhoto(false);
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        setUploadingPhoto(false);
        return;
      }

      const downloadUrl = await uploadImageAsync(asset.uri);

      await updateProfile(user, { displayName: profileName || user.displayName || '', photoURL: downloadUrl });
      await updateUserData(user.uid, { photoURL: downloadUrl });
      setProfilePhoto(downloadUrl);
    } catch (error) {
      console.error('Error updating profile photo', error);
      Alert.alert('Error', 'Unable to update your profile photo right now.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    setUploadingPhoto(true);
    try {
      const photoRef = ref(storage, `users/${user.uid}/profilePhoto.jpg`);
      await deleteObject(photoRef).catch(() => {});
      await updateProfile(user, { photoURL: null });
      await updateUserData(user.uid, { photoURL: null });
      setProfilePhoto(null);
    } catch (error) {
      console.error('Error removing profile photo', error);
      Alert.alert('Error', 'Unable to remove your profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChoosePhoto = () => {
    Alert.alert('Profile photo', 'Update your profile picture', [
      { text: 'Take Photo', onPress: () => handlePickImage('camera') },
      { text: 'Choose from Library', onPress: () => handlePickImage('library') },
      { text: 'Remove Photo', style: 'destructive', onPress: handleRemovePhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!profileName.trim()) {
      Alert.alert('Missing info', 'Please add your full name.');
      return;
    }

    setSavingProfile(true);
    try {
      const updates: Record<string, any> = { Name: profileName.trim() };

      await updateProfile(user, { displayName: profileName.trim(), photoURL: profilePhoto ?? null });

      if (profileEmail.trim() && profileEmail.trim() !== user.email) {
        try {
          await updateEmail(user, profileEmail.trim());
          updates.Email = profileEmail.trim();
        } catch (error) {
          console.error('Email update failed', error);
          Alert.alert('Email not updated', 'We could not update your email without a recent login.');
        }
      }

      await updateUserData(user.uid, updates);
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile', error);
      Alert.alert('Error', 'Unable to update your profile right now.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loadingUser || signOutStatus !== 'idle') {
    const signingOut = signOutStatus !== 'idle';
    return (
      <LoadingScreen
        message={signingOut ? (signOutStatus === 'done' ? 'Signed out successfully' : 'Signing you out...') : 'Loading your account...'}
        status={signOutStatus === 'done' ? 'success' : 'loading'}
      />
    );
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
            ref={scrollRef}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
            contentInsetAdjustmentBehavior= "automatic"
            >
            {/* User Info Card */}
            <View style={[styles.card, styles.userCard, { backgroundColor: colors.card }]}>
              <View style={styles.userPhotoContainer}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.userPhoto} />
                ) : (
                  <Ionicons name="person-circle-outline" size={100} color={isDark ? colors.text : colors.link} />
                )}
                {uploadingPhoto && (
                  <View style={styles.photoLoadingOverlay}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={handleChoosePhoto}
                  style={({ pressed }) => [
                    styles.editPhotoButton,
                    { backgroundColor: 'rgba(128,128,128,0.85)', opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Ionicons name="pencil" size={14} color='white' />
                </Pressable>
                {profilePhoto && (
                  <Pressable accessibilityRole="button" onPress={handleRemovePhoto} style={styles.removePhotoButton}>
                    <SkyboundText variant="secondary" size={11} accessabilityLabel="Remove profile photo" style={{ color: colors.link }}>
                      Remove photo
                    </SkyboundText>
                  </Pressable>
                )}
              </View>

              <View style={styles.userInfoText}>
                <SkyboundText variant="primaryBold" size={20} accessabilityLabel="User name">
                  {profileName || 'User'}
                </SkyboundText>
                <SkyboundText variant="primary" size={14} accessabilityLabel="User email" style={{ marginTop: 2, marginBottom: 2 }}>
                  {profileEmail || ""}
                </SkyboundText>
                <Pressable onPress={() => setEditingProfile(true)} style={pressableStyle}>
                  <SkyboundText
                    variant="blue"
                    size={12}
                    accessabilityLabel="Update Info"
                    style={{ marginTop: 8, fontSize: 14, color: colors.link }}
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
                variant="forceWhite"
                accessabilityLabel="Manage Subscription"
                size={16}
              >
                Manage Subscription
              </SkyboundText>
            </Pressable>

           
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
                if (signOutStatus !== 'idle') return;

                setSignOutStatus('signing');
                try {
                  await signOut(auth);
                  console.log('User Signed out successfully!');
                  setSignOutStatus('done');
                  setTimeout(() => {
                    rootNavigation?.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                    setSignOutStatus('idle');
                  }, 650);
                } catch (error: any) {
                  console.error('Error Signing out: ' + error.message);
                  setSignOutStatus('idle');
                }
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
      <Modal visible={editingProfile} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.editProfileCard, { backgroundColor: colors.card }]}>
            <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Edit profile title">
              Edit profile
            </SkyboundText>
            <SkyboundLabelledTextBox
              label="Full name"
              placeholderText="Full name"
              width={280}
              height={48}
              text={profileName}
              onChange={setProfileName}
            />
            <SkyboundLabelledTextBox
              label="Email"
              placeholderText="Email"
              width={280}
              height={48}
              text={profileEmail}
              onChange={setProfileEmail}
            />

            <SkyboundButton
              height={50}
              width={280}
              onPress={handleSaveProfile}
              diasabled={savingProfile}
              style={BasicComponents.skyboundButtonPrimaryLight}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </SkyboundButton>

            <Pressable
              accessibilityRole="button"
              onPress={() => setEditingProfile(false)}
              style={({ pressed }) => [styles.modalSecondary, pressed && { opacity: 0.85 }]}
            >
              <SkyboundText variant="primary" size={15} accessabilityLabel="Cancel editing" style={{ color: colors.link }}>
                Cancel
              </SkyboundText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  userPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  photoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  removePhotoButton: {
    marginTop: 6,
    alignSelf: 'center',
  },
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
    marginBottom: 10,
  },
  logo: { width: 160, height: 40 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  editProfileCard: {
    width: 320,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 14,
  },
  modalSecondary: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
