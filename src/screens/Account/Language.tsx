import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';

type LanguageOption = 'English' | 'Español';

const LanguageModal: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selected, setSelected] = useState<LanguageOption>('English');
  const [message, setMessage] = useState<string | null>(null);

  const handleSelect = (option: LanguageOption) => {
    if (option === 'Español') {
      setMessage('Spanish is not yet supported, but will be available soon.');
      setSelected('English');
      return;
    }
    setSelected(option);
    navigation.goBack();
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}> 
        <View style={styles.grabber} />
        <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Language title">
          Language
        </SkyboundText>
        {(['English', 'Español'] as LanguageOption[]).map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            onPress={() => handleSelect(option)}
            style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.7 }]}
          >
            <SkyboundText variant="primary" size={16} accessabilityLabel={`${option} option`}>
              {option}
            </SkyboundText>
            <Ionicons
              name={selected === option ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={colors.link}
            />
          </Pressable>
        ))}
        {message && (
          <View style={[styles.messageBanner, { backgroundColor: 'rgba(239,68,68,0.12)' }]}> 
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Spanish warning">
              {message}
            </SkyboundText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 8,
  },
  grabber: {
    width: 64,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.6)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  messageBanner: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
  },
});

export default LanguageModal;
