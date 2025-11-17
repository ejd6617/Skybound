import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import type { GenderOption, TravelerProfile } from '@src/types/travelers';
import SkyboundItemHolder from '../../../components/ui/SkyboundItemHolder';


//Firebase functionality imports
import { deleteTravelerDetails, setTravelerDetails, updateTravelerDetails } from '@src/firestoreFunctions';
import { getAuth } from 'firebase/auth';

const genderOptions: GenderOption[] = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

type CalendarField = 'birthdate' | 'passportExpiry';

type EditTravelerRoute = RouteProp<RootStackParamList, 'EditTraveler'>;

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

const EditTraveler: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditTravelerRoute>();
  const existingTraveler = route.params?.traveler;

  const [form, setForm] = useState<TravelerProfile>(
    existingTraveler ?? {
      id: `temp-${Date.now()}`,
      firstName: '',
      middleName: '',
      lastName: '',
      birthdate: '',
      gender: 'Prefer not to say',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
    }
  );
  const [calendarField, setCalendarField] = useState<CalendarField | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const handleInputChange = (field: keyof TravelerProfile, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCalendar = (field: CalendarField) => setCalendarField(field);

  const handleDateChange = (date: Date | null) => {
    if (!date || !calendarField) {
      return;
    }
    setForm((prev) => ({ ...prev, [calendarField]: formatDate(date) }));
    setCalendarField(null);
  };

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.birthdate) {
      Alert.alert('Missing info', 'First name, last name, and birthdate are required.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);

    const travelerData = {
      FirstName: form.firstName,
      MiddleName: form.middleName || "",
      LastName: form.lastName,
      Birthday: form.birthdate,
      Gender: form.gender,
      Nationality: form.nationality,
      PassportNumber: form.passportNumber,
      PassportExpiration: form.passportExpiry,
    };
  
    const auth = getAuth();
    const user = auth.currentUser?.uid;

    try {
      if (existingTraveler) {
        // Updates traveler if they already exist
        const success = await updateTravelerDetails(user, existingTraveler.id, travelerData);
  
        if (!success) throw new Error("Failed to update traveler");
  
        Alert.alert("Traveler updated", `${form.firstName}'s info has been updated.`);
        console.log("Traveler", `${form.firstName}'s info has been updated.`)
      } else {
        // Add new traveler if they don't yet exist
        const result = await setTravelerDetails(user, travelerData);
  
        if (!result) throw new Error("Failed to create traveler");
  
        Alert.alert("Traveler added", `${form.firstName} is ready for fast checkout.`);
        console.log("Traveler", `${form.firstName} is ready for fast checkout.`)
      }
  
      navigation.goBack();
      navigation.navigate('TravelerDetails');
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while saving the traveler.");
    }
  };

  const handleDeleteTraveler = async () => {
    setShowDeleteConfirmModal(false);
    const auth = getAuth();
    const user = auth.currentUser?.uid;

    if (user && existingTraveler) {
      const success = await deleteTravelerDetails(user, existingTraveler.id);
      if (success) {
        Alert.alert("Traveler Deleted", `${form.firstName} has been deleted.`);
        navigation.goBack();
        navigation.navigate('TravelerDetails');
      } else {
        Alert.alert("Error", "Failed to delete traveler.");
      }
    }
  };

  const calendarTitle = useMemo(() => {
    if (!calendarField) return '';
    return calendarField === 'birthdate' ? 'Select birthdate' : 'Passport expiration date';
  }, [calendarField]);

  const calendarSelectedDate = useMemo(() => {
    if (!calendarField) return undefined;
    const value = form[calendarField];
    return value ? new Date(value) : undefined;
  }, [calendarField, form]);

  const renderTextInput = (
    label: string,
    field: keyof TravelerProfile,
    placeholder: string,
    required = false
  ) => (
    <View style={styles.formField} key={field as string}>
      <SkyboundText variant="secondary" size={13} accessabilityLabel={`${label} label`}>
        {label}
        {required ? ' *' : ''}
      </SkyboundText>
      <TextInput
        value={(form[field] as string) ?? ''}
        onChangeText={(text) => handleInputChange(field, text)}
        placeholder={placeholder}
        placeholderTextColor={colors.subText}
        style={[styles.input, { borderColor: colors.outline, color: colors.text }]}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <SkyboundScreen
        title={existingTraveler ? 'Edit Traveler' : 'Add Traveler'}
        subtitle="Make sure everything matches the traveler’s passport."
        showLogo
      >
        <SkyboundItemHolder>
        <SkyboundCard muted elevate={false}>
          <SkyboundText variant="primaryBold" size={16} accessabilityLabel="Warning title">
            Double-check traveler details
          </SkyboundText>
          <SkyboundText variant="secondary" size={13} style={{ marginTop: 6 }} accessabilityLabel="Warning copy">
            Make sure this information matches the traveler’s passport or government ID exactly. After booking, name or data corrections are usually not allowed.
          </SkyboundText>
        </SkyboundCard>

        <View>
          <View style={styles.formField}>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="First name label">
              First Name *
            </SkyboundText>
            <TextInput
              value={form.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              placeholder="First name"
              placeholderTextColor={colors.subText}
              style={[styles.input, { borderColor: colors.outline, color: colors.text }]}
            />
          </View>
          <View style={styles.formField}>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Middle name label">
              Middle Name
            </SkyboundText>
            <TextInput
              value={form.middleName}
              onChangeText={(text) => handleInputChange('middleName', text)}
              placeholder="Middle name"
              placeholderTextColor={colors.subText}
              style={[styles.input, { borderColor: colors.outline, color: colors.text }]}
            />
          </View>
          <View style={styles.formField}>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Last name label">
              Last Name *
            </SkyboundText>
            <TextInput
              value={form.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              placeholder="Last name"
              placeholderTextColor={colors.subText}
              style={[styles.input, { borderColor: colors.outline, color: colors.text }]}
            />
          </View>

          <View style={styles.formField}>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Birthdate label">
              Birthdate *
            </SkyboundText>
            <Pressable
              accessibilityRole="button"
              onPress={() => openCalendar('birthdate')}
              style={({ pressed }) => [
                styles.dateInput,
                { borderColor: colors.outline },
                pressed && { opacity: 0.7 },
              ]}
            >
              <SkyboundText variant="primary" size={15} accessabilityLabel="Birthdate value">
                {form.birthdate || 'Select birthdate'}
              </SkyboundText>
            </Pressable>
          </View>

          <View style={styles.formField}>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Gender label">
              Gender *
            </SkyboundText>
            <View style={styles.genderRow}>
              {genderOptions.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => handleInputChange('gender', option)}
                  style={({ pressed }) => [
                    styles.genderChip,
                    form.gender === option && { backgroundColor: '#2F97FF' },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <SkyboundText
                    variant={form.gender === option ? 'primaryButton' : 'secondary'}
                    size={13}
                    accessabilityLabel={`${option} option`}
                  >
                    {option}
                  </SkyboundText>
                </Pressable>
              ))}
            </View>
          </View>

          {renderTextInput('Nationality', 'nationality', 'Country of citizenship')}
          {renderTextInput('Passport Number', 'passportNumber', 'Enter passport number')}

          <View style={styles.formField}>
            <SkyboundText variant="secondary" size={13} accessabilityLabel="Passport expiration label">
              Passport Expiration Date
            </SkyboundText>
            <Pressable
              accessibilityRole="button"
              onPress={() => openCalendar('passportExpiry')}
              style={({ pressed }) => [
                styles.dateInput,
                { borderColor: colors.outline },
                pressed && { opacity: 0.7 },
              ]}
            >
              <SkyboundText variant="primary" size={15} accessabilityLabel="Passport expiration value">
                {form.passportExpiry || 'Select expiration date'}
              </SkyboundText>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }]}
        >
          <SkyboundText variant="primaryButton" size={16} accessabilityLabel="Save traveler">
            Save Traveler
          </SkyboundText>
        </Pressable>

        {existingTraveler && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowDeleteConfirmModal(true)}
            style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.9 }]}
          >
            <SkyboundText variant="primaryButton" size={16} accessabilityLabel="Delete traveler">
              Delete Traveler
            </SkyboundText>
          </Pressable>
        )}
        </SkyboundItemHolder>
      </SkyboundScreen>

      <Modal visible={Boolean(calendarField)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.calendarSheet, { backgroundColor: colors.card }]}> 
            <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Calendar title">
              {calendarTitle}
            </SkyboundText>
            <CalendarPicker
              onDateChange={(date) => handleDateChange(date as unknown as Date)}
              selectedStartDate={calendarSelectedDate}
              maxDate={calendarField === 'birthdate' ? new Date() : undefined}
              minDate={calendarField === 'passportExpiry' ? new Date() : undefined}
              textStyle={{ color: colors.text }}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setCalendarField(null)}
              style={({ pressed }) => [styles.modalSecondaryButton, pressed && { opacity: 0.8 }]}
            >
              <SkyboundText variant="primary" size={15} accessabilityLabel="Close calendar">
                Close
              </SkyboundText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card }]}> 
            <SkyboundText variant="primaryBold" size={18} accessabilityLabel="Confirmation title">
              Does this look good?
            </SkyboundText>
            <View style={styles.summaryList}>
              {(
                [
                  { label: 'Full name', value: `${form.firstName} ${form.middleName ?? ''} ${form.lastName}`.replace(/\s+/g, ' ').trim() },
                  { label: 'Birthdate', value: form.birthdate },
                  { label: 'Gender', value: form.gender },
                  { label: 'Nationality', value: form.nationality || 'Not provided' },
                  { label: 'Passport', value: form.passportNumber || 'Not provided' },
                  { label: 'Passport Expiration', value: form.passportExpiry || 'Not provided' },
                ] as const
              ).map((item) => (
                <View style={styles.summaryRow} key={item.label}>
                  <SkyboundText variant="secondary" size={13} accessabilityLabel={`${item.label} label`}>
                    {item.label}
                  </SkyboundText>
                  <SkyboundText variant="primary" size={14} accessabilityLabel={`${item.label} value`}>
                    {item.value}
                  </SkyboundText>
                </View>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={handleConfirmSave}
              style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }]}
            >
              <SkyboundText variant="primaryButton" size={16} accessabilityLabel="Confirm and save">
                Confirm & Save
              </SkyboundText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowConfirmModal(false)}
              style={({ pressed }) => [styles.modalSecondaryButton, pressed && { opacity: 0.8 }]}
            >
              <SkyboundText variant="primary" size={15} accessabilityLabel="Edit again">
                Edit
              </SkyboundText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteConfirmModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card }]}>
            <SkyboundText 
              variant="primaryBold" 
              size={18} 
              accessabilityLabel="Delete confirmation title">
              Are you sure you want to delete this traveler?
            </SkyboundText>
            <View style={styles.summaryList}>
              <SkyboundText 
                variant="primary" 
                size={14}
                accessabilityLabel="Traveler name">
                {form.firstName} {form.lastName}
              </SkyboundText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={handleDeleteTraveler}
              style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.9 }]}
            >
              <SkyboundText 
                variant="primaryButton" 
                size={16} 
                accessabilityLabel="Confirm and delete">
                Confirm Delete
              </SkyboundText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowDeleteConfirmModal(false)}
              style={({ pressed }) => [styles.modalSecondaryButton, pressed && { opacity: 0.8 }]}
            >
              <SkyboundText 
                variant="primary" 
                size={15} 
                accessabilityLabel="Cancel deletion">
                Cancel
              </SkyboundText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  formField: {
    marginBottom: 16,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  dateInput: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  genderChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveButton: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#2F97FF',
  },
  deleteButton: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FF4F4F',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  calendarSheet: {
    borderRadius: 20,
    padding: 20,
  },
  confirmCard: {
    borderRadius: 24,
    padding: 24,
  },
  modalSecondaryButton: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
  },
  summaryList: {
    marginVertical: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default EditTraveler;
