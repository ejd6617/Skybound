import SkyboundNavBar from '@components/ui/SkyboundNavBar';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
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

  // Sample payment methods data
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      cardType: 'visa',
      lastFourDigits: '4242',
      expirationDate: '12/26',
      cardholderName: 'John Doe',
      isPrimary: true,
    },
    {
      id: '2',
      cardType: 'mastercard',
      lastFourDigits: '5555',
      expirationDate: '08/25',
      cardholderName: 'John Doe',
      isPrimary: false,
    },
  ]);

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

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
  };

  const handleSavePaymentMethod = () => {
    if (editingId) {
      // Update existing
      setPaymentMethods(
        paymentMethods.map((method) =>
          method.id === editingId
            ? {
                ...method,
                cardholderName: formData.cardholderName,
              }
            : method
        )
      );
    } else {
      // Add new
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        cardType: 'visa',
        lastFourDigits: formData.cardNumber.slice(-4),
        expirationDate: formData.expirationDate,
        cardholderName: formData.cardholderName,
        isPrimary: paymentMethods.length === 0,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
    }
    setShowModal(false);
  };

  const handleSetAsPrimary = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isPrimary: method.id === id,
      }))
    );
  };

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        marginTop: -25,
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
          title="Payment Methods"
          leftHandIcon={<Ionicons name="chevron-back" size={30} color={colors.link} />}
          leftHandIconOnPressEvent={() => navigation.goBack()}
          rightHandFirstIcon={<Ionicons name="notifications-outline" size={28} color={colors.link} />}
          rightHandFirstIconOnPressEvent={() => {}}
          rightHandSecondIcon={<Ionicons name="person-circle-outline" size={30} color={colors.link} />}
          rightHandSecondIconOnPressEvent={() => {}}
        />

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
            {paymentMethods.length === 0 ? (
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
                {paymentMethods.map((method) => (
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

            {/* Billing History Link */}
            {paymentMethods.length > 0 && (
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [
                  styles.billingHistoryButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="View Billing History"
              >
                <SkyboundText
                  variant="blue"
                  size={14}
                  accessabilityLabel="Billing History Link"
                >
                  View Billing History
                </SkyboundText>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.link}
                />
              </Pressable>
            )}

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
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={colors.icon}
                        value={formData.cardNumber}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            cardNumber: text,
                          })
                        }
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
                          accessibilityLabel="Expiration Date Input"
                        />
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
                    onPress={handleSavePaymentMethod}
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
    </SafeAreaView>
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
});
