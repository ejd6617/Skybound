import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle, Dimensions} from 'react-native';
import BasicStyles from '../../constants/BasicComponents'

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

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Fallbacks — only use screen size if width/height aren’t explicitly given
  const resolvedWidth = width ?? screenWidth * 0.9;   // 90% of screen width by default
  const resolvedHeight = height ?? screenHeight * 0.1; // 10% of screen height by default (you can tweak this)


  

  return (
    <View
      style={[
        style,                  
        { width: resolvedWidth, height: resolvedHeight },       
      ]}
    >
      {children}
    </View>
  );
};

export default SkyboundItemHolder;