import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, IndianRupee, Send, AlertCircle } from 'lucide-react-native';
import * as Linking from 'expo-linking';

interface ValidationErrors {
  upiId?: string;
  amount?: string;
}

export default function UpiPaymentScreen() {
  const params = useLocalSearchParams();
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (params.upiId) {
      setUpiId(params.upiId as string);
    }
  }, [params.upiId]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!upiId) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!upiId.includes('@')) {
      newErrors.upiId = 'Invalid UPI ID format';
    }

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const initiateUpiPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Construct UPI URI with all required parameters
      let upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}`;
      upiUri += `&pn=Recipient`; // Generic payee name
      upiUri += `&am=${encodeURIComponent(amount)}`;
      upiUri += `&cu=INR`; // Currency code for Indian Rupee

      if (note) {
        upiUri += `&tn=${encodeURIComponent(note)}`;
      }

      // Add transaction reference
      const transactionRefId = `PayApp_${Date.now()}`;
      upiUri += `&tr=${encodeURIComponent(transactionRefId)}`;

      if (Platform.OS === 'web') {
        Alert.alert(
          'Web Platform',
          'UPI payments are only supported on mobile devices. Please use the mobile app.',
          [{ text: 'OK' }]
        );
        return;
      }

      const supported = await Linking.canOpenURL(upiUri);
      
      if (supported) {
        await Linking.openURL(upiUri);
      } else {
        Alert.alert(
          'UPI App Not Found',
          'Please install a UPI-enabled payment app to proceed.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening UPI URI:', error);
      Alert.alert(
        'Payment Error',
        'Could not initiate UPI payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>UPI Payment</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>UPI ID</Text>
          <TextInput
            style={[styles.input, errors.upiId && styles.inputError]}
            value={upiId}
            onChangeText={(text) => {
              setUpiId(text);
              setErrors(prev => ({ ...prev, upiId: undefined }));
            }}
            placeholder="Enter UPI ID (e.g., user@bank)"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.upiId && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#FF5252" size={16} />
              <Text style={styles.errorText}>{errors.upiId}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={[styles.amountInput, errors.amount && styles.inputError]}>
            <IndianRupee color="#666" size={20} />
            <TextInput
              style={styles.inputWithIcon}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setErrors(prev => ({ ...prev, amount: undefined }));
              }}
              placeholder="Enter amount"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          {errors.amount && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#FF5252" size={16} />
              <Text style={styles.errorText}>{errors.amount}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
            placeholderTextColor="#666"
            multiline
          />
        </View>

        <TouchableOpacity 
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={initiateUpiPayment}
          disabled={isProcessing}
        >
          <Send color="#fff" size={24} />
          <Text style={styles.payButtonText}>
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    gap: 16,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  amountInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputWithIcon: {
    flex: 1,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  payButton: {
    backgroundColor: '#8e44ad',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});