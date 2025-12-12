import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import OnboardingItem from '@/components/OnboardingItem';
import Paginator from '@/components/Paginator';
import { ONBOARDING_DATA } from '@/constants/onboarding';
import { storage } from '@/utils/storage';
import { COLORS, SIZES } from '@/constants/theme';

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await storage.setOnboardingCompleted();
    router.replace('/(auth)/login');
  };

  const handleSkip = async () => {
    await storage.setOnboardingCompleted();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Skip Button */}
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Onboarding Slides */}
      <View style={styles.slidesContainer}>
        <FlatList
          data={ONBOARDING_DATA}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <Paginator data={ONBOARDING_DATA} scrollX={scrollX} />

        <TouchableOpacity
          style={styles.nextButton}
          onPress={scrollTo}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.md,
  },
  skipButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
  },
  skipText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  slidesContainer: {
    flex: 3,
  },
  bottomContainer: {
    flex: 0.5,
    paddingHorizontal: SIZES.xl,
    paddingBottom: SIZES.xl,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
