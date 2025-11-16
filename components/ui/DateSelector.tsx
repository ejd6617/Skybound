import { useColors } from '@constants/theme';
import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import CalandarIcon from '../../assets/images/CalandarIcon.svg';
import SkyboundButton from './SkyboundButton';
import SkyboundCalandarPicker from './SkyboundCalandarPicker';
import SkyboundText from './SkyboundText';

interface DateSelectorProps {
  label: string;
  value: Date | null;
  onSelect: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  error?: string;
}



const DateSelector: React.FC<DateSelectorProps> = ({
  label,
  value,
  onSelect,
  placeholder = 'Select date',
  minDate,
  error,
}) => {
  const colors = useColors();
  const [showModal, setShowModal] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateChange = (date: Date) => {
    onSelect(date);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <SkyboundText variant="primary" size={14} accessabilityLabel={label} style={{ marginBottom: 8 }}>
        {label}
      </SkyboundText>

      <TouchableOpacity
        style={[
          styles.inputContainer,
          {
            borderColor: error ? '#DC2626' : colors.divider,
            backgroundColor: colors.card,
          }
        ]}
        onPress={() => setShowModal(true)}
        accessible={true}
        accessibilityLabel={`${label}, ${value ? formatDate(value) : placeholder}`}
        accessibilityRole="button"
        accessibilityHint="Opens calendar to select date"
      >
        <SkyboundText
          variant={value ? 'primary' : 'secondary'}
          size={14}
          accessabilityLabel={value ? formatDate(value) : placeholder}
          style={{ color: value ? colors.text : colors.subText, flex: 1 }}
        >
          {value ? formatDate(value) : placeholder}
        </SkyboundText>
        <CalandarIcon></CalandarIcon>
      </TouchableOpacity>

      {error && (
        <SkyboundText variant="secondary" size={12} accessabilityLabel={error} style={{ color: '#DC2626', marginTop: 4 }}>
          {error}
        </SkyboundText>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <SkyboundText variant="primaryBold" size={14} accessabilityLabel={label}>
                {label}
              </SkyboundText>
            </View>

            <View style={styles.calendarWrapper}>
              <SkyboundCalandarPicker
                onDateChange={handleDateChange}
              />
            </View>

            <View style={styles.modalActions}>
              <SkyboundButton
                onPress={() => setShowModal(false)}
                width={120}
                height={44}
                style={{ backgroundColor: colors.divider, borderRadius: 12 }}
                textVariant="primary"
              >
                Cancel
              </SkyboundButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 62,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '94%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarWrapper: {
    borderRadius: 12,
    overflow: 'visible',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default DateSelector;