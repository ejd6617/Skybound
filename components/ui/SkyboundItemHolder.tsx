import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

interface SkyboundItemHolderProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  width?: number;
  height?: number; 
}

const SkyboundItemHolder: React.FC<SkyboundItemHolderProps> = ({
  style,
  children,
  width,
  height,
}) => {
  return (
    <View
      style={[
        style,                  
        { width, height },       
      ]}
    >
      {children}
    </View>
  );
};

export default SkyboundItemHolder;