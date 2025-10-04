import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import basicStyles from '../../constants/BasicComponents'; 


interface SkyboundTextProps {
    children: React.ReactNode; //what the text will say
    style?: StyleProp<TextStyle>;//optinal style override
    size?: number;//size override
    variant: TextVariant //which Skybound text style it is
}

export type TextVariant = 'primary' | 'secondary' | 'error' | 'primaryButton' // enum of the various styles

const SkyboundText: React.FC<SkyboundTextProps> = ({
    children,
    variant = 'primary',
    style,
    size,
}) => {
    const variantStyle =
        variant === 'secondary' //if variant is equal to secondary
        ? basicStyles.skyboundTextSecondary
        : variant === 'error' //else if variant is equal to error
        ? basicStyles.skyboundTextError
        : variant === 'primaryButton' //else if variant is equal to primaryButton
        ? basicStyles.skyboundButtonTextPrimary
        : basicStyles.skyboundTextPrimary

    return (
        <Text style = {[
            variantStyle,
            size ? {fontSize: size} : null,
            style,
         ]}
         >
            {children}
         </Text>
    )


}

export default SkyboundText