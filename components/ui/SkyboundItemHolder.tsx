import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle, useColorScheme } from 'react-native';
import BasicStyles from '../../constants/BasicComponents';

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

 
 //import color scheme
  const colorScheme = useColorScheme();

  if(colorScheme === "light")
  {
    return (
    <View
      style={[
        BasicStyles.itemHolderLight,
        style,                  
        { width: width, height: height},       
      ]}
    >
      {children}
    </View>
  );
  }
  else
  {
    return (

    <View
      style={[
        BasicStyles.itemHolderDark,
        style,                  
        { width: width, height: height},       
      ]}
    >
      {children}
    </View>

    );
  }

  
  


  

  
};

export default SkyboundItemHolder;