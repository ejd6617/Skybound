import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';

const FREE_FEATURES = ['Access to flight search', 'Occasional deals on your dashboard'];
const PRO_FEATURES = [
  'Personalized deals based on airport preferences',
  'Instant notifications when we spot a deal',
  'Access to Multi-City and Flexible Dates tools',
  'Priority support when trips change',
];

const priceByCycle = {
  monthly: '$2.99 / month',
  yearly: '$29.99 / year',
};

type BillingCycle = 'monthly' | 'yearly';

type Plan = 'FREE' | 'PRO';

const ManageSubscription: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentPlan, setCurrentPlan] = useState<Plan>('PRO');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const renewalDate = useMemo(() => 'Nov 18, 2025', []);
  const paymentMethodSummary = useMemo(() => 'Visa ending in ··42', []);

  const handleUpgrade = () => {
    setCurrentPlan('PRO');
    Alert.alert('SkyboundPRO unlocked', 'Enjoy personalized deal alerts and premium tools.');
  };

  const handleDowngrade = () => {
    setCurrentPlan('FREE');
    Alert.alert('Switched to SkyboundFREE', 'You can upgrade again anytime.');
  };

  const renderFeature = (feature: string, index: number) => (
    <View key={feature} style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={18} color={colors.link} />
      <SkyboundText variant="primary" size={14} accessabilityLabel={`Feature ${index + 1}: ${feature}`}>
        {feature}
      </SkyboundText>
    </View>
  );

  const renderPlanCard = (plan: Plan) => {
    const isPro = plan === 'PRO';
    const isCurrent = currentPlan === plan;

    return (
      <SkyboundCard
        key={plan}
        style={[
          styles.planCard,
          isPro && { borderColor: colors.link, borderWidth: 1 },
        ]}
      >
        <View style={styles.planHeader}>
          <SkyboundText variant="primaryBold" size={18} accessabilityLabel={`${plan} plan title`}>
            {plan === 'PRO' ? 'SkyboundPRO' : 'SkyboundFREE'}
          </SkyboundText>
          <View style={[styles.badge, { backgroundColor: isPro ? 'rgba(47,151,255,0.12)' : 'rgba(15,23,42,0.08)' }]}>
            <SkyboundText variant="primary" size={12} accessabilityLabel={`${plan} badge`}>
              {isCurrent ? 'Current Plan' : isPro ? 'PRO' : 'Included'}
            </SkyboundText>
          </View>
        </View>

        <SkyboundText variant="secondary" size={13} style={styles.planSubtitle} accessabilityLabel={`${plan} description`}>
          {isPro
            ? 'Best for frequent travelers who want real-time deal intel.'
            : 'Perfect for casual flyers exploring destinations.'}
        </SkyboundText>

        {isPro ? (
          <View>
            <View style={styles.toggleContainer}>
              {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                <Pressable
                  key={cycle}
                  onPress={() => setBillingCycle(cycle)}
                  style={[styles.toggleButton, billingCycle === cycle && { backgroundColor: colors.link }]}
                >
                  <SkyboundText
                    variant={billingCycle === cycle ? 'primaryButton' : 'secondary'}
                    size={13}
                    accessabilityLabel={`${cycle} billing option`}
                  >
                    {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                  </SkyboundText>
                  {cycle === 'yearly' && (
                    <View style={styles.saveBadge}>
                      <SkyboundText variant="forceWhite" size={10} accessabilityLabel="Save twenty percent">
                        Save 20%
                      </SkyboundText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            <SkyboundText variant="primaryBold" size={22} style={styles.priceText} accessabilityLabel="Pro price">
              {priceByCycle[billingCycle]}
            </SkyboundText>
          </View>
        ) : (
          <SkyboundText variant="primaryBold" size={22} style={styles.priceText} accessabilityLabel="Free price">
            $0 forever
          </SkyboundText>
        )}

        <View style={styles.featureList}>
          {(isPro ? PRO_FEATURES : FREE_FEATURES).map(renderFeature)}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={isPro ? handleUpgrade : handleDowngrade}
          style={({ pressed }) => [
            styles.planActionButton,
            { backgroundColor: isPro ? colors.link : 'transparent', borderColor: colors.link },
            pressed && { opacity: 0.8 },
          ]}
        >
          <SkyboundText
            variant={isPro ? 'primaryButton' : 'blue'}
            size={14}
            accessabilityLabel={`${isPro ? 'Upgrade' : 'Switch'} button`}
          >
            {isPro ? 'Upgrade to SkyboundPRO' : 'Switch to SkyboundFREE'}
          </SkyboundText>
        </Pressable>
      </SkyboundCard>
    );
  };

  return (
    <SkyboundScreen
      title="Manage Subscription"
      subtitle="Choose the plan that fits the way you travel."
      showLogo
    >
      {currentPlan === 'PRO' && (
        <SkyboundCard>
          <SkyboundText variant="primaryBold" size={20} accessabilityLabel="Current plan summary">
            You’re on SkyboundPRO
          </SkyboundText>
          <SkyboundText variant="secondary" size={13} style={styles.summarySubtitle} accessabilityLabel="Renewal info subtitle">
            Renewal date · {renewalDate}
          </SkyboundText>

          <View style={styles.summaryRow}>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Billing period label">
              Billing period
            </SkyboundText>
            <SkyboundText variant="primary" size={14} accessabilityLabel="Billing period value">
              {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </SkyboundText>
          </View>

          <View style={styles.summaryRow}>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Payment method label">
              Payment method
            </SkyboundText>
            <SkyboundText variant="primary" size={14} accessabilityLabel="Payment method value">
              {paymentMethodSummary}
            </SkyboundText>
          </View>

          <View style={styles.summaryActions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setBillingCycle((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'))}
            >
              <SkyboundText variant="primary" size={14} accessabilityLabel="Change plan">
                Change Plan
              </SkyboundText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.7 }]}
              onPress={() => navigation.navigate('BillingHistory')}
            >
              <SkyboundText variant="primary" size={14} accessabilityLabel="Manage billing">
                Manage Billing
              </SkyboundText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.destructiveBtn, pressed && { opacity: 0.8 }]}
              onPress={() => setShowCancelModal(true)}
            >
              <SkyboundText variant="primary" size={14} style={{ color: '#DC2626' }} accessabilityLabel="Cancel subscription">
                Cancel Subscription
              </SkyboundText>
            </Pressable>
          </View>
        </SkyboundCard>
      )}

      <View style={styles.planGrid}>{(['FREE', 'PRO'] as Plan[]).map(renderPlanCard)}</View>

      {currentPlan === 'FREE' && (
        <SkyboundCard>
          <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Free plan upgrade title">
            Unlock more with SkyboundPRO
          </SkyboundText>
          <SkyboundText variant="secondary" size={14} style={{ marginBottom: 12 }} accessabilityLabel="Free plan upgrade copy">
            Personalized airport alerts help members save an average of $187 per trip.
          </SkyboundText>
          <Pressable
            accessibilityRole="button"
            onPress={handleUpgrade}
            style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
          >
            <SkyboundText variant="primaryButton" size={16} accessabilityLabel="Upgrade now button">
              Upgrade to SkyboundPRO
            </SkyboundText>
          </Pressable>
        </SkyboundCard>
      )}

      <SkyboundCard>
        <View style={styles.sectionHeader}>
          <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Billing section title">
            Billing & Invoices
          </SkyboundText>
          <Ionicons name="file-tray-full-outline" size={20} color={colors.link} />
        </View>
        <SkyboundText variant="secondary" size={13} style={styles.sectionSubtitle} accessabilityLabel="Billing section subtitle">
          Download receipts or resend invoices for your records.
        </SkyboundText>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('BillingHistory')}
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
        >
          <SkyboundText variant="blue" size={14} accessabilityLabel="Go to billing history">
            View billing history
          </SkyboundText>
          <Ionicons name="chevron-forward" size={18} color={colors.link} />
        </Pressable>
      </SkyboundCard>

      <SkyboundCard>
        <View style={styles.sectionHeader}>
          <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Payment method section title">
            Payment Method
          </SkyboundText>
          <Ionicons name="card-outline" size={20} color={colors.link} />
        </View>
        <SkyboundText variant="secondary" size={13} style={styles.sectionSubtitle} accessabilityLabel="Payment section subtitle">
          Update the card that keeps your membership active.
        </SkyboundText>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('PaymentDetails')}
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
        >
          <SkyboundText variant="blue" size={14} accessabilityLabel="Go to payment details">
            Manage payment method
          </SkyboundText>
          <Ionicons name="chevron-forward" size={18} color={colors.link} />
        </Pressable>
      </SkyboundCard>

      <SkyboundCard muted elevate={false}>
        <SkyboundText variant="secondary" size={13} style={{ lineHeight: 20 }} accessabilityLabel="Policy info">
          Plans renew automatically. Cancel anytime to keep access through the end of your billing period. Refunds are only issued for billing errors per our policy.
        </SkyboundText>
      </SkyboundCard>

      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}> 
            <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Cancel subscription modal title">
              Cancel SkyboundPRO?
            </SkyboundText>
            <SkyboundText variant="secondary" size={13} style={{ marginVertical: 12 }} accessabilityLabel="Cancel modal message">
              You’ll keep PRO benefits until {renewalDate}. After that, you’ll lose priority alerts and flexible search tools.
            </SkyboundText>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                handleDowngrade();
                setShowCancelModal(false);
              }}
              style={({ pressed }) => [styles.destructiveFilled, pressed && { opacity: 0.85 }]}
            >
              <SkyboundText variant="primaryButton" size={15} accessabilityLabel="Confirm cancel">
                Confirm & Downgrade
              </SkyboundText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowCancelModal(false)}
              style={({ pressed }) => [styles.modalSecondary, pressed && { opacity: 0.8 }]}
            >
              <SkyboundText variant="primary" size={15} accessabilityLabel="Keep subscription">
                Keep SkyboundPRO
              </SkyboundText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  planGrid: {
    width: '100%',
  },
  planCard: {
    borderRadius: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  planSubtitle: {
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 8,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  priceText: {
    marginBottom: 16,
  },
  featureList: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  planActionButton: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  summarySubtitle: {
    marginTop: 4,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  secondaryBtn: {
    flexGrow: 1,
    minWidth: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  destructiveBtn: {
    flexBasis: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 10,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionSubtitle: {
    marginTop: 8,
    marginBottom: 14,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#2F97FF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
  },
  destructiveFilled: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalSecondary: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
});

export default ManageSubscription;
