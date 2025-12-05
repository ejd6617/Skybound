import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { NATIONALITIES } from '../../assets/data/nationalities';
import { useColors } from '../../constants/theme';


interface SkyboundDropDownProps {
    value?: string;
    onChange: (nationaility: string) => void
    placeholder: string;
}

const SkyboundDropDown: React.FC<SkyboundDropDownProps> = ({

    value,
    onChange,
    placeholder,
}) => {
   const colors = useColors()

    return(
       <View style={{ marginBottom: 16 }}>
      <RNPickerSelect
        onValueChange={onChange}
        value={value}
        useNativeAndroidPickerStyle={false}
        placeholder={{
          label: placeholder,
          value: null,
          color: colors.subText,
        }}
        items={NATIONALITIES.map((nation) => ({
            value: nation,
            label: nation
        }))}
        style={{
          inputIOS: {
            height: 48,
            fontSize: 16,
            paddingHorizontal: 12,
            paddingRight: 32, // space for arrow
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.outline,
            color: colors.text,
            fontFamily: 'Regular',
          },
          inputAndroid: {
            height: 48,
            fontSize: 16,
            paddingHorizontal: 12,
            paddingRight: 32,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.outline,
            color: colors.text,
            fontFamily: 'Regular'
        
          },
          placeholder: {
            color: colors.subText,
          },
          iconContainer: {
            top: 14,
            right: 12,
          },
        }}
        Icon={() => (
            <MaterialIcons name="arrow-drop-down" size={24} color={colors.icon} />
        )}
      />
    </View>
    )
}

export default SkyboundDropDown

