// app/_layout.tsx
import { useEffect } from 'react';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router'; // Removed Slot for now
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';
import { AuthProvider, useAuth } from '@/context/authContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native'; // Added StyleSheet

export { ErrorBoundary } from 'expo-router';

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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
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
  const { token, isLoading, isAppLoading, user } = useAuth(); // Added user for logging
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const currentRoute = segments.join('/') || 'index (at root)';
    // console.log(
    //   `LayoutCtrl useEffect | Token: ${token ? 'YES' : 'NO'} | isLoading: ${isLoading} | isAppLoading: ${isAppLoading} | User: ${user?.email || 'None'} | Segments: ${currentRoute}`
    // );

    // If we are still in the initial app loading phase (checking async storage, etc.)
    // or if a login/logout operation is actively in progress, wait.
    if (isAppLoading || isLoading) {
      // console.log('LayoutCtrl useEffect: Exit - App/Auth state still loading.');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    // console.log(`LayoutCtrl useEffect: In Auth Group? ${inAuthGroup}`);

    if (token) {
      // User is authenticated (token exists)
      if (inAuthGroup) {
        // Token exists, AND user is currently on an auth screen (e.g., login, signup)
        // This happens right after a successful login/signup. Redirect to main app.
        // console.log('LayoutCtrl useEffect: ACTION - Token exists, in auth group. Redirecting to /tabs');
        router.replace('/(tabs)');
      } else {
        // Token exists, and user is already outside auth group (e.g., on /tabs or a protected child route).
        // No redirect is generally needed from here unless you want to force them to a specific screen like /tabs
        // if they somehow landed on a non-auth, non-tabs screen while logged in.
        // For now, this case means they are likely where they should be.
        // console.log('LayoutCtrl useEffect: Token exists, NOT in auth group. No redirect needed from here.');
      }
    } else {
      // No token (user is not authenticated)
      if (!inAuthGroup) {
        // No token, AND user is NOT on an auth screen (e.g., tried to access /tabs directly or a protected route)
        // Redirect to login.
        console.log('LayoutCtrl useEffect: ACTION - No token, NOT in auth group. Redirecting to /login');
        router.replace('/(auth)/login');
      } else {
        // No token, AND user is already on an auth screen (e.g., login, signup).
        // This is the correct state, so no redirect needed.
        console.log('LayoutCtrl useEffect: No token, IS in auth group. No redirect needed.');
      }
    }
  }, [token, segments, isLoading, isAppLoading, router, user]); // Added user to dep array for logging clarity

  if (isAppLoading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e44ad" />
      </View>
    );
  }

  // If redirection logic is handled, this Stack will render based on current route
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="payment-success" />
        <Stack.Screen name="transaction-details" />
        <Stack.Screen name="upi-payment" />
        {/* The 'profile' group layout will handle its own screens if defined in app/profile/_layout.tsx */}
        {/* If profile screens are top-level and not in a group, list them here */}
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
});