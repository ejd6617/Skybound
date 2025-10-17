import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import basicStyles from '../../constants/BasicComponents';


interface SkyboundTextProps {
    children: React.ReactNode; //what the text will say
    style?: StyleProp<TextStyle>;//optinal style override
    size?: number;//size override
    variant: TextVariant //which Skybound text style it is
    accessabilityLabel: string;

}

export type TextVariant = 'primary' | 'secondary' | 'error' | 'primaryButton'
| 'deleteButton' | 'blue' | 'primaryBold' // enum of the various styles

const SkyboundText: React.FC<SkyboundTextProps> = ({
    children,
    variant = 'primary',
    style,
    size,
    accessabilityLabel,
}) => {
    const variantStyle =
        variant === 'secondary' //if variant is equal to secondary
        ? basicStyles.skyboundTextSecondary
        : variant === 'error' //else if variant is equal to error
        ? basicStyles.skyboundTextError
        : variant === 'primaryButton' //else if variant is equal to primaryButton
        ? basicStyles.skyboundButtonTextPrimary
        : variant === 'deleteButton' // else if variant is equal to deleteButton
        ? basicStyles.skyboundDeleteButtonText
        : variant === 'blue' //else if variant is equal to navBar
        ? basicStyles.skyboundBlueText
        : variant === 'primaryBold' //else if variant is pirmaryBold
        ? basicStyles.skyboundTextPrimaryBold
        : basicStyles.skyboundTextPrimary

    return (
        <Text style = {[
            variantStyle,
            size ? {fontSize: size} : null,
            style,
         ]} accessibilityLabel= {accessabilityLabel}
         >
            {children}
         </Text>
    )


}

export default SkyboundText