// app/(auth)/signup.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native'; // Added Platform
import { router } from 'expo-router';
import { UserPlus, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/context/authContext'; // Corrected import path if needed

// Import the generated hook and types
import { useSignupMutation, SignupMutationVariables, Gender } from '@/graphql/generated/graphql'; // Adjust path, import Gender if needed for SignupInput
import type { AuthUser } from '@/context/authContext'; // Keep your AuthUser type for the context


export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // Add more state for other SignupInput fields if you have them (e.g., phone, dob, gender)
  // const [phone, setPhone] = useState('');

  const { login: contextLogin } = useAuth();

  // Use the generated typed hook
  const [signupUser, { loading, error }] = useSignupMutation({
    onCompleted: async (data) => {
      // 'data' is now strongly typed as SignupMutation | null | undefined
      if (data?.signup?.token && data.signup.user) {
        // Ensure data.signup.user fields are compatible with AuthUser.
        // Your SIGNUP_MUTATION in operations.ts currently selects id, email, firstName, lastName.
        // If AuthUser needs more, update the GQL query.
        await contextLogin(data.signup.token, data.signup.user as AuthUser);
        router.replace('/(tabs)'); // Or '/(auth)/profile-setup'
      } else {
        Alert.alert('Signup Failed', 'Received an unexpected response from the server.');
      }
    },
    onError: (apolloError) => {
      console.error('Signup failed (ApolloError):', JSON.stringify(apolloError, null, 2));
      const errorMessage = apolloError.graphQLErrors?.[0]?.message ||
                           apolloError.networkError?.message ||
                           apolloError.message ||
                           'An unknown error occurred during signup.';
      Alert.alert('Signup Failed', errorMessage);
    },
  });

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !firstName.trim()) {
      Alert.alert('Validation Error', 'First Name, Email, and Password are required.');
      return;
    }
    if (password.length < 8) { // Example: basic password length validation
        Alert.alert('Validation Error', 'Password must be at least 8 characters long.');
        return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    // Prepare variables according to SignupMutationVariables (from generated types)
    // which is derived from your SignupInput type in GraphQL schema
    const variables: SignupMutationVariables = {
      input: {
        email: email.trim(),
        password: password,
        firstName: firstName.trim(),
        // Only include optional fields if they have a value
        ...(lastName.trim() && { lastName: lastName.trim() }),
        // Example for other optional fields (uncomment and add state if you use them):
        // ...(phone.trim() && { phone: phone.trim() }),
        // ...(selectedGender && { gender: selectedGender as Gender }), // Cast if selectedGender is string
        // ...(dobISOString && { dob: dobISOString }),
      },
    };

    try {
      await signupUser({ variables });
    } catch (e) {
      // This catch might not be strictly necessary if onError handles all Apollo Client errors
      console.error('Unexpected error during signupUser call:', e);
       if (!error) { // If Apollo's error state isn't already set
        Alert.alert('Signup Error', 'An unexpected issue occurred. Please try again.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <UserPlus color="#8e44ad" size={48} />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join PayApp today!</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="First Name*"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#666"
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name (Optional)"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#666"
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email*"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Password*"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password*"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />
        {/* Add more input fields here if your SignupInput requires them (phone, DoB, Gender etc.) */}

        {loading ? (
          <ActivityIndicator size="large" color="#8e44ad" style={styles.button} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        )}
        {error && !loading && <Text style={styles.errorText}>Signup failed. Please check your input or network.</Text>}

         <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 40 : 20, // Adjust padding for different platforms
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30, // Reduced margin a bit
    marginTop: 20, // Added some top margin
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
    paddingVertical: 15, // Consistent padding
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
  },
  button: {
    backgroundColor: '#8e44ad',
    borderRadius: 12,
    paddingVertical: 15, // Consistent padding
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    marginTop: 10, // Added some margin
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
    marginTop: 25, // Increased margin
    alignItems: 'center',
    paddingBottom: 20, // Ensure it's not cut off by ScrollView end
  },
  linkButtonText: {
    color: '#8e44ad',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});