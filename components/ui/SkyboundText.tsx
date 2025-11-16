import basicStyles from '@constants/BasicComponents';
import React from 'react';
import { StyleProp, Text, TextStyle, useColorScheme } from 'react-native';


interface SkyboundTextProps {
    children: React.ReactNode; //what the text will say
    style?: StyleProp<TextStyle>;//optinal style override
    size?: number;//size override
    variant: TextVariant //which Skybound text style it is
    accessabilityLabel: string;

}

export type TextVariant = 'primary' | 'secondary' | 'primaryButton'
| 'deleteButton' | 'blue' | 'primaryBold'  | 'forceWhite'  | 'error' // enum of the various styles

const SkyboundText: React.FC<SkyboundTextProps> = ({
    children,
    variant = 'primary',
    style,
    size,
    accessabilityLabel,
}) => {
    let variantStyle = basicStyles.skyboundTextPrimaryLight;
    const colorScheme = useColorScheme();
    
    //need to set the style based on both text variant and current theme
    if(variant === 'primary')
    {
        if(colorScheme === 'light')
        {
            variantStyle = basicStyles.skyboundTextPrimaryLight;
        }
        else 
        {
            variantStyle = basicStyles.skyboundTextPrimaryDark;
        }
    }
    else if(variant === 'secondary')
    {
         if(colorScheme === 'light')
        {
             variantStyle = basicStyles.skyboundTextSecondaryLight;
        }
        else 
        {
             variantStyle = basicStyles.skyboundTextSecondaryDark;
        }
    }
    else if(variant === 'primaryButton')
    {
         if(colorScheme === 'light')
        {
             variantStyle = basicStyles.skyboundButtonTextPrimaryLight;
        }
        else 
        {
             variantStyle = basicStyles.skyboundButtonTextPrimaryDark;
        }
    }
    else if(variant === 'primaryBold')
    {
         if(colorScheme === 'light')
        {
             variantStyle = basicStyles.skyboundTextPrimaryLightBold;
        }
        else 
        {
             variantStyle = basicStyles.skyboundTextPrimaryDarkBold;
        }
    }
    else if(variant === 'blue')
    {
          if(colorScheme === 'light')
        {
             variantStyle = basicStyles.skyboundBlueTextLight;
        }
        else 
        {
             variantStyle = basicStyles.skyboundBlueTextDark;
        }
    }
    else if(variant === 'forceWhite')
    {
        variantStyle = basicStyles.skyboundTextPrimaryDarkBold;
    }
    else if(variant === 'error')
    {
        variantStyle = basicStyles.skyboundTextError
    }

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