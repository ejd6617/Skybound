import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import { auth, db } from "../../firebase";

// Ensure this path is correct based on your project structure
import airportInfoData from '@assets/airports.json';

// --- Types ---

// The structure of the raw JSON data
interface AirportData {
  iata: string;
  city: string;
  name: string;
  country: string;
}

// The structure used in your preferences
interface AirportChip {
  code: string;
  city: string;
}

// Cast the import to the correct type
const airportInfo = airportInfoData as AirportData[];

const AirportPreference: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // --- State ---
  const [departures, setDepartures] = useState<AirportChip[]>([]);
  const [arrivals, setArrivals] = useState<AirportChip[]>([]);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeList, setActiveList] = useState<'departures' | 'arrivals' | null>(null);

  // --- Firebase Loading Logic (Preserved) ---
  useEffect(() => {
    async function loadPrefs() {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      const docRef = doc(db, "Users", uid, "airportPreferences", "prefs");
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setDepartures(data.departures || []);
        setArrivals(data.arrivals || []);
      }
      setPrefsLoaded(true);
    }
    loadPrefs();
  }, []);

  // --- Firebase Saving Logic (Preserved) ---
  useEffect(() => {
    async function savePrefs() {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      const docRef = doc(db, "Users", uid, "airportPreferences", "prefs");
      try {
        await setDoc(docRef, {
          departures,
          arrivals,
          updatedAt: new Date(),
        });
        Alert.alert("Preferences saved", "Airport preference updated successfully");
        setHasUserEdited(false);
      } catch (error) {
        console.log(error);
        Alert.alert("Save failed", "We could not save your airport preference. Please try again.");
      }
    }

    if (prefsLoaded && hasUserEdited) {
      savePrefs();
    }
  }, [departures, arrivals, prefsLoaded, hasUserEdited]);

  // --- Actions ---

  const removeChip = (list: AirportChip[], setter: (chips: AirportChip[]) => void, code: string) => {
    setter(list.filter((chip) => chip.code !== code));
    setHasUserEdited(true);
  };

  const openSearchModal = (type: 'departures' | 'arrivals') => {
    setActiveList(type);
    setSearchText('');
    setIsModalVisible(true);
  };

  const handleSelectAirport = (airport: AirportData) => {
    if (!activeList) return;

    const newChip: AirportChip = { code: airport.iata, city: airport.city || airport.name };

    if (activeList === 'departures') {
      // Prevent duplicates
      if (!departures.find(d => d.code === newChip.code)) {
        setDepartures(prev => [...prev, newChip]);
        setHasUserEdited(true);
      } else {
        Alert.alert("Already added", `${newChip.code} is already in your list.`);
      }
    } else {
      // Prevent duplicates
      if (!arrivals.find(a => a.code === newChip.code)) {
        setArrivals(prev => [...prev, newChip]);
        setHasUserEdited(true);
      } else {
        Alert.alert("Already added", `${newChip.code} is already in your list.`);
      }
    }

    setIsModalVisible(false);
  };

  // --- Computed Data ---
  
  // Filter airports based on search text. 
  // Memoized to prevent heavy calculation on every render.
  const filteredAirports = useMemo(() => {
    if (!searchText) return [];
    
    const lowerText = searchText.toLowerCase();
    
    return airportInfo.filter(item => 
      item.iata.toLowerCase().includes(lowerText) ||
      (item.city && item.city.toLowerCase().includes(lowerText)) ||
      (item.name && item.name.toLowerCase().includes(lowerText))
    ).slice(0, 50); // Limit to 50 results for performance
  }, [searchText]);

  // --- Sub-Components ---

  const renderSection = (
    title: string,
    chips: AirportChip[],
    setter: (chips: AirportChip[]) => void,
    type: 'departures' | 'arrivals',
    ctaLabel: string
  ) => (
    <SkyboundCard key={title}>
      <SkyboundText variant="primaryBold" size={18} accessabilityLabel={`${title} title`}>
        {title}
      </SkyboundText>
      <View style={styles.chipContainer}>
        {chips.map((chip) => (
          <Pressable
            key={chip.code}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
            onPress={() => removeChip(chips, setter, chip.code)}
            accessibilityRole="button"
          >
            <SkyboundText variant="primary" size={13} accessabilityLabel={`${chip.code} chip`}>
              {chip.code} · {chip.city}
            </SkyboundText>
            <Ionicons name="close" size={14} color={colors.icon} />
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => openSearchModal(type)}
        style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.8 }]}
      >
        <Ionicons name="add-circle" size={20} color={colors.link} />
        <SkyboundText variant="blue" size={14} accessabilityLabel={ctaLabel}>
          {ctaLabel}
        </SkyboundText>
      </Pressable>
    </SkyboundCard>
  );

  return (
    <SkyboundScreen
      title="Airport Preferences"
      subtitle="Set your favorite departure and arrival airports for smarter deal alerts."
      showLogo
    >
      {renderSection('Preferred Departure Airports', departures, setDepartures, 'departures', 'Add Departure Airport')}
      {renderSection('Preferred Arrival Airports', arrivals, setArrivals, 'arrivals', 'Add Arrival Airport')}
      
      <SkyboundCard muted elevate={false}>
        <SkyboundText variant="secondary" size={13} accessabilityLabel="Preference description">
          We use these airports to send personalized deal notifications on the dashboard and in your inbox. Adjust them anytime.
        </SkyboundText>
      </SkyboundCard>

      {/* Return button */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [
          styles.returnButton,
          { opacity: pressed ? 0.9 : 1, backgroundColor: "#6B7280" },
        ]}
      >
        <SkyboundText
          variant="primary"
          size={16}
          accessabilityLabel="Return to manage subscription"
          style={{ color: "white" }}
        >
          Back
        </SkyboundText>
      </Pressable>

      {/* --- Search Modal --- */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet" // Looks great on iOS
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <SkyboundText variant="primaryBold" size={20}>
                Select Airport
              </SkyboundText>
              <Pressable onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close-circle" size={28} color="#6B7280" />
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by city or code (e.g. NYC, LHR)"
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
                autoFocus={true}
                clearButtonMode="while-editing"
              />
            </View>

            <FlatList
              data={filteredAirports}
              keyExtractor={(item) => item.iata}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <Pressable 
                  style={({pressed}) => [styles.resultItem, pressed && styles.resultItemPressed]} 
                  onPress={() => handleSelectAirport(item)}
                >
                  <View style={styles.codeBadge}>
                    <SkyboundText variant="primaryBold" size={14}>{item.iata}</SkyboundText>
                  </View>
                  <View style={styles.resultText}>
                     <SkyboundText variant="primary" size={16}>{item.city || item.name}</SkyboundText>
                     <SkyboundText variant="secondary" size={12}>{item.country}</SkyboundText>
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={
                searchText.length > 0 ? (
                  <View style={styles.emptyState}>
                    <SkyboundText variant="secondary" size={14}>No airports found.</SkyboundText>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                     <SkyboundText variant="secondary" size={14}>Type to search airports...</SkyboundText>
                  </View>
                )
              }
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  addRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  returnButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#6B7280",
    marginTop: 20, 
  },
  // --- Modal Styles ---
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    margin: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8, // slight adjustment for TextInput height
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: 40, 
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultItemPressed: {
    backgroundColor: '#F9FAFB',
  },
  codeBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  resultText: {
    flex: 1,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
});

export default AirportPreference;