import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import BasicStyles from '../../constants/BasicComponents';

interface SkyboundItemHolderProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  width?: number;
  height?: number; 
}



const SkyboundItemHolder: React.FC<SkyboundItemHolderProps> = ({
  style = BasicStyles.itemHolder,
  children,
  width,
  height,
}) => {

  

  // Fallbacks — only use screen size if width/height aren’t explicitly given
  
  


  

  return (
    <View
      style={[
        style,                  
        { width: width, height: height},       
      ]}
    >
      {children}
    </View>
  );
};

export default SkyboundItemHolder;