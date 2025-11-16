import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { useColors } from '@constants/theme';

interface SkyboundCardProps extends ViewProps {
  muted?: boolean;
  elevate?: boolean;
}

const SkyboundCard: React.FC<SkyboundCardProps> = ({
  children,
  style,
  muted = false,
  elevate = true,
  ...rest
}) => {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: muted ? colors.surfaceMuted : colors.card,
          shadowOpacity: elevate ? 0.08 : 0,
          elevation: elevate ? 4 : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
});

export default SkyboundCard;
