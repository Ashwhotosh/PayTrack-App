// FILE: app/_layout.tsx

import { useEffect, useState } from 'react';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';
import { AuthProvider, useAuth } from '@/context/authContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import chatbot components
import Chatbot from '@/components/Chatbot';
import ChatbotFAB from '@/components/ChatbotFAB';

// Import the new query hook
import { useGetUserDataForChatbotLazyQuery } from '@/graphql/generated/graphql';

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
  const { token, isLoading, isAppLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // State for chatbot
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [chatbotContext, setChatbotContext] = useState<string | null>(null);

  // --- Data Fetching for Chatbot ---
  const [fetchUserDataForChatbot, { loading: chatbotContextLoading, error: chatbotContextError }] = useGetUserDataForChatbotLazyQuery({
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.me && data.transactions) {
        // Format the data into the desired JSON structure
        const structuredData = {
          personalDetails: data.me,
          transactionHistory: data.transactions,
        };
        // Convert the object to a JSON string and store it in state
        const jsonContext = JSON.stringify(structuredData, null, 2);
        setChatbotContext(jsonContext);
        console.log('Chatbot context successfully loaded.');
      }
    },
    onError: (error) => {
      console.error('Failed to load data for chatbot context:', error.message);
      // If fetching fails, the context will remain null, and the chatbot will operate without it.
    },
  });

  // Effect to fetch user data for the chatbot once the user is authenticated.
  useEffect(() => {
    // Fetch data only if there's a token and we haven't already fetched it.
    if (token && !chatbotContext && !chatbotContextLoading) {
      fetchUserDataForChatbot();
    }
    // If user logs out, clear the context.
    if (!token && chatbotContext) {
      setChatbotContext(null);
    }
  }, [token, chatbotContext, chatbotContextLoading, fetchUserDataForChatbot]);


  // --- Redirection Logic (unchanged) ---
  useEffect(() => {
    if (isAppLoading || isLoading) {
      return;
    }
    const inAuthGroup = segments[0] === '(auth)';
    if (token) {
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    } else {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [token, segments, isLoading, isAppLoading, router, user]);

  if (isAppLoading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e44ad" />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';
  const showChatbotUI = token && !inAuthGroup;

  return (
    <View style={styles.rootContainer}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="payment-success" />
        <Stack.Screen name="transaction-details" />
        <Stack.Screen name="upi-payment" />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />

      {showChatbotUI && (
        <>
            <ChatbotFAB onPress={() => setIsChatbotVisible(true)} />
            <Chatbot
              visible={isChatbotVisible}
              onClose={() => setIsChatbotVisible(false)}
              // Pass the user data context to the chatbot component
              userContext={chatbotContext}
            />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
});