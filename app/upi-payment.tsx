// app/upi-payment.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, IndianRupee, Send, CircleAlert as AlertCircle } from 'lucide-react-native';

// Import generated hooks and types
import {
  TransactionType,
  useCreateTransactionMutation,
  useGetMyUpiAccountsQuery,
  // Explicitly import variable and result types for clarity if desired,
  // though often inferred correctly by the typed hooks.
  // CreateTransactionMutation, // Result type for createTransaction
  // CreateTransactionMutationVariables, // Variables type for createTransaction
  // GetMyUpiAccountsQuery, // Result type for getMyUpiAccounts
} from '@/graphql/generated/graphql'; // Adjust path if needed

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
  const [selectedPayerAccountId, setSelectedPayerAccountId] = useState<string | null>(null);

  // Use generated hook for fetching UPI accounts
  const { data: upiAccountsData, loading: upiAccountsLoading, error: upiAccountsError } =
    useGetMyUpiAccountsQuery(); // Typed hook

  // Use generated hook for creating a transaction
  const [createTransaction, { loading: createTransactionLoading, error: createTransactionError }] =
    useCreateTransactionMutation(); // Typed hook

  useEffect(() => {
    if (params.upiId && typeof params.upiId === 'string') {
      setUpiId(params.upiId);
    }
  }, [params.upiId]);

  useEffect(() => {
    if (upiAccountsData?.myUpiAccounts && upiAccountsData.myUpiAccounts.length > 0 && !selectedPayerAccountId) {
      setSelectedPayerAccountId(upiAccountsData.myUpiAccounts[0].id);
    }
  }, [upiAccountsData, selectedPayerAccountId]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!upiId.trim()) newErrors.upiId = 'UPI ID is required';
    else if (!upiId.includes('@')) newErrors.upiId = 'Invalid UPI ID format';

    if (!amount.trim()) newErrors.amount = 'Amount is required';
    else if (isNaN(Number(amount)) || Number(amount) <= 0) newErrors.amount = 'Please enter a valid amount';

    if (!selectedPayerAccountId) {
        Alert.alert("Payment Account Error", "No paying account is selected or available.");
        return false;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm() || !selectedPayerAccountId) {
      return;
    }

    try {
      const numericAmount = parseFloat(amount); // GQL `Decimal` scalar might expect number or string.
                                                // Your resolver handles `new PrismaDecimal(amount.toString())`
                                                // So sending number here is fine.

      // Variables are type-checked by CreateTransactionMutationVariables (inferred)
      const response = await createTransaction({
        variables: {
          input: {
            amount: numericAmount, // Or amount.toString() if your Decimal scalar strictly wants string
            transactionType: TransactionType.Upi, // This should match your GraphQL enum 'TransactionType.Upi'
                                    // The generated type for transactionType in CreateTransactionInput is 'TransactionType' enum
            payerAccountId: selectedPayerAccountId,
            notes: note.trim() || null,
            upiDetails: {
              payeeName: upiId.split('@')[0]?.trim() || upiId.trim(),
              payeeUpiId: upiId.trim(),
            },
          },
        },
      });

      // response.data is typed as CreateTransactionMutation | null | undefined
      const createdTx = response.data?.createTransaction;

      if (createdTx) {
        // Note: `initialSuggestedCategory` was removed from CreateTransactionMutation result type
        // in graphql.tsx based on the operations.ts provided.
        // If you re-add it to operations.ts and re-run codegen, you can access it here.
        // For now, we won't pass it.
        router.replace({
          pathname: '/payment-success',
          params: {
            amount: createdTx.amount.toString(), // amount is 'any' from generated type, convert for param
            upiId: upiId.trim(),
            note: createdTx.notes || '',
            transactionId: createdTx.id,
            // initialSuggestedCategory: createdTx.initialSuggestedCategory || '', // REMOVED FOR NOW
            referenceNo: 'REF' + createdTx.id.substring(3),
          },
        });
      } else {
        // This means mutation succeeded but `createTransaction` was null in the response, or data was null
        throw new Error(createTransactionError?.message || "Transaction creation returned no data.");
      }
    } catch (error: any) {
      console.error('Payment processing error:', JSON.stringify(error, null, 2));
      const gqlErrorMsg = error.graphQLErrors?.[0]?.message || error.message;
      Alert.alert(
        'Payment Error',
        gqlErrorMsg || 'Could not process payment. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // --- Loading and Error States ---
  if (upiAccountsLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading payment options...</Text>
      </View>
    );
  }

  if (upiAccountsError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading payment accounts: {upiAccountsError.message}</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/')}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!upiAccountsData?.myUpiAccounts || upiAccountsData.myUpiAccounts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>No UPI accounts found.</Text>
        <Text style={styles.infoText}>Please add a UPI account in your profile to make payments.</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => router.push('/profile/payment-methods')}>
          <Text style={styles.goBackButtonText}>Add Account</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const selectedAccount = upiAccountsData.myUpiAccounts.find(acc => acc.id === selectedPayerAccountId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>UPI Payment</Text>
      </View>

      <ScrollView style={styles.formContent} contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Paying From</Text>
          <View style={styles.input}>
            <Text style={styles.payerAccountText}>
              {selectedAccount ? `${selectedAccount.displayName} (${selectedAccount.upiId})` : 'Select Account'}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>UPI ID</Text>
          <TextInput
            style={[styles.input, !!errors.upiId && styles.inputError]}
            value={upiId}
            onChangeText={(text) => { setUpiId(text); if (errors.upiId) setErrors(prev => ({ ...prev, upiId: undefined })); }}
            placeholder="Enter UPI ID (e.g., user@bank)"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {errors.upiId && <View style={styles.errorContainer}><AlertCircle color="#FF5252" size={16} /><Text style={styles.errorText}>{errors.upiId}</Text></View>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={[styles.amountInputContainer, !!errors.amount && styles.inputError]}>
            <IndianRupee color="#666" size={20} />
            <TextInput
              style={styles.inputWithIcon}
              value={amount}
              onChangeText={(text) => { setAmount(text); if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined })); }}
              placeholder="Enter amount"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          {errors.amount && <View style={styles.errorContainer}><AlertCircle color="#FF5252" size={16} /><Text style={styles.errorText}>{errors.amount}</Text></View>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note for recipient or self"
            placeholderTextColor="#666"
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.payButton, (createTransactionLoading || !selectedPayerAccountId) && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={createTransactionLoading || !selectedPayerAccountId}
        >
          {createTransactionLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send color="#fff" size={24} />
              <Text style={styles.payButtonText}>Pay Now</Text>
            </>
          )}
        </TouchableOpacity>
        {createTransactionError && <Text style={[styles.errorText, { textAlign: 'center', marginTop: 15 }]}>Payment failed: {createTransactionError.graphQLErrors?.[0]?.message || createTransactionError.message}</Text>}
      </ScrollView>
    </View>
  );
}

// Styles (same as your previous version)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#1a1a1a' },
  loadingText: { color: '#fff', marginTop: 10, fontFamily: 'Inter-Regular' },
  infoText: { color: '#ccc', marginTop: 8, fontFamily: 'Inter-Regular', textAlign: 'center' },
  formContent: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 60, paddingBottom: 10, gap: 16 },
  title: { fontSize: 20, color: '#fff', fontFamily: 'Inter-SemiBold' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#fff', fontFamily: 'Inter-SemiBold', marginBottom: 8 },
  input: { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, fontFamily: 'Inter-Regular' },
  inputError: { borderWidth: 1, borderColor: '#FF5252' },
  amountInputContainer: { backgroundColor: '#2a2a2a', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, },
  inputWithIcon: { flex: 1, paddingVertical: 16, paddingLeft: 8, color: '#fff', fontSize: 16, fontFamily: 'Inter-Regular' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  errorText: { color: '#FF5252', fontSize: 13, fontFamily: 'Inter-Regular' },
  payButton: { backgroundColor: '#8e44ad', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter-SemiBold' },
  goBackButton: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 25, backgroundColor: '#8e44ad', borderRadius: 8 },
  goBackButtonText: { color: '#fff', fontFamily: 'Inter-SemiBold', fontSize: 16 },
  payerAccountText: { color: '#e0e0e0', fontSize: 16, fontFamily: 'Inter-Regular' },
});