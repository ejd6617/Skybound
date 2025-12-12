import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import SkyboundCard from '@components/ui/SkyboundCard';
import SkyboundScreen from '@components/ui/SkyboundScreen';
import SkyboundText from '@components/ui/SkyboundText';
import { useColors } from '@constants/theme';
import type { RootStackParamList } from '@src/nav/RootNavigator';

const actions = [
  {
    title: 'FAQs',
    description: 'Browse common booking and account questions.',
    icon: 'help-circle-outline',
    route: 'FAQ',
  },
  {
    title: 'Contact Us',
    description: 'Send a message to the Skybound support crew.',
    icon: 'mail-outline',
    route: 'Contact',
  },
  {
    title: 'AI Chat',
    description: 'Talk with Skybound AI for instant assistance.',
    icon: 'chatbubble-ellipses-outline',
    route: 'Chat',
  },
] as const;

const GetHelp: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SkyboundScreen
      subtitle="We want to help you. Choose the best way to reach us."
      showLogo
    >
      {actions.map((action) => (
        <Pressable
          key={action.title}
          accessibilityRole="button"
          onPress={() => navigation.navigate(action.route)}
        >
          <SkyboundCard>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(47,151,255,0.12)' }]}> 
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={24} color={colors.link} />
              </View>
              <View style={{ flex: 1 }}>
                <SkyboundText variant="primaryBold" size={16} accessabilityLabel={`${action.title} title`}>
                  {action.title}
                </SkyboundText>
                <SkyboundText variant="secondary" size={13} accessabilityLabel={`${action.title} description`}>
                  {action.description}
                </SkyboundText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </View>
          </SkyboundCard>
        </Pressable>
      ))}
    </SkyboundScreen>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GetHelp;
