// app/(auth)/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/context/authContext'; // Corrected import path if AuthContext is in src/context

// Import the generated hook and potentially the specific mutation type for clarity
// The LoginMutation and LoginMutationVariables types are inferred by useLoginMutation,
// but importing them can be useful for explicit typing if needed elsewhere or for readability.
import { useLoginMutation, LoginMutationVariables } from '@/graphql/generated/graphql'; // Adjust path as needed
import type { AuthUser } from '@/context/authContext'; // Keep your AuthUser type for the context


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login: contextLogin } = useAuth();

  // Use the generated typed hook
  // No need to pass LOGIN_MUTATION string or manual types LoginData/LoginVars here
  const [loginUser, { loading, error }] = useLoginMutation({
    onCompleted: async (data) => {
      // 'data' is now strongly typed as LoginMutation | null | undefined
       console.log("LOGIN SUCCEEDED - onCompleted called with data:", JSON.stringify(data, null, 2)); // <<< ADD THIS
      if (data?.login?.token && data.login.user) {
        // Important: Ensure the fields selected in your LOGIN_MUTATION in operations.ts
        // and returned by data.login.user are compatible with your AuthUser type.
        // If AuthUser expects more fields than `id, email, firstName, lastName` (from your GQL operation),
        // you'll need to update the LOGIN_MUTATION in operations.ts to select those fields.
        // The `as AuthUser` cast assumes compatibility. For stricter safety, ensure fields match.
        await contextLogin(data.login.token, data.login.user as AuthUser);
        router.replace('/(tabs)');
      } else {
        // This case implies the mutation succeeded but didn't return expected data,
        // which shouldn't happen if the mutation is defined correctly and the server behaves.
        Alert.alert('Login Failed', 'Received an unexpected response from the server.');
      }
    },
    onError: (apolloError) => { // ApolloError type from @apollo/client
      console.error('Login failed (ApolloError):', JSON.stringify(apolloError, null, 2));
      // Extract user-friendly message
      const errorMessage = apolloError.graphQLErrors?.[0]?.message ||
                           apolloError.networkError?.message || // Handle network errors
                           apolloError.message ||
                           'An unknown error occurred during login.';
      Alert.alert('Login Failed', errorMessage);
    },
  });

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Email and password are required.');
      return;
    }

    // Variables are automatically type-checked against LoginMutationVariables
    const variables: LoginMutationVariables = {
      input: { email: email.trim(), password: password },
    };

    try {
      // The actual logic of handling response is now in onCompleted/onError
      await loginUser({ variables });
    } catch (e) {
      // This catch block might not be strictly necessary if onCompleted/onError handle all cases,
      // but can catch unexpected issues during the mutate call itself.
      // Apollo Client's useMutation hook handles promise rejection, usually surfaced in `error` or `onError`.
      console.error('Unexpected error during loginUser call:', e);
      if (!error) { // If Apollo's error state isn't already set (e.g. synchronous error)
        Alert.alert('Login Error', 'An unexpected issue occurred. Please try again.');
      }
    }
  };

  const handleGoToSignup = () => {
    // Ensure you have a signup screen at this route or adjust as needed
    router.push('/(auth)/signup');
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Mail color="#8e44ad" size={48} />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to your PayApp account</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#8e44ad" style={styles.button} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}
        {/* Error display can be simplified if Alerts are preferred, or kept for inline feedback */}
        {error && !loading && <Text style={styles.errorText}>Login failed. Please check your credentials or network.</Text>}

        <TouchableOpacity onPress={handleGoToSignup} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 10,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
  },
  button: {
    backgroundColor: '#8e44ad',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'Inter-Regular',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#8e44ad',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  }
});