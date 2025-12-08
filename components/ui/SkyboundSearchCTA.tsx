import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SkyboundItemHolder from './SkyboundItemHolder';
import SkyboundText from './SkyboundText';
import { useColors } from '@/constants/theme';

interface SkyboundSearchCtaProps {
  onPress: () => void;
  title: string;
  subtitle?: string;
}

const SkyboundSearchCta: React.FC<SkyboundSearchCtaProps> = ({ onPress, title, subtitle }) => {
  const colors = useColors();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }] }>
      <SkyboundItemHolder style={[styles.container, { backgroundColor: colors.surface, shadowColor: colors.link }]}>
        <View style={styles.row}>
          <Ionicons name="search" size={24} color={colors.link} />
          <View style={{ flex: 1 }}>
            <SkyboundText variant="primaryBold" size={16} style={{ color: colors.link, textAlign: 'center' }}>
              {title}
            </SkyboundText>
            {subtitle ? (
              <SkyboundText variant="secondary" size={13} style={{ textAlign: 'center' }}>
                {subtitle}
              </SkyboundText>
            ) : null}
          </View>
        </View>
      </SkyboundItemHolder>
    </Pressable>
  );
};

export default SkyboundSearchCta;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
