import { auth } from '@/src/firebase';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../LoadingScreen';
const db = getFirestore();

interface PaymentMethod {
  id: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
  lastFourDigits: string;
  expirationDate: string;
  cardholderName: string;
  isPrimary: boolean;
}

interface PaymentFormData {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
}

export default function PaymentMethodScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = colors.background !== '#FFFFFF';
  const insets = useSafeAreaInsets();
  //error text
  const [modalErrorText, setModalErrorText] = useState("");
  const [cardNumberErrorText, setCardNumberErrorText] = useState("")
  const [expirationErrorText, setExpirationErrorText] = useState("")
  const [cvvErrorText, setCvvErrorText] = useState("")

  const [isLoading, setIsLoading] = useState(false);

  // Sample payment methods data
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
  });

  const handleAddPaymentMethod = () => {
    setEditingId(null);
    setFormData({
      cardNumber: '',
      expirationDate: '',
      cvv: '',
      cardholderName: '',
      billingAddress: '',
    });
    setShowModal(true);
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setEditingId(paymentMethod.id);
    setFormData({
      cardNumber: `****${paymentMethod.lastFourDigits}`,
      expirationDate: paymentMethod.expirationDate,
      cvv: '',
      cardholderName: paymentMethod.cardholderName,
      billingAddress: '',
    });
    setShowModal(true);
  };

  const handleDeletePaymentMethod = async (id: string) => {
  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;

  await deleteDoc(doc(db, "Users", uid, "payments", id));

  setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
};

  const handleSavePaymentMethod = async () => {
    
    console.log("Hello!");


    setIsLoading(true);

    if(formData.cardNumber === '' || formData.billingAddress === '' || formData.cardholderName === '' || formData.cvv === '' || formData.expirationDate === '')
    {
      setModalErrorText("Fields cannot be left blank.");
      setIsLoading(false);
      return;
    }

    let foundError = false;

    //perform error checking on various fields
    if(!checkCardNumberFormat(formData.cardNumber)){
      foundError = true;
      setCardNumberErrorText("Card number must be 16 consecutive digits.");
    }

    if(!checkCardExpiryFormat(formData.expirationDate)){
      foundError = true;
      setExpirationErrorText("Expiration Date must be in MM/YY format.");
    }

    if(!checkCVVFormat(formData.cvv)){
      foundError = true;
      setCvvErrorText("CVV must be 3 consecutive digits.")
    }

    //if an error has been detected 
    if(foundError)
    {
      setIsLoading(false);
      return;
    }
    console.log("No errors found in payment details. attempting to send to firestore. ");

    //if no error found, add the new card to the database
    //collect user
    if(!auth.currentUser)
    {
      setModalErrorText("There was an error adding your payment details. Check your connection and try again later.");
      setIsLoading(false);
      return;
    }
    
    const uid = auth.currentUser.uid;
    console.log("user collected. ");

    const docRef = doc(db, "Users", uid, "payments", Date.now().toString());
    console.log("Doc Ref collected. attempting set doc...");

    try {
      // Generate a unique ID for this card
      const paymentId = Date.now().toString();

      const docRef = doc(db, "Users", uid, "payments", paymentId);

      await setDoc(docRef, {
        ...formData,
        lastFourDigits: formData.cardNumber.slice(-4),
        createdAt: new Date(),
      });

      console.log("Payment method saved!");

      // Update local state so UI reflects the new card
      setPaymentMethods((prev) => [
        ...prev,
        {
          id: paymentId,
          cardType: detectCardType(formData.cardNumber), 
          lastFourDigits: formData.cardNumber.slice(-4),
          expirationDate: formData.expirationDate,
          cardholderName: formData.cardholderName,
          isPrimary: prev.length === 0, // first card is primary
        },
      ]);

      setShowModal(false);
  } catch (error) {
      console.error("Error saving payment method:", error);
      setModalErrorText("Failed to save payment method.");
  } finally {
      setIsLoading(false);
  };
};

//helper function to detect card type
function detectCardType(number: string): PaymentMethod["cardType"] {
  if (/^4/.test(number)) return "visa";
  if (/^5[1-5]/.test(number)) return "mastercard";
  if (/^3[47]/.test(number)) return "amex";
  if (/^6/.test(number)) return "discover";
  return "visa";
}

//use effect to populate the screen whenever it is mounted
useEffect(() => {
  async function loadPaymentMethods() {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;
    const colRef = collection(db, "Users", uid, "payments");

    const snapshot = await getDocs(colRef);

    const loaded = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        cardType: data.cardType ?? "visa",
        lastFourDigits: data.lastFourDigits,
        expirationDate: data.expirationDate,
        cardholderName: data.cardholderName,
        isPrimary: data.isPrimary ?? false,
      } as PaymentMethod;
    });

    // Sort so primary card shows first
    loaded.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

    setPaymentMethods(loaded);
  }

  loadPaymentMethods();
}, []);



  const handleSetAsPrimary = async (id: string) => {
  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;

  // 1. Update Firestore: set selected card to primary
  const selectedRef = doc(db, "Users", uid, "payments", id);
  await updateDoc(selectedRef, { isPrimary: true });

  // 2. Unset primary on all other cards
  const colRef = collection(db, "Users", uid, "payments");
  const snapshot = await getDocs(colRef);

  const batchUpdates = snapshot.docs.map(async (docSnap) => {
    if (docSnap.id !== id) {
      await updateDoc(docSnap.ref, { isPrimary: false });
    }
  });

  await Promise.all(batchUpdates);

  // 3. Update local UI state
  setPaymentMethods((prev) =>
    prev.map((pm) => ({
      ...pm,
      isPrimary: pm.id === id,
    }))
  );
};

  //helper functions for saving new payment details
  const checkCardNumberFormat = (number: string) => {
    const cardNumberRegex = /^\d{16}$/;
    if(cardNumberRegex.test(number))
    {
      setCardNumberErrorText("");
      return true;
    }
    else
    {
      return false
    }
  }

  const checkCVVFormat = (cvv: string) => {
    const cvvRegex = /^\d{3}$/;
    if(cvvRegex.test(cvv))
    {
      setCvvErrorText("");
      return true;
    }
    else
    {
      return false
    }

  }

  const checkCardExpiryFormat = (date: string) => {
      const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
      if(expiryRegex.test(date))
      {
        setExpirationErrorText("");
        return true;
      }
      else
      {
        return false;
      }

  }
  const getCardIcon = (cardType: string) => {
    switch (cardType) {
      case 'visa':
        return 'card-outline';
      case 'mastercard':
        return 'card-outline';
      case 'amex':
        return 'card-outline';
      default:
        return 'card-outline';
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: !isLoading, 
    });
  }, [navigation, isLoading]);


  //displays loading screen
    if (isLoading) {
      return <LoadingScreen />;
    }
  

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        marginTop: -25,
      }}
    >
      <LinearGradient
        colors={colors.gradient}
        start={colors.gradientStart}
        end={colors.gradientEnd}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'transparent', marginTop: 10 }}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
            contentInsetAdjustmentBehavior="automatic"
          >
            {/* Header Section */}
            <View style={{ marginBottom: 24 }}>
              <SkyboundText
                variant="primaryBold"
                size={24}
                accessabilityLabel="Payment Methods Title"
              >
                Payment Methods
              </SkyboundText>
              <SkyboundText
                variant="secondary"
                size={14}
                accessabilityLabel="Payment Methods Subtitle"
                style={{ marginTop: 6, color: colors.icon }}
              >
                Manage your saved cards & payment options.
              </SkyboundText>
            </View>

            {/* Add Payment Method Button */}
            <Pressable
              onPress={handleAddPaymentMethod}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: colors.link, opacity: pressed ? 0.8 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Add Payment Method"
            >
              <Ionicons name="add" size={20} color="white" />
              <SkyboundText
                variant="primaryButton"
                size={14}
                accessabilityLabel="Add Payment Method Button Text"
                style={{ color: 'white', marginLeft: 8 }}
              >
                Add Payment Method
              </SkyboundText>
            </Pressable>

            {/* Payment Methods List or Empty State */}
            {paymentMethods?.length === 0 || paymentMethods === undefined ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="card-outline"
                    size={64}
                    color={colors.icon}
                  />
                </View>
                <SkyboundText
                  variant="primaryBold"
                  size={18}
                  accessabilityLabel="No payment methods"
                  style={{ textAlign: 'center', marginTop: 12 }}
                >
                  No saved payment methods yet.
                </SkyboundText>
                <SkyboundText
                  variant="secondary"
                  size={14}
                  accessabilityLabel="Add your first payment method"
                  style={{
                    textAlign: 'center',
                    marginTop: 8,
                    color: colors.icon,
                  }}
                >
                  Add your first payment method to get started.
                </SkyboundText>
                <Pressable
                  onPress={handleAddPaymentMethod}
                  style={({ pressed }) => [
                    styles.emptyActionButton,
                    {
                      backgroundColor: colors.link,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Add Payment Method from Empty State"
                >
                  <SkyboundText
                    variant="primaryButton"
                    size={14}
                    accessabilityLabel="Add Payment Method Button"
                    style={{ color: 'white' }}
                  >
                    Add Payment Method
                  </SkyboundText>
                </Pressable>
              </View>
            ) : (
              <View>
                {paymentMethods?.map((method) => (
                  <View
                    key={method.id}
                    style={[
                      styles.paymentCard,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardInfo}>
                        <View style={styles.cardIconContainer}>
                          <Ionicons
                            name={getCardIcon(method.cardType)}
                            size={28}
                            color={colors.link}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <SkyboundText
                            variant="primaryBold"
                            size={14}
                            accessabilityLabel={`${method.cardType} ending in`}
                          >
                            {method.cardType.toUpperCase()}{' '}
                            <SkyboundText
                              variant="primary"
                              size={14}
                              accessabilityLabel="last four digits"
                            >
                              •••• {method.lastFourDigits}
                            </SkyboundText>
                          </SkyboundText>
                          <SkyboundText
                            variant="secondary"
                            size={12}
                            accessabilityLabel="cardholder name"
                            style={{ marginTop: 4, color: colors.icon }}
                          >
                            {method.cardholderName}
                          </SkyboundText>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => handleEditPaymentMethod(method)}
                        style={({ pressed }) => [
                          styles.editButton,
                          { opacity: pressed ? 0.6 : 1 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit payment method ending in ${method.lastFourDigits}`}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color={colors.link}
                        />
                      </Pressable>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardFooter}>
                      <View style={{ flex: 1 }}>
                        <SkyboundText
                          variant="secondary"
                          size={12}
                          accessabilityLabel="Expiration"
                          style={{ color: colors.icon }}
                        >
                          Expires {method.expirationDate}
                        </SkyboundText>
                      </View>
                      {method.isPrimary && (
                        <View style={styles.primaryBadge}>
                          <SkyboundText
                            variant="primary"
                            size={12}
                            accessabilityLabel="Primary"
                            style={{ color: colors.link }}
                          >
                            Primary
                          </SkyboundText>
                        </View>
                      )}
                    </View>

                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => handleSetAsPrimary(method.id)}
                        style={({ pressed }) => [
                          styles.actionButton,
                          {
                            backgroundColor: isDark
                              ? '#262626'
                              : '#F3F4F6',
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Set as primary for card ending in ${method.lastFourDigits}`}
                      >
                        <SkyboundText
                          variant="primary"
                          size={12}
                          accessabilityLabel="Set as Primary"
                          style={{
                            color: isDark
                              ? colors.text
                              : '#374151',
                          }}
                        >
                          {method.isPrimary
                            ? 'Primary'
                            : 'Set as Primary'}
                        </SkyboundText>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeletePaymentMethod(method.id)}
                        style={({ pressed }) => [
                          styles.actionButton,
                          {
                            backgroundColor: isDark
                              ? '#262626'
                              : '#F3F4F6',
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete payment method ending in ${method.lastFourDigits}`}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        <SkyboundText
                          variant="primary"
                          size={12}
                          accessabilityLabel="Delete"
                          style={{
                            color: '#DC2626',
                            marginLeft: 4,
                          }}
                        >
                          Delete
                        </SkyboundText>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}

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

            {/* Skybound Logo at bottom */}
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

      {/* Payment Method Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          }}
        >
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <LinearGradient
              colors={colors.gradient}
              start={colors.gradientStart}
              end={colors.gradientEnd}
              style={{ flex: 1 }}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.modalHeader}>
                  <Pressable
                    onPress={() => setShowModal(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                  >
                    <Ionicons
                      name="close"
                      size={28}
                      color={colors.link}
                    />
                  </Pressable>
                  <SkyboundText
                    variant="primaryBold"
                    size={18}
                    accessabilityLabel={
                      editingId
                        ? 'Edit Payment Method'
                        : 'Add Payment Method'
                    }
                  >
                    {editingId ? 'Edit' : 'Add'} Payment Method
                  </SkyboundText>
                  <View style={{ width: 28 }} />
                </View>

                <ScrollView
                  contentContainerStyle={styles.modalContent}
                  contentInsetAdjustmentBehavior="automatic"
                >
                  <View
                    style={[
                      styles.formCard,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <View style={styles.formGroup}>
                      <SkyboundText
                        variant="primary"
                        size={14}
                        accessabilityLabel="Card Number Label"
                        style={{
                          marginBottom: 8,
                          fontWeight: '600',
                        }}
                      >
                        Card Number
                      </SkyboundText>
                      <TextInput
                        placeholder="0000000000000000"
                        placeholderTextColor={colors.icon}
                        value={formData.cardNumber}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            cardNumber: text,
                          })
                        }
                        maxLength={16}
                        editable={!editingId}
                        style={[
                          styles.textInput,
                          {
                            color: colors.text,
                            borderColor: colors.outline,
                            backgroundColor: isDark
                              ? '#262626'
                              : '#F9FAFB',
                          },
                        ]}
                        keyboardType="numeric"
                        accessibilityLabel="Card Number Input"
                      />
                      <SkyboundText variant='error' accessabilityLabel='Card Number Error'>{cardNumberErrorText}</SkyboundText>
                      
                    </View>

                    <View style={styles.twoColumnRow}>
                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <SkyboundText
                          variant="primary"
                          size={14}
                          accessabilityLabel="Expiration Date Label"
                          style={{
                            marginBottom: 8,
                            fontWeight: '600',
                          }}
                        >
                          Expiration
                        </SkyboundText>
                        <TextInput
                          placeholder="MM/YY"
                          placeholderTextColor={colors.icon}
                          value={formData.expirationDate}
                          onChangeText={(text) =>
                            setFormData({
                              ...formData,
                              expirationDate: text,
                            })
                          }
                          maxLength={5}
                          style={[
                            styles.textInput,
                            {
                              color: colors.text,
                              borderColor: colors.outline,
                              backgroundColor: isDark
                                ? '#262626'
                                : '#F9FAFB',
                            },
                          ]}
                          keyboardType="numbers-and-punctuation"
                          accessibilityLabel="Expiration Date Input"
                        />
                        <SkyboundText variant='error' accessabilityLabel='Expiration Date Error'>{expirationErrorText}</SkyboundText>
                      </View>

                      <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                        <SkyboundText
                          variant="primary"
                          size={14}
                          accessabilityLabel="CVV Label"
                          style={{
                            marginBottom: 8,
                            fontWeight: '600',
                          }}
                        >
                          CVV
                        </SkyboundText>
                        <TextInput
                          placeholder="000"
                          placeholderTextColor={colors.icon}
                          value={formData.cvv}
                          onChangeText={(text) =>
                            setFormData({
                              ...formData,
                              cvv: text,
                            })
                          }
                          maxLength={3}
                          style={[
                            styles.textInput,
                            {
                              color: colors.text,
                              borderColor: colors.outline,
                              backgroundColor: isDark
                                ? '#262626'
                                : '#F9FAFB',
                            },
                          ]}
                          keyboardType="numeric"
                          secureTextEntry
                          accessibilityLabel="CVV Input"
                        />
                      
                      <SkyboundText variant='error' accessabilityLabel='CVV error text'>{cvvErrorText}</SkyboundText>
                      </View>

                    </View>

                    <View style={styles.formGroup}>
                      <SkyboundText
                        variant="primary"
                        size={14}
                        accessabilityLabel="Cardholder Name Label"
                        style={{
                          marginBottom: 8,
                          fontWeight: '600',
                        }}
                      >
                        Cardholder Name
                      </SkyboundText>
                      <TextInput
                        placeholder="John Doe"
                        placeholderTextColor={colors.icon}
                        value={formData.cardholderName}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            cardholderName: text,
                          })
                        }
                        maxLength={100}
                        style={[
                          styles.textInput,
                          {
                            color: colors.text,
                            borderColor: colors.outline,
                            backgroundColor: isDark
                              ? '#262626'
                              : '#F9FAFB',
                          },
                        ]}
                        accessibilityLabel="Cardholder Name Input"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <SkyboundText
                        variant="primary"
                        size={14}
                        accessabilityLabel="Billing Address Label"
                        style={{
                          marginBottom: 8,
                          fontWeight: '600',
                        }}
                      >
                        Billing Address
                      </SkyboundText>
                      <TextInput
                        placeholder="123 Main St, City, State 12345"
                        placeholderTextColor={colors.icon}
                        value={formData.billingAddress}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            billingAddress: text,
                          })
                        }
                        maxLength={100}
                        style={[
                          styles.textInput,
                          {
                            color: colors.text,
                            borderColor: colors.outline,
                            backgroundColor: isDark
                              ? '#262626'
                              : '#F9FAFB',
                          },
                          { minHeight: 80 },
                        ]}
                        multiline
                        numberOfLines={3}
                        accessibilityLabel="Billing Address Input"
                      />

                      <SkyboundText variant='error' accessabilityLabel='Error text'>{modalErrorText}</SkyboundText>
                    </View>
                  </View>
                </ScrollView>

                <View
                  style={[
                    styles.modalFooter,
                    {
                      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => setShowModal(false)}
                    style={({ pressed }) => [
                      styles.cancelButton,
                      {
                        backgroundColor: isDark
                          ? '#262626'
                          : '#F3F4F6',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                  >
                    <SkyboundText
                      variant="primary"
                      size={14}
                      accessabilityLabel="Cancel"
                      style={{
                        color: isDark ? colors.text : '#374151',
                      }}
                    >
                      Cancel
                    </SkyboundText>
                  </Pressable>
                  <Pressable
                    onPress={ async () => await handleSavePaymentMethod() }
                    style={({ pressed }) => [
                      styles.saveButton,
                      {
                        backgroundColor: colors.link,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Save Payment Method"
                  >
                    <SkyboundText
                      variant="primaryButton"
                      size={14}
                      accessabilityLabel="Save"
                      style={{ color: 'white' }}
                    >
                      Save
                    </SkyboundText>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 151, 255, 0.10)',
    marginRight: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(47, 151, 255, 0.10)',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 151, 255, 0.10)',
  },
  emptyActionButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  billingHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 0,
  },
  logo: {
    width: 160,
    height: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
  },
  modalContent: {
    padding: 16,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  returnButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
