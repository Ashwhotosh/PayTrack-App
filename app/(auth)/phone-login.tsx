// app/(auth)/phone-login.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Phone } from 'lucide-react-native';

export default function PhoneLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = () => {
    // TODO: Implement OTP sending logic
    setOtpSent(true);
  };

  const handleVerifyOTP = () => {
    // TODO: Implement OTP verification logic
    router.replace('/(auth)/profile-setup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Phone color="#8e44ad" size={48} />
        <Text style={styles.title}>Welcome to PayApp</Text>
        <Text style={styles.subtitle}>Enter your phone number to continue</Text>
      </View>

      <View style={styles.form}>
        {!otpSent ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
              <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 10,
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});