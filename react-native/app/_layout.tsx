import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from '@/store';
import { AuthProvider } from '@/contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, View } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate
          loading={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          }
          persistor={persistor}
        >
          <AuthProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
            <Toast />
          </AuthProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
