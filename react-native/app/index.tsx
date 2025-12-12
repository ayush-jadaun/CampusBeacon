import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { storage } from '../utils/storage';
import { COLORS } from '../constants/theme';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      // Check if user has completed onboarding
      const onboardingCompleted = await storage.hasCompletedOnboarding();
      setHasCompletedOnboarding(onboardingCompleted);

      // Check if user is authenticated
      const token = await storage.getAuthToken();
      const userData = await storage.getUserData();
      setIsAuthenticated(!!(token && userData));
    } catch (error) {
      console.error('Error checking initial route:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Redirect based on state
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
