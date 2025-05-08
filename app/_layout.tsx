// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, SplashScreen, useRouter } from 'expo-router'; // Import SplashScreen, useRouter
import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady'; // Assuming this can be simplified or handled differently
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
// Import your auth context or state management here if you have one
// For example: import { useAuth } from '@/context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const { isAuthenticated, isLoading: authIsLoading } = useAuth(); // Example auth state
  const router = useRouter();

  // const { isReady } = useFrameworkReady(); // If this hook is for general readiness

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    // if (isReady && (fontsLoaded || fontError) && !authIsLoading) { // Example with more checks
    if (fontsLoaded || fontError) { // Simplified: hide splash when fonts are ready
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]); // Add other dependencies like isReady, authIsLoading if used

  // ---- START: Optional - Automatic Auth Redirect Logic ----
  // This is a common pattern. If you handle this differently (e.g., initialRouteName or manually), adapt or remove.
  // For this to work, you'd need an `isAuthenticated` state.
  // const isAuthenticated = false; // Replace with your actual auth state
  // const authChecked = true; // Replace with a state that confirms auth check has completed

  // useEffect(() => {
  //   if (!fontsLoaded || !authChecked) { // Ensure fonts are loaded and auth status is known
  //     return;
  //   }

  //   if (isAuthenticated) {
  //     // User is authenticated, ensure they are in the main app part
  //     router.replace('/(tabs)'); // Go to the home tab or any default screen in (tabs)
  //   } else {
  //     // User is not authenticated, ensure they are in the auth flow
  //     router.replace('/(auth)/phone-login'); // Go to login
  //   }
  // }, [isAuthenticated, authChecked, fontsLoaded, router]);
  // ---- END: Optional - Automatic Auth Redirect Logic ----


  if (!fontsLoaded && !fontError) {
    return null; // Return null while fonts are loading to keep splash screen visible
  }

  // If you have the auth redirect logic above, the Stack below just defines available routes.
  // If not, the initial route will be determined by Expo Router's conventions (e.g. first screen).
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Group for authentication screens */}
        <Stack.Screen name="(auth)" />

        {/* Group for main app tab screens */}
        <Stack.Screen name="(tabs)" />

        {/* Group for profile stack screens (e.g., edit profile, wallet) */}
        {/* This is correctly defined as a directory `app/profile/` with its own `_layout.tsx` */}
        <Stack.Screen name="profile" /> 
        
        {/* Individual top-level screens, presented in the root stack */}
        <Stack.Screen name="notifications" />
        <Stack.Screen name="transaction-details" />
        <Stack.Screen name="transactions" />
        <Stack.Screen name="upi-payment" />
        
        {/* +not-found is handled by convention, no need to list it as a Stack.Screen here */}
        {/* <Stack.Screen name="+not-found" /> */}
      </Stack>
      <StatusBar style="light" />
    </>
  );
}