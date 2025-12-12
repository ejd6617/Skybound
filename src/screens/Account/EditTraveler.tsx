import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import type { GenderOption, TravelerProfile, TravelerType, } from '@src/types/travelers';
import SkyboundDropDown from '../../../components/ui/SkyboundDropDown';
import SkyboundItemHolder from '../../../components/ui/SkyboundItemHolder';


//Firebase functionality imports
import SkyboundButton from '@/components/ui/SkyboundButton';
import SkyboundLabelledTextBox from '@/components/ui/SkyboundLabelledTextBox';
import BasicComponents from '@/constants/BasicComponents';
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

const deriveTravelerType = (birthdate: string): TravelerType => {
  const monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const match = birthdate.match(/([A-Za-z]{3})\s(\d{1,2}),\s(\d{4})/);
  const fromFormatted = match
    ? new Date(Number(match[3]), monthMap[match[1]], Number(match[2]))
    : null;

  const birthdateValue = birthdate
    ? fromFormatted ?? new Date(birthdate)
    : null;

  if (!birthdateValue || Number.isNaN(birthdateValue.getTime())) {
    return 'Adult';
  }

  const now = new Date();
  let age = now.getFullYear() - birthdateValue.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > birthdateValue.getMonth() ||
    (now.getMonth() === birthdateValue.getMonth() && now.getDate() >= birthdateValue.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;

  if (age < 0) age = 0; // Guard against future dates parsing as adults

  if (age < 2) return 'Infant';
  if (age <= 11) return 'Child';
  if (age <= 17) return 'Teen';
  if (age >= 65) return 'Senior';
  return 'Adult';
};

const EditTraveler: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditTravelerRoute>();
  const existingTraveler = route.params?.traveler;
  const returnToBooking = route.params?.returnToBooking;
  const itineraryForReturn = route.params?.itinerary;

  const { width: SCREEN_W } = Dimensions.get("window");
  const CARD_W = Math.min(420, Math.round(SCREEN_W * 0.86));
  const H_PADDING = 18;
  const BTN_W = CARD_W - H_PADDING ;

  const [form, setForm] = useState<TravelerProfile>(
    existingTraveler
      ? { ...existingTraveler, type: deriveTravelerType(existingTraveler.birthdate) }
      : {
          id: `temp-${Date.now()}`,
          firstName: '',
          middleName: '',
          lastName: '',
          birthdate: '',
          gender: 'Prefer not to say',
          type: 'Adult',
          nationality: '',
          passportNumber: '',
          passportExpiry: '',
        }
  );
  const [calendarField, setCalendarField] = useState<CalendarField | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showReturnToBooking, setShowReturnToBooking] = useState(false);
  const [lastSavedTraveler, setLastSavedTraveler] = useState<TravelerProfile | null>(
    existingTraveler ?? null
  );

  const autoTravelerType = useMemo(() => deriveTravelerType(form.birthdate), [form.birthdate]);

  const travelerGuidance: Record<TravelerType, string> = {
    Infant: 'Infants (under 2) must ride on an adult’s lap or in their own purchased seat.',
    Child: 'Children 2–11 may need a paying adult on the same booking; ages 5–14 often use mandatory Unaccompanied Minor service for solo trips.',
    Teen: 'Teens 12–17 can usually travel alone; ages 15–17 can optionally use UM service on many airlines.',
    Adult: 'Adults 18+ can travel independently and should carry a valid government ID at check-in.',
    Senior: 'Travelers 65+ may qualify for priority or accessibility accommodations—add any needs in special requests.',
  };

  const handleInputChange = (field: keyof TravelerProfile, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCalendar = (field: CalendarField) => setCalendarField(field);

  const handleDateChange = (date: Date | null) => {
    if (!date || !calendarField) {
      return;
    }
    const formattedDate = formatDate(date);
    setForm((prev) => ({
      ...prev,
      [calendarField]: formattedDate,
      type: calendarField === 'birthdate' ? deriveTravelerType(formattedDate) : prev.type,
    }));
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
      Type: autoTravelerType,
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
        const updatedProfile: TravelerProfile = { ...form, id: existingTraveler.id };
        setLastSavedTraveler(updatedProfile);

        if (returnToBooking) {
          setShowReturnToBooking(true);
        } else {
          navigation.goBack();
        }
      } else {
        // Add new traveler if they don't yet exist
        const createdId = await setTravelerDetails(user, travelerData);

        if (!createdId) throw new Error("Failed to create traveler");

        Alert.alert("Traveler added", `${form.firstName} is ready for fast checkout.`);
        const createdProfile: TravelerProfile = { ...form, id: createdId };
        setLastSavedTraveler(createdProfile);

        if (returnToBooking) {
          setShowReturnToBooking(true);
        } else {
          navigation.goBack();
        }
      }

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
       
      } else {
        Alert.alert("Error", "Failed to delete traveler.");
      }
    }
  };

  const handleReturnToBooking = () => {
    if (itineraryForReturn) {
      navigation.navigate('FlightSummary', {
        itinerary: {
          ...itineraryForReturn,
          traveler: lastSavedTraveler || existingTraveler || itineraryForReturn.traveler,
        },
      });
      return;
    }

    navigation.goBack();
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



  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      
    >
      <SkyboundScreen showLogo>
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
            <SkyboundLabelledTextBox
            placeholderText='First Name'
            width={BTN_W}
            label='First Name *'
            height={45}
            text={form.firstName}
            onChange={(text) =>
              setForm((prev) => ({
                ...prev,
                 firstName: text,
             }))}
             />
            
            
          </View>
          <View style={styles.formField}>
            <SkyboundLabelledTextBox
            placeholderText='Middle Name'
            width={BTN_W}
            label='Middle Name'
            height={45}
            text={form.middleName}
            onChange={(text) =>
              setForm((prev) => ({
                ...prev,
                 middleName: text,
             }))
           }/>
          </View>
          <View style={styles.formField}>
           <SkyboundLabelledTextBox
            placeholderText='Last Name'
            width={BTN_W}
            label='Last Name *'
            height={45}
            text={form.lastName}
            onChange={(text) =>
              setForm((prev) => ({
                ...prev,
                 lastName: text,
             }))
           }/>
          </View>

          <View style={styles.formField}>
            <SkyboundText variant="primary" size={15} accessabilityLabel="Birthdate label">
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
            <SkyboundText variant="primary" size={15} accessabilityLabel="Gender label">
              Gender 
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

          <View style={styles.formField}>
          <SkyboundText variant="primary" size={15} accessabilityLabel="Traveler type label">
            Traveler Type
          </SkyboundText>
          <View style={[styles.typePill, { borderColor: colors.outline }]}>
            <SkyboundText variant="primaryBold" size={14} accessabilityLabel="Traveler type value">
              {autoTravelerType}
            </SkyboundText>
            <SkyboundText variant="secondary" size={12} accessabilityLabel="Traveler type helper" style={{ marginTop: 4 }}>
              Auto-selected based on birthdate
            </SkyboundText>
            <SkyboundText
              variant="secondary"
              size={12}
              style={{ marginTop: 6 }}
              accessabilityLabel="Traveler guidance copy"
            >
              {travelerGuidance[autoTravelerType]}
            </SkyboundText>
          </View>
          </View>

          <View style={styles.formField}>
            <SkyboundText variant='primary' accessabilityLabel='Select Nationality' size={15}>Nationality</SkyboundText>
           <SkyboundDropDown
           placeholder='Select Nationality'
           onChange={(text) =>
              setForm((prev) => ({
                ...prev,
                 nationality: text,
             }))}
             value={existingTraveler?.nationality || undefined}/>
          </View>

          <View style={styles.formField}>
           <SkyboundLabelledTextBox
            placeholderText='Passport Number'
            width={BTN_W}
            label='Enter Passpot number'
            height={45}
            text={form.passportNumber}
            maxLength={9}
            onChange={(text) =>
              setForm((prev) => ({
                ...prev,
                 passportNumber: text,
             }))
           }/>
          </View>


          <View style={styles.formField}>
            <SkyboundText variant="primary" size={15} accessabilityLabel="Passport expiration label">
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

      <SkyboundButton
        height={50}
        width={BTN_W}
        onPress={handleSave}
        style={BasicComponents.skyboundButtonPrimaryLight}
        textSize={16}
      >
        Save Traveler
      </SkyboundButton>

        {existingTraveler && (
          <SkyboundButton
            height={50}
            width={BTN_W}
            onPress={() => {setShowDeleteConfirmModal(true)} }
            style={BasicComponents.skyboundButtonPrimaryError}>
              Delete Traveler
            </SkyboundButton>
        )}

        {returnToBooking && showReturnToBooking && (
          <SkyboundButton
            height={50}
            width={BTN_W}
            onPress={handleReturnToBooking}
            style={BasicComponents.skyboundButtonPrimaryLight}
          >
            Go back to booking
          </SkyboundButton>
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
                  { label: 'Type', value: autoTravelerType },
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
  typePill: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});

export default EditTraveler;
