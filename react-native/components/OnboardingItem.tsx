import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface OnboardingItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    lottieUrl: any;
    backgroundColor: string;
  };
}

export default function OnboardingItem({ item }: OnboardingItemProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.animationContainer}>
        <LottieView
          source={item.lottieUrl}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  animationContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
    maxWidth: 350,
    maxHeight: 350,
  },
  contentContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SIZES.lg,
  },
});
