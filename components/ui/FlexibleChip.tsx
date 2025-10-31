import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '../../constants/theme';
import SkyboundText from './SkyboundText';

interface FlexibleChipProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  iconType: 'calendar' | 'airport';
}

const CalendarIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path d="M7.5 1.66669C7.72101 1.66669 7.93297 1.75448 8.08926 1.91076C8.24554 2.06704 8.33333 2.27901 8.33333 2.50002V3.33335H11.6667V2.50002C11.6667 2.27901 11.7545 2.06704 11.9107 1.91076C12.067 1.75448 12.279 1.66669 12.5 1.66669C12.721 1.66669 12.933 1.75448 13.0893 1.91076C13.2455 2.06704 13.3333 2.27901 13.3333 2.50002V3.33335H15.8333C16.2754 3.33335 16.6993 3.50895 17.0118 3.82151C17.3244 4.13407 17.5 4.55799 17.5 5.00002V15.8334C17.5 16.2754 17.3244 16.6993 17.0118 17.0119C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0119C2.67559 16.6993 2.5 16.2754 2.5 15.8334V5.00002C2.5 4.55799 2.67559 4.13407 2.98816 3.82151C3.30072 3.50895 3.72464 3.33335 4.16667 3.33335H6.66667V2.50002C6.66667 2.27901 6.75446 2.06704 6.91074 1.91076C7.06702 1.75448 7.27899 1.66669 7.5 1.66669ZM6.66667 5.00002H4.16667V7.50002H15.8333V5.00002H13.3333V5.83335C13.3333 6.05437 13.2455 6.26633 13.0893 6.42261C12.933 6.57889 12.721 6.66669 12.5 6.66669C12.279 6.66669 12.067 6.57889 11.9107 6.42261C11.7545 6.26633 11.6667 6.05437 11.6667 5.83335V5.00002H8.33333V5.83335C8.33333 6.05437 8.24554 6.26633 8.08926 6.42261C7.93297 6.57889 7.72101 6.66669 7.5 6.66669C7.27899 6.66669 7.06702 6.57889 6.91074 6.42261C6.75446 6.26633 6.66667 6.05437 6.66667 5.83335V5.00002ZM15.8333 9.16669H4.16667V15.8334H15.8333V9.16669Z" fill={color}/>
  </Svg>
);

const AirportIcon = ({ color }: { color: string }) => (
  <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
    <Path d="M3.14128 6.125H10.8588C11.0068 6.12491 11.1524 6.16237 11.282 6.23388C11.4116 6.30539 11.521 6.40861 11.5998 6.53388C11.6787 6.65916 11.7245 6.80238 11.7329 6.95016C11.7413 7.09794 11.7121 7.24545 11.648 7.37887L10.388 10.0039C10.3167 10.1524 10.2048 10.2778 10.0653 10.3656C9.92587 10.4533 9.76445 10.4999 9.59965 10.5H4.4004C4.23561 10.4999 4.07418 10.4533 3.93471 10.3656C3.79524 10.2778 3.68338 10.1524 3.61203 10.0039L2.35203 7.37887C2.28797 7.24552 2.25877 7.09809 2.26716 6.95038C2.27554 6.80267 2.32125 6.6595 2.4 6.53425C2.47875 6.40901 2.58797 6.30577 2.71745 6.2342C2.84694 6.16263 2.99333 6.12506 3.14128 6.125Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M5.25 6.125L4.5675 4.07575C4.54563 4.01008 4.53965 3.94017 4.55005 3.87174C4.56045 3.80332 4.58694 3.73833 4.62734 3.68214C4.66774 3.62594 4.72089 3.58012 4.78244 3.54846C4.84398 3.5168 4.91216 3.50019 4.98137 3.5H9.01688C9.08623 3.49991 9.15462 3.51632 9.21639 3.54786C9.27816 3.57941 9.33155 3.62519 9.37215 3.68143C9.41274 3.73766 9.43939 3.80275 9.44988 3.87131C9.46038 3.93987 9.45442 4.00994 9.4325 4.07575L8.75 6.125M7 1.75V3.5M5.25 10.5V18.375H8.75V10.5M2.625 18.375H18.375M19.25 4.375H14L13.125 3.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M15.75 2.625L17.5 4.375L15.75 6.125M8.75 14.875H14.875C15.3391 14.875 15.7842 15.0594 16.1124 15.3876C16.4406 15.7158 16.625 16.1609 16.625 16.625V18.375" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const FlexibleChip: React.FC<FlexibleChipProps> = ({ label, isActive, onToggle, iconType }) => {
  const colors = useColors();
  const SKYBOUND_BLUE = '#0071E2';
  const Icon = iconType === 'calendar' ? CalendarIcon : AirportIcon;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isActive ? SKYBOUND_BLUE : colors.background,
          borderColor: isActive ? SKYBOUND_BLUE : '#D9D9D9',
        }
      ]}
      onPress={onToggle}
      accessible={true}
      accessibilityLabel={`${label}, ${isActive ? 'active' : 'inactive'}`}
      accessibilityRole="switch"
      accessibilityState={{ checked: isActive }}
    >
      <Icon color={isActive ? '#FFFFFF' : '#49454F'} />
      <SkyboundText
        variant={isActive ? 'forceWhite' : 'secondary'}
        size={14}
        accessabilityLabel={label}
        style={{ color: isActive ? '#FFFFFF' : '#585858' }}
      >
        {label}
      </SkyboundText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderRadius: 100,
    borderWidth: 1,
    minHeight: 56,
    flex: 1,
    marginBottom: 8,
  },
});

export default FlexibleChip;
