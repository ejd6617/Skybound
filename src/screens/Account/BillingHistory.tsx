import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';

interface Transaction {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: 'Paid' | 'Refunded' | 'Failed';
}

const mockHistory: Transaction[] = [
  {
    id: '1',
    date: 'Oct 19, 2024',
    plan: 'SkyboundPRO Monthly',
    amount: '$2.99',
    status: 'Paid',
  },
  {
    id: '2',
    date: 'Sep 19, 2024',
    plan: 'SkyboundPRO Monthly',
    amount: '$2.99',
    status: 'Paid',
  },
  {
    id: '3',
    date: 'Aug 19, 2024',
    plan: 'SkyboundPRO Monthly',
    amount: '$2.99',
    status: 'Refunded',
  },
];

const statusColors = {
  Paid: '#22C55E',
  Refunded: '#FBBF24',
  Failed: '#F87171',
};

const BillingHistory: React.FC = () => {
  const colors = useColors();
  const hasHistory = mockHistory.length > 0;

  const renderTransaction = (transaction: Transaction) => (
    <SkyboundCard key={transaction.id}>
      <View style={styles.rowBetween}>
        <View>
          <SkyboundText variant="primaryBold" size={16} accessabilityLabel={`Transaction date ${transaction.date}`}>
            {transaction.date}
          </SkyboundText>
          <SkyboundText variant="secondary" size={13} accessabilityLabel={`Plan ${transaction.plan}`}>
            {transaction.plan}
          </SkyboundText>
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${statusColors[transaction.status]}1A` }]}> 
          <SkyboundText
            variant="primary"
            size={12}
            style={{ color: statusColors[transaction.status] }}
            accessabilityLabel={`Status ${transaction.status}`}
          >
            {transaction.status}
          </SkyboundText>
        </View>
      </View>
      <View style={[styles.rowBetween, { marginTop: 16 }]}> 
        <SkyboundText variant="primary" size={18} accessabilityLabel={`Amount ${transaction.amount}`}>
          {transaction.amount}
        </SkyboundText>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Receipt coming soon', 'Receipts will download in a future release.')}
          style={({ pressed }) => [styles.receiptButton, pressed && { opacity: 0.7 }]}
        >
          <SkyboundText variant="blue" size={14} accessabilityLabel="View receipt">
            View receipt
          </SkyboundText>
          <Ionicons name="arrow-forward" size={16} color={colors.link} />
        </Pressable>
      </View>
    </SkyboundCard>
  );

  return (
    <SkyboundScreen
      title="Billing History"
      subtitle="View your past Skybound charges and invoices."
      showLogo
    >
      {hasHistory ? (
        mockHistory.map(renderTransaction)
      ) : (
        <SkyboundCard muted elevate={false} style={styles.emptyCard}>
          <Ionicons name="receipt-outline" size={48} color={colors.link} />
          <SkyboundText variant="primaryBold" size={18} style={styles.emptyTitle} accessabilityLabel="No billing history">
            No billing history yet
          </SkyboundText>
          <SkyboundText variant="secondary" size={14} style={styles.emptyCopy} accessabilityLabel="Empty state copy">
            Start a subscription to see your payments here.
          </SkyboundText>
        </SkyboundCard>
      )}
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 12,
  },
  emptyCopy: {
    textAlign: 'center',
    marginTop: 6,
  },
});

export default BillingHistory;
