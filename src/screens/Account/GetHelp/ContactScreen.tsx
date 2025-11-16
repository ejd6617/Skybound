import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';

const reasons = ['Billing', 'Booking issue', 'Technical issue', 'Other'];

const ContactScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    reason: reasons[0],
    message: '',
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInput = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      return;
    }
    setSubmitted(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <SkyboundScreen title="Contact Us" subtitle="Tell us what you need help with and we’ll get back to you." showLogo>
        {submitted ? (
          <SkyboundCard style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
            <SkyboundText variant="primaryBold" size={20} style={{ marginTop: 12 }} accessabilityLabel="Success title">
              Got it!
            </SkyboundText>
            <SkyboundText variant="secondary" size={14} style={styles.successCopy} accessabilityLabel="Success message">
              We’ll reply within 3 business days.
            </SkyboundText>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('GetHelp')}
              style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
            >
              <SkyboundText variant="primaryButton" size={15} accessabilityLabel="Back to help">
                Back to Help
              </SkyboundText>
            </Pressable>
          </SkyboundCard>
        ) : (
          <SkyboundCard>
            {(['firstName', 'lastName', 'email'] as const).map((field) => (
              <View key={field} style={styles.formField}>
                <SkyboundText variant="secondary" size={13} accessabilityLabel={`${field} label`}>
                  {field === 'email'
                    ? 'Email'
                    : field === 'firstName'
                      ? 'First Name'
                      : 'Last Name'}
                </SkyboundText>
                <TextInput
                  value={form[field]}
                  onChangeText={(text) => handleInput(field, text)}
                  placeholder={`Enter ${field === 'email' ? 'email address' : `${field === 'firstName' ? 'first' : 'last'} name`}`}
                  placeholderTextColor={colors.subText}
                  style={[styles.input, { borderColor: colors.outline, color: colors.text }]}
                  keyboardType={field === 'email' ? 'email-address' : 'default'}
                  autoCapitalize={field === 'email' ? 'none' : 'words'}
                />
              </View>
            ))}

            <View style={styles.formField}>
              <SkyboundText variant="secondary" size={13} accessabilityLabel="Reason label">
                Reason
              </SkyboundText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPickerOpen((prev) => !prev)}
                style={({ pressed }) => [
                  styles.selectButton,
                  { borderColor: colors.outline },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <SkyboundText variant="primary" size={15} accessabilityLabel="Reason value">
                  {form.reason}
                </SkyboundText>
                <Ionicons name={pickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.icon} />
              </Pressable>
              {pickerOpen && (
                <View style={[styles.dropdown, { borderColor: colors.outline }]}> 
                  {reasons.map((reason) => (
                    <Pressable
                      key={reason}
                      accessibilityRole="button"
                      onPress={() => {
                        handleInput('reason', reason);
                        setPickerOpen(false);
                      }}
                      style={({ pressed }) => [styles.dropdownRow, pressed && { opacity: 0.7 }]}
                    >
                      <SkyboundText variant="primary" size={14} accessabilityLabel={`${reason} option`}>
                        {reason}
                      </SkyboundText>
                      {form.reason === reason && (
                        <Ionicons name="checkmark" size={16} color={colors.link} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <SkyboundText variant="secondary" size={13} accessabilityLabel="Message label">
                Message
              </SkyboundText>
              <TextInput
                value={form.message}
                onChangeText={(text) => handleInput('message', text)}
                placeholder="Share details so we can help quickly"
                placeholderTextColor={colors.subText}
                style={[styles.textArea, { borderColor: colors.outline, color: colors.text }]}
                multiline
                numberOfLines={5}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
              disabled={!form.firstName || !form.lastName || !form.email || !form.message}
            >
              <SkyboundText variant="primaryButton" size={16} accessabilityLabel="Submit support request">
                Submit
              </SkyboundText>
            </Pressable>
          </SkyboundCard>
        )}
      </SkyboundScreen>
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
  },
  textArea: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    textAlignVertical: 'top',
  },
  selectButton: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#2F97FF',
  },
  successCard: {
    alignItems: 'center',
  },
  successCopy: {
    marginTop: 6,
    textAlign: 'center',
  },
});

export default ContactScreen;
