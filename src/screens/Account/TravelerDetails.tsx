import React, { useEffect, useState, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import type { GenderOption, TravelerProfile } from '@src/types/travelers';

import { getTravelerDetails } from '@src/firestoreFunctions';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from "@src/firebase";

const TravelerDetails: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [travelers, setTravelers] = useState<TravelerProfile[]>([]);

  const auth = getAuth();
  const user = auth.currentUser?.uid;

  //fetches traveler details from firebase
  const fetchTravelers = async () => {
    try {
      const travelersRef = collection(db, 'Users', user, 'TravelerDetails');
      const travelersSnap = await getDocs(travelersRef);

      const fetchedTravelers: TravelerProfile[] = [];

      for (const doc of travelersSnap.docs) {
        const travelerID = doc.id;
        const travelerDetails = await getTravelerDetails(user, travelerID);
        if (travelerDetails) {
          fetchedTravelers.push({
            id: travelerID,
            firstName: travelerDetails.FirstName,
            middleName: travelerDetails.MiddleName || "",
            lastName: travelerDetails.LastName,
            birthdate: travelerDetails.Birthday,
            gender: travelerDetails.Gender as GenderOption,
            nationality: travelerDetails.Nationality,
            passportNumber: travelerDetails.PassportNumber,
            passportExpiry: travelerDetails.PassportExpiration,
          });
        }
      }

      setTravelers(fetchedTravelers);
    } catch (error) {
      console.error("Error fetching travelers: ", error);
    }
  };

 // Fetch traveler details when the screen loads
  useEffect(() => {
    fetchTravelers();
  }, []);

  // Re-fetch travelers whenever the travelers are updated
  useFocusEffect(
    React.useCallback(() => {
      fetchTravelers(); 
    }, [])
  );

  const handleAddTraveler = () => {
    navigation.navigate('EditTraveler');
  };

  const handleEditTraveler = (traveler: TravelerProfile) => {
    navigation.navigate('EditTraveler', { traveler });
  };

  const travelerCards = useMemo(
    () =>
      travelers.map((traveler) => {
        const initials = `${traveler.firstName.charAt(0)}${traveler.lastName.charAt(0)}`;
        return (
          <Pressable key={traveler.id} accessibilityRole="button" onPress={() => handleEditTraveler(traveler)}>
            <SkyboundCard>
              <View style={styles.travelerRow}>
                <View style={[styles.avatar, { backgroundColor: colors.link }]}>
                  <SkyboundText variant="forceWhite" size={16} accessabilityLabel={`${traveler.firstName} initials`}>
                    {initials}
                  </SkyboundText>
                </View>
                <View style={styles.travelerInfo}>
                  <SkyboundText variant="primaryBold" size={16} accessabilityLabel={`Traveler name ${traveler.firstName} ${traveler.lastName}`}>
                    {traveler.firstName} {traveler.lastName}
                  </SkyboundText>
                  <SkyboundText variant="secondary" size={13} accessabilityLabel={`Traveler birthdate ${traveler.birthdate}`}>
                    Born {traveler.birthdate} · {traveler.nationality ?? 'Nationality TBD'}
                  </SkyboundText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              </View>
            </SkyboundCard>
          </Pressable>
        );
      }),
    [colors.icon, colors.link, travelers]
  );

  return (
    <SkyboundScreen title="Traveler Profiles" subtitle="Save traveler details to speed up checkout." showLogo>
      {travelers.length > 0 ? (
        travelerCards
      ) : (
        <SkyboundCard style={styles.emptyCard}>
          <Ionicons name="people-outline" size={48} color={colors.link} />
          <SkyboundText variant="primaryBold" size={18} style={styles.emptyTitle} accessabilityLabel="No travelers">
            No travelers yet
          </SkyboundText>
          <SkyboundText variant="secondary" size={14} style={styles.emptyCopy} accessabilityLabel="Empty travelers copy">
            Add your details to make booking faster.
          </SkyboundText>
          <Pressable
            accessibilityRole="button"
            onPress={handleAddTraveler}
            style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
          >
            <SkyboundText variant="primaryButton" size={15} accessabilityLabel="Add traveler">
              Add Traveler
            </SkyboundText>
          </Pressable>
        </SkyboundCard>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={handleAddTraveler}
        style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <SkyboundText variant="primaryButton" size={16} accessabilityLabel="Add traveler button">
          Add Traveler
        </SkyboundText>
      </Pressable>
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerInfo: {
    flex: 1,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: '#2F97FF',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 12,
  },
  emptyCopy: {
    textAlign: 'center',
    marginVertical: 6,
  },
  primaryButton: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#2F97FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default TravelerDetails;
