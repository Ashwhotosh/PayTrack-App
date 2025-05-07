// app/upi-payment.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, IndianRupee, Send, AlertCircle } from 'lucide-react-native';
import * as Linking from 'expo-linking';

interface ValidationErrors {
  upiId?: string;
  amount?: string;
}

// Define a type for the UPI callback parameters
interface UpiCallbackParams {
  status?: string;
  txnId?: string;
  responseCode?: string;
  txnRef?: string; // Sometimes 'txnRef' or 'tr' is used for transaction reference
  [key: string]: string | undefined; // Allow other potential parameters
}

export default function UpiPaymentScreen() {
  const params = useLocalSearchParams();
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatusInfo, setPaymentStatusInfo] = useState<string | null>(null);

  // Your app's scheme and callback path
  const APP_SCHEME = "myapp";
  const UPI_CALLBACK_PATH = "upi/payment"; // e.g., myapp://upi/payment

  useEffect(() => {
    if (params.upiId) {
      setUpiId(params.upiId as string);
    }
  }, [params.upiId]);

  // Effect to handle deep linking for UPI callback
  useEffect(() => {
    const handleDeepLink = (event: { url: string } | null) => {
      if (!event || !event.url) {
        return;
      }

      const parsedUrl = Linking.parse(event.url);
      console.log('Parsed Deep Link URL:', JSON.stringify(parsedUrl, null, 2));

      // Check if the deep_link is for a UPI payment callback
      // The hostname might be 'upi' and path 'payment' if your data scheme is 'myapp://upi/payment'
      // Or path could be 'upi/payment' if hostname is null from parse.
      // Let's check for scheme and path
      if (parsedUrl.scheme === APP_SCHEME && parsedUrl.path === UPI_CALLBACK_PATH) {
        const queryParams = parsedUrl.queryParams as UpiCallbackParams | null;

        if (queryParams) {
          const status = queryParams.status || queryParams.Status;
          const txnId = queryParams.txnId || queryParams.TransactionId;
          const responseCode = queryParams.responseCode || queryParams.txnRef; // txnRef might be the original transaction ID

          let message = `Payment Status: ${status || 'N/A'}\n`;
          message += `Transaction ID: ${txnId || 'N/A'}\n`;
          message += `Response Code: ${responseCode || 'N/A'}`;

          setPaymentStatusInfo(message); // Update state to show info on screen
          Alert.alert('UPI Payment Callback', message);

          // You can navigate to a payment status screen or update UI accordingly
          // For example:
          // router.replace({
          //   pathname: '/payment-status',
          //   params: { status, txnId, responseCode }
          // });
        } else {
          Alert.alert('UPI Payment Callback', 'Received callback but no parameters found.');
        }
      } else {
        console.log("Received URL that is not a UPI callback:", event.url);
      }
    };

    // Listen for incoming deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (if app was opened via deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    }).catch(err => console.error('Error getting initial URL:', err));

    // Cleanup listener on unmount
    return () => {
      subscription.remove();
    };
  }, []); // Empty dependency array ensures this runs once on mount

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
    setPaymentStatusInfo(null); // Clear previous status

    try {
      // Construct UPI URI with all required parameters
      let upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}`;
      upiUri += `&pn=Recipient Name`; // Payee Name (Mandatory) - Use a placeholder or actual name
      upiUri += `&am=${encodeURIComponent(amount)}`;
      upiUri += `&cu=INR`; // Currency code for Indian Rupee

      if (note) {
        upiUri += `&tn=${encodeURIComponent(note)}`; // Transaction Note (Optional)
      }

      // Transaction Reference ID (Mandatory for some PSPs, good practice)
      //This tr should be unique for each transaction.
      const transactionRefId = `TrackPay_${Date.now()}`;
      upiUri += `&tr=${encodeURIComponent(transactionRefId)}`; // Merchant Transaction Reference ID


      // *** Add your app's callback URL ***
      const callbackUrl = `${APP_SCHEME}://${UPI_CALLBACK_PATH}`; // e.g., myapp://upi/payment
      upiUri += `&url=${encodeURIComponent(callbackUrl)}`;

      // Optional: Merchant Code (mc) if you have one and it's needed by the QR or PSP
      // upiUri += `&mc=YOUR_MERCHANT_CODE`;

      console.log("Attempting to open UPI URI:", upiUri);


      if (Platform.OS === 'web') {
        Alert.alert(
          'Web Platform',
          'UPI payments are only supported on mobile devices. Please use the mobile app.',
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }

      const supported = await Linking.canOpenURL(upiUri);
      
      if (supported) {
        await Linking.openURL(upiUri);
        // Note: App will go to background. The callback will bring it to foreground.
        // setIsProcessing might not be reset here if navigation is immediate.
        // Status will be handled by the deep link listener.
      } else {
        Alert.alert(
          'UPI App Not Found',
          'No UPI app is installed or available to handle the payment. Please install a UPI-enabled payment app to proceed.',
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error opening UPI URI:', error);
      Alert.alert(
        'Payment Error',
        'Could not initiate UPI payment. Please try again.',
        [{ text: 'OK' }]
      );
      setIsProcessing(false);
    }
    // We don't set setIsProcessing(false) here if openURL is successful,
    // as the app will switch and the callback listener will handle the result.
    // If openURL fails immediately, then we should reset it.
    // The 'supported' check handles the case where no app is found. For other errors, it's already in catch.
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

        {paymentStatusInfo && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Payment Update:</Text>
            <Text style={styles.statusText}>{paymentStatusInfo}</Text>
          </View>
        )}

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

// Add new styles for status display, or modify existing ones
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60, // Adjusted for typical status bar height
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
    paddingVertical: 16, // Ensure consistent padding with other inputs
    paddingLeft: 8, // Add some space from the icon
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
  // Styles for displaying payment status
  statusContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8e44ad',
  },
  statusTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#ddd',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});