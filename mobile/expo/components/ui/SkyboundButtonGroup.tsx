import React, { useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, useColorScheme } from 'react-native';
import SkyboundButton from '../../components/ui/SkyboundButton';
import basicStyles from '../../constants/BasicComponents'

interface SkyboundButtonGroupProps {
    options: string[]; //array of strings for labels 
    onChange?: (index: number) => void; //callback function
    initialIndex?: number; //optional starting index
    width?: number;
    height?: number;
    fontSize?: number;
}

const SkyboundButtonGroup: React.FC<SkyboundButtonGroupProps> = ({
    options,
    onChange,
    initialIndex = 0,
    width = 100,
    height = 40,
    fontSize = 24,

}) => {

    const [selectedIndex, setSelectedIndex] = useState(initialIndex);
    const colorScheme = useColorScheme(); 

    //function for handling presses
    const handlePress = (index: number) => {
        setSelectedIndex(index);
        //optionally have an on change funciton
        onChange?.(index)
    }

    return(
        <View style={styles.container}>
            {options.map((label, index) =>
            {
                const isActive = index === selectedIndex;
                return (
                    <SkyboundButton
                    key={`${label}-${index}`}
                    onPress={() => handlePress(index)}
                    width={width}
                    height={height}
                    textSize={fontSize}
                    textVariant='primary'
                    style={[basicStyles.skyboundButton,
                        isActive ? basicStyles.skyboundButtonPrimaryLight : (colorScheme === 'light' ? basicStyles.SkyboundButtonGroupInactiveLight : basicStyles.SkyboundButtonGroupInactiveDark),
                        {
                        borderTopLeftRadius: index === 0 ? 8 : 0,
                        borderBottomLeftRadius: index === 0 ? 8 : 0,
                        borderTopRightRadius: index === options.length - 1 ? 8 : 0,
                        borderBottomRightRadius: index === options.length - 1 ? 8 : 0,}
                    ]}
                    >
                    {label +' ' + isActive}
                    </SkyboundButton>
                )   
            }
        )}

        </View>

    )
}

const styles = StyleSheet.create({
    container: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 3,
    }
})

export default  SkyboundButtonGroup;