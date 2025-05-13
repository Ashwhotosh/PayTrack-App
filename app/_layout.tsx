// app/_layout.tsx
import { useEffect } from 'react';
import { Slot, SplashScreen, Stack, useRouter, useSegments } from 'expo-router'; // Import useRouter, useSegments
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';
import { AuthProvider, useAuth } from '@/context/authContext'; // Import AuthProvider and useAuth
import { ActivityIndicator, View } from 'react-native'; // For loading indicator

export { ErrorBoundary } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Hide splash screen once fonts are loaded OR if there's a font error (to show error boundary)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);


  if (!fontsLoaded && !fontError) {
    return null; // Keep splash screen visible
  }

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <LayoutController />
      </AuthProvider>
    </ApolloProvider>
  );
}

function LayoutController() {
  const { token, isLoading, isAppLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAppLoading || isLoading) return; // Still determining auth state or loading initial user

    const inAuthGroup = segments[0] === '(auth)';

    if (token && !inAuthGroup) {
      // User is authenticated but not in an auth screen (e.g., deep link to auth while logged in)
      // Or, initial load and token found, redirect to tabs
      router.replace('/(tabs)');
    } else if (!token && !inAuthGroup) {
      // User is not authenticated and not in an auth screen, redirect to login
      router.replace('/(auth)/login');
    }
  }, [token, segments, isLoading, router, isAppLoading]);

  // Show a global loading indicator while checking auth state or initial user fetch
  if (isAppLoading || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#8e44ad" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="payment-success" />
        <Stack.Screen name="transaction-details" />
        <Stack.Screen name="upi-payment" />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
  // Alternatively, use <Slot /> if you want expo-router to manage the stack based on auth state more directly
  // return <Slot />;
}