import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';
import type { GenderOption, TravelerProfile } from '@src/types/travelers';

import { db } from "@src/firebase";
import { getTravelerDetails } from '@src/firestoreFunctions';
import type { TravelerType } from '@src/types/travelers';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

const TravelerDetails: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TravelerDetails'>>();
  const returnToBooking = route.params?.returnToBooking;
  const itineraryForReturn = route.params?.itinerary;
  const [travelers, setTravelers] = useState<TravelerProfile[]>([]);

  const auth = getAuth();
  const user = auth.currentUser?.uid;

  //fetches traveler details from firebase
  const getTravelerTypeFromFirestore = (rawType: any): TravelerType | null => {
    if (rawType && typeof rawType === "object" && typeof rawType.type === "string") {
      return rawType.type as TravelerType;
    }
    if (typeof rawType === "string") {
      return rawType as TravelerType;
    }
    return null;
  };

  const fetchTravelers = async () => {
    try {
      const travelersRef = collection(db, 'Users', user, 'TravelerDetails');
      const travelersSnap = await getDocs(travelersRef);

      const fetchedTravelers: TravelerProfile[] = [];

      for (const doc of travelersSnap.docs) {
        const travelerID = doc.id;
        const travelerDetails = await getTravelerDetails(user, travelerID);
        if (travelerDetails) {
          const normalizedType = getTravelerTypeFromFirestore(travelerDetails.Type);
          if (!normalizedType) {
            console.warn("Traveler has invalid type, defaulting to Adult: ", travelerID, travelerDetails.Type);
          }
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
            type: normalizedType ?? "Adult", //adult as default for demo so it doesn't crash
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
    navigation.navigate('EditTraveler', { returnToBooking, itinerary: itineraryForReturn });
  };

  const handleEditTraveler = (traveler: TravelerProfile) => {
    navigation.navigate('EditTraveler', { traveler, returnToBooking, itinerary: itineraryForReturn });
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
    <SkyboundScreen showLogo>
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

      {travelers.length > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={handleAddTraveler}
          style={({ pressed }) => [styles.addButton, { backgroundColor: colors.link }, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <SkyboundText variant="primaryButton" size={16} accessabilityLabel="Add traveler button">
            Add Traveler
          </SkyboundText>
        </Pressable>
      )}

      <Pressable
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.returnButton,
          { borderColor: colors.link, backgroundColor: '#FFFFFF', opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <SkyboundText
          variant="primary"
          size={16}
          accessabilityLabel="Return to manage subscription"
          style={{ color: colors.link }}
        >
          Back
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

  returnButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.4,
  },
});

export default TravelerDetails;
