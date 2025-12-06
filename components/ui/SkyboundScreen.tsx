import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { useColors } from '@constants/theme';
import SkyboundText from './SkyboundText';

interface SkyboundScreenProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAccessory?: React.ReactNode;
  footer?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Partial<ScrollViewProps>;
  scrollable?: boolean;
  showLogo?: boolean;
  containerProps?: ViewProps;
}

const SkyboundScreen: React.FC<SkyboundScreenProps> = ({
  title,
  subtitle,
  children,
  headerAccessory,
  footer,
  contentContainerStyle,
  scrollViewProps,
  scrollable = true,
  showLogo = false,
  containerProps,
}) => {
  const colors = useColors();
  const ContainerComponent = scrollable ? ScrollView : View;
  const containerPropsToPass = scrollable
    ? {
        contentContainerStyle: [styles.contentContainer, contentContainerStyle],
        showsVerticalScrollIndicator: false,
        ...scrollViewProps,
      }
    : {
        style: [styles.contentContainer, contentContainerStyle],
      };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <LinearGradient
        colors={colors.gradient}
        start={colors.gradientStart}
        end={colors.gradientEnd}
        style={styles.gradient}
      >
        <ContainerComponent {...(containerPropsToPass as ScrollViewProps & ViewProps)}>
          {(title || subtitle) && (
            <View style={styles.header}>
              <View style={styles.headerTextWrapper}>
                {title && (
                  <SkyboundText
                    variant="primaryBold"
                    size={28}
                    accessabilityLabel={`Screen title ${title}`}
                  >
                    {title}
                  </SkyboundText>
                )}
                {subtitle && (
                  <SkyboundText
                    variant="secondary"
                    size={14}
                    style={styles.subtitle}
                    accessabilityLabel={`Screen subtitle ${subtitle}`}
                  >
                    {subtitle}
                  </SkyboundText>
                )}
              </View>
              {headerAccessory}
            </View>
          )}

          <View {...containerProps}>
            {children}
            {footer}
            {showLogo && (
              <View style={styles.logoContainer}>
                <Image
                  source={require('@assets/images/skybound-logo-white.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        </ContainerComponent>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  headerTextWrapper: {
    flex: 1,
  },
  subtitle: {
    marginTop: 6,
  },
  logoContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 48,
  },
});

export default SkyboundScreen;
