import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';

const FAQS = [
  {
    question: 'How do I change or cancel a flight?',
    answer: 'Open the Trips tab, select your trip, and choose “Change or cancel flight”. Most changes can be done directly in Skybound. If you booked Basic fares, contact support and we will outline the airline rules.',
  },
  {
    question: 'Where can I find my booking confirmation?',
    answer: 'Booking confirmations live inside the Flight Info screen and in the email we send after payment. Tap “Flight Information” from Trips to copy your reference code.',
  },
  {
    question: 'What baggage allowance is included?',
    answer: 'Allowance depends on the airline and fare. When you pick a flight, we show what is included. If no bags are included you can add them at checkout or later via “Manage trip”.',
  },
  {
    question: 'How do refunds work?',
    answer: 'Refunds follow airline policies. Flexible fares can often be refunded to your original payment, while most value fares become future credits. We help you submit requests and track status.',
  },
  {
    question: 'Why was my payment declined?',
    answer: 'Check that your bank allows online travel purchases and that the billing ZIP in Payment Details matches your card. If it keeps failing, reach out so we can place a manual hold.',
  },
];

const FAQscreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(FAQS[0].question);

  const filtered = useMemo(
    () =>
      FAQS.filter((faq) =>
        faq.question.toLowerCase().includes(query.toLowerCase().trim())
      ),
    [query]
  );

  const handleToggle = (question: string) => {
    setExpanded((prev) => (prev === question ? null : question));
  };

  return (
    <SkyboundScreen showLogo>
      <SkyboundCard>
        <View style={[styles.searchBar, { borderColor: colors.outline }]}> 
          <Ionicons name="search" size={18} color={colors.icon} />
          <TextInput
            placeholder="Search FAQs"
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={colors.subText}
            style={styles.searchInput}
          />
        </View>
      </SkyboundCard>

      {filtered.length === 0 ? (
        <SkyboundCard style={styles.emptyCard}>
          <Ionicons name="chatbox-ellipses-outline" size={48} color={colors.link} />
          <SkyboundText variant="primaryBold" size={18} style={{ marginTop: 12 }} accessabilityLabel="No FAQ results">
            Can’t find what you’re looking for?
          </SkyboundText>
          <SkyboundText variant="secondary" size={14} style={styles.emptyCopy} accessabilityLabel="Empty FAQ copy">
            Try contacting us for more help.
          </SkyboundText>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Contact')}
            style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
          >
            <SkyboundText variant="primaryButton" size={15} accessabilityLabel="Contact us button">
              Contact Us
            </SkyboundText>
          </Pressable>
        </SkyboundCard>
      ) : (
        filtered.map((faq) => {
          const isOpen = expanded === faq.question;
          return (
            <SkyboundCard key={faq.question}>
              <Pressable
                accessibilityRole="button"
                onPress={() => handleToggle(faq.question)}
                style={styles.faqHeader}
              >
                <SkyboundText variant="primaryBold" size={15} accessabilityLabel={`Question ${faq.question}`}>
                  {faq.question}
                </SkyboundText>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.icon}
                />
              </Pressable>
              {isOpen && (
                <SkyboundText variant="secondary" size={14} style={styles.answer} accessabilityLabel="Answer copy">
                  {faq.answer}
                </SkyboundText>
              )}
            </SkyboundCard>
          );
        })
      )}
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  answer: {
    marginTop: 10,
    lineHeight: 20,
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyCopy: {
    marginTop: 8,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#2F97FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default FAQscreen;
