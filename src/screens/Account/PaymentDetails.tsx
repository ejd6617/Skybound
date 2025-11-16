import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';

interface PaymentMethod {
  brand: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  expiry: string;
  cardholder: string;
  billingZip: string;
}

const PaymentDetails: React.FC = () => {
  const colors = useColors();
  const [method, setMethod] = useState<PaymentMethod | null>({
    brand: 'Visa',
    last4: '4242',
    expiry: '08/27',
    cardholder: 'Ariana Traveler',
    billingZip: '10001',
  });

  const renderEmptyState = () => (
    <SkyboundCard style={styles.emptyCard}>
      <Ionicons name="card-outline" size={48} color={colors.link} />
      <SkyboundText variant="primaryBold" size={20} style={styles.emptyTitle} accessabilityLabel="No payment method title">
        No payment method yet
      </SkyboundText>
      <SkyboundText variant="secondary" size={14} style={styles.emptyCopy} accessabilityLabel="No payment method description">
        Add a card to start your SkyboundPRO subscription and keep renewals seamless.
      </SkyboundText>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          setMethod({ brand: 'Visa', last4: '0555', expiry: '05/28', cardholder: 'Ariana Traveler', billingZip: '94107' })
        }
        style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
      >
        <SkyboundText variant="primaryButton" size={15} accessabilityLabel="Add payment method">
          Add payment method
        </SkyboundText>
      </Pressable>
    </SkyboundCard>
  );

  const renderMethod = () => (
    <>
      <LinearGradient colors={['#1C7DD2', '#4AA3FF']} style={styles.cardVisual}>
        <View style={styles.rowBetween}>
          <SkyboundText variant="forceWhite" size={16} accessabilityLabel="Card brand">
            {method?.brand}
          </SkyboundText>
          <Ionicons name="wifi" size={24} color="#FFFFFF" />
        </View>
        <SkyboundText variant="forceWhite" size={24} style={styles.cardNumber} accessabilityLabel="Masked card number">
          •••• •••• •••• {method?.last4}
        </SkyboundText>
        <View style={styles.rowBetween}>
          <View>
            <SkyboundText variant="forceWhite" size={12} style={styles.cardLabel} accessabilityLabel="Cardholder label">
              Cardholder
            </SkyboundText>
            <SkyboundText variant="forceWhite" size={16} accessabilityLabel="Cardholder name">
              {method?.cardholder}
            </SkyboundText>
          </View>
          <View>
            <SkyboundText variant="forceWhite" size={12} style={styles.cardLabel} accessabilityLabel="Expiry label">
              Expiry
            </SkyboundText>
            <SkyboundText variant="forceWhite" size={16} accessabilityLabel="Expiry date">
              {method?.expiry}
            </SkyboundText>
          </View>
        </View>
      </LinearGradient>

      <SkyboundCard>
        <View style={styles.infoRow}>
          <SkyboundText variant="secondary" size={13} accessabilityLabel="Cardholder field label">
            Cardholder name
          </SkyboundText>
          <SkyboundText variant="primary" size={15} accessabilityLabel="Cardholder field value">
            {method?.cardholder}
          </SkyboundText>
        </View>
        <View style={styles.infoRow}>
          <SkyboundText variant="secondary" size={13} accessabilityLabel="Billing zip field label">
            Billing ZIP
          </SkyboundText>
          <SkyboundText variant="primary" size={15} accessabilityLabel="Billing zip field value">
            {method?.billingZip}
          </SkyboundText>
        </View>
        <SkyboundText variant="secondary" size={12} style={styles.helperCopy} accessabilityLabel="Helper copy">
          Your card is used for SkyboundPRO renewals. You can change it anytime.
        </SkyboundText>
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMethod({ ...(method as PaymentMethod), last4: '8891', expiry: '12/28' })}
            style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
          >
            <SkyboundText variant="primaryButton" size={15} accessabilityLabel="Change card">
              Change Card
            </SkyboundText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]}
          >
            <SkyboundText variant="primary" size={15} accessabilityLabel="Edit billing info">
              Edit Billing Info
            </SkyboundText>
          </Pressable>
        </View>
      </SkyboundCard>
    </>
  );

  return (
    <SkyboundScreen title="Payment Details" subtitle="Manage the card connected to your subscription." showLogo>
      {method ? renderMethod() : renderEmptyState()}
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  cardVisual: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    gap: 20,
  },
  cardNumber: {
    letterSpacing: 2,
  },
  cardLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  helperCopy: {
    marginTop: 4,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2F97FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 12,
  },
  emptyCopy: {
    textAlign: 'center',
    marginVertical: 12,
  },
});

export default PaymentDetails;
