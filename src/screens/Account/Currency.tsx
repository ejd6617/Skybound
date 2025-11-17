import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';

const currencyOptions = [
  { code: 'USD', label: 'U.S. dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'JPY', label: 'Japanese yen', symbol: '¥' },
  { code: 'GBP', label: 'Pound sterling', symbol: '£' },
  { code: 'CNY', label: 'Renminbi', symbol: '¥ / CN¥' },
  { code: 'CHF', label: 'Swiss franc', symbol: 'CHF' },
  { code: 'AUD', label: 'Australian dollar', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian dollar', symbol: 'C$' },
  { code: 'HKD', label: 'Hong Kong dollar', symbol: 'HK$' },
  { code: 'SGD', label: 'Singapore dollar', symbol: 'S$' },
  { code: 'INR', label: 'Indian rupee', symbol: '₹' },
  { code: 'KRW', label: 'South Korean won', symbol: '₩' },
  { code: 'SEK', label: 'Swedish krona', symbol: 'kr' },
  { code: 'MXN', label: 'Mexican peso', symbol: '$ / MX$' },
  { code: 'NZD', label: 'New Zealand dollar', symbol: 'NZ$' },
];

const CurrencyScreen: React.FC = () => {
  const colors = useColors();
  const [selected, setSelected] = useState('USD');
  const [message, setMessage] = useState<string | null>(null);

  const handleSelect = (code: string) => {
    if (code !== 'USD') {
      setMessage('Only USD is supported right now, but more currencies are coming soon.');
      setSelected('USD');
      return;
    }
    setMessage(null);
    setSelected(code);
  };

  return (
    <SkyboundScreen
      title="Currency"
      subtitle="Choose your preferred currency for flight prices."
      showLogo
    >
      <SkyboundCard>
        {currencyOptions.map((currency) => (
          <Pressable
            key={currency.code}
            accessibilityRole="button"
            onPress={() => handleSelect(currency.code)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            <View>
              <SkyboundText variant="primary" size={15} accessabilityLabel={`${currency.label} row`}>
                {currency.label}
              </SkyboundText>
              <SkyboundText variant="secondary" size={13} accessabilityLabel={`${currency.code} symbol`}>
                {currency.code} · {currency.symbol}
              </SkyboundText>
            </View>
            <Ionicons
              name={selected === currency.code ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={selected === currency.code ? colors.link : colors.icon}
            />
          </Pressable>
        ))}
      </SkyboundCard>

      {message && (
        <SkyboundCard muted elevate={false}>
          <SkyboundText variant="secondary" size={13} accessabilityLabel="Currency info">
            {message}
          </SkyboundText>
        </SkyboundCard>
      )}
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.3)',
  },
});

export default CurrencyScreen;
