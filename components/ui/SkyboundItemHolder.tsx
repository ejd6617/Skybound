import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

interface SkyboundItemHolderProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const SkyboundItemHolder: React.FC<SkyboundItemHolderProps> = ({ style, children }) => {
  return (
    <View style={style}>
      {children}
    </View>
  );
};

export default SkyboundItemHolder;
