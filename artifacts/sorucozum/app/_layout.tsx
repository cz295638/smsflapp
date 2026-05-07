import { View, Platform } from 'react-native';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider } from "../contexts/AuthContext";

// Açılış ekranını kilitliyoruz ki fontlar yüklenmeden uygulama beyaz ekran vermesin
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Hata durumunda sessizce devam et */
});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    // headerShown değerinin kesinlikle boolean (true/false) olduğundan emin oluyoruz
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Fontlar yüklendiğinde veya hata verdiğinde Splash Screen'i kapat
  useEffect(() => {
    if (fontsLoaded || fontError) {
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("Splash screen hide error:", e);
        }
      };
      hideSplash();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ErrorBoundary>
              <RootLayoutNav />
            </ErrorBoundary>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </View>
  );
}