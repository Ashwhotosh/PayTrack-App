// app/transaction-details.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Receipt, Share2, Flag } from 'lucide-react-native'; // Removed Download for now
import { format, parseISO } from 'date-fns';

// Import generated hook and types
import {
  useGetTransactionDetailsQuery,
  Transaction as GqlTransaction, // Renaming for clarity if needed
  TransactionType as GqlTransactionType,
} from '@/graphql/generated/graphql';

// Helper to get a placeholder icon URL (can be moved to a utils file)
const getPlaceholderIcon = (name?: string | null) => {
    const initial = name ? name[0].toUpperCase() : 'T';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=3a3a3a&color=fff&size=128&font-size=0.5`;
};


export default function TransactionDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Type the id param

  const { data, loading, error } = useGetTransactionDetailsQuery({
    variables: { id: id || '' }, // Ensure id is a string, provide fallback if id can be undefined initially
    skip: !id, // Skip query if id is not available
    fetchPolicy: 'cache-and-network',
  });

  const transaction = data?.transaction;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading transaction: {error.message}</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
            <Text style={styles.actionText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Transaction not found.</Text>
         <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
            <Text style={styles.actionText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Process data for display ---
  let merchantNameOrPayee = transaction.notes || 'N/A';
  let paymentMethodDisplay = transaction.transactionType.toString(); // Fallback
  let iconUrl = getPlaceholderIcon(merchantNameOrPayee);
  let referenceDisplay = 'N/A';

  if (transaction.transactionType === GqlTransactionType.Upi && transaction.upiDetails) {
    merchantNameOrPayee = transaction.upiDetails.payeeName;
    iconUrl = getPlaceholderIcon(merchantNameOrPayee);
    paymentMethodDisplay = `UPI from ${transaction.upiDetails.payerUpiAccount?.displayName || transaction.upiDetails.payerUpiAccount?.upiId || 'UPI Account'}`;
    referenceDisplay = transaction.upiDetails.payeeUpiId; // Or a specific ref if available
  } else if (transaction.transactionType === GqlTransactionType.Card && transaction.cardDetails) {
    merchantNameOrPayee = transaction.cardDetails.payeeMerchantName;
    iconUrl = getPlaceholderIcon(merchantNameOrPayee);
    paymentMethodDisplay = `${transaction.cardDetails.payerCardAccount?.cardType || 'Card'} ending in ${transaction.cardDetails.payerCardAccount?.cardLast4Digits || 'XXXX'}`;
  } else if (transaction.transactionType === GqlTransactionType.NetBanking && transaction.netBankingDetails) {
    merchantNameOrPayee = transaction.netBankingDetails.payeeName;
    iconUrl = getPlaceholderIcon(merchantNameOrPayee);
    paymentMethodDisplay = `Net Banking from ${transaction.netBankingDetails.payerBankAccount?.bankName || 'Bank'} (${transaction.netBankingDetails.payerBankAccount?.accountNumberLast4 || 'YYYY'})`;
    referenceDisplay = transaction.netBankingDetails.referenceId;
  }

  const amountValue = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : typeof transaction.amount === 'number' ? transaction.amount : 0;
  
  // Determine transaction nature (credit/debit) - this logic needs to be robust
  // For now, assume positive means credit (e.g. salary) and other types are debits,
  // or rely on category. This should ideally come from backend or a clear amount sign.
  let isCredit = false;
  if (transaction.category?.toLowerCase() === 'salary' || transaction.category?.toLowerCase() === 'income') {
      isCredit = true;
  } else if (amountValue > 0 && (transaction.transactionType !== GqlTransactionType.Upi && transaction.transactionType !== GqlTransactionType.Card && transaction.transactionType !== GqlTransactionType.NetBanking /* add other expense types */) ) {
      // Heuristic: if amount is positive AND not a typical expense type, assume credit.
      // This is weak. Best to have a clear indicator from backend.
      // For now, let's assume all non-categorized as income are debits if amount is positive.
      // So if amount is positive for a payment, we'll show it as debit with Math.abs()
  }
  // If your `amount` from backend is signed (negative for debit), then:
  // const isCredit = amountValue >= 0;
  // const displayAmount = Math.abs(amountValue);

  const displayAmount = Math.abs(amountValue);
  const amountStyle = isCredit ? styles.positiveAmount : styles.negativeAmount;
  const amountPrefix = isCredit ? '+₹' : '-₹';
  const status = "Completed"; // Assuming all fetched transactions are completed for now

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 20}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
        <TouchableOpacity>
          {/* TODO: Implement Share functionality */}
          <Share2 color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.amountCard}>
        <Image source={{ uri: iconUrl }} style={styles.merchantIcon} />
        <Text style={[styles.amount, amountStyle]}>
          {amountPrefix}{displayAmount.toFixed(2)}
        </Text>
        <Text style={styles.description} numberOfLines={1}>{merchantNameOrPayee}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time</Text>
          <Text style={styles.detailValue}>
            {format(parseISO(transaction.timestamp as string), 'dd MMM yyyy, hh:mm a')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{transaction.category || 'Not Categorized'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method</Text>
          <Text style={styles.detailValue}>{paymentMethodDisplay}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID</Text>
          <Text style={styles.detailValue}>{transaction.id}</Text>
        </View>
        {referenceDisplay !== 'N/A' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{transaction.transactionType === GqlTransactionType.NetBanking ? 'Reference ID' : 'Payee UPI'}</Text>
            <Text style={styles.detailValue}>{referenceDisplay}</Text>
          </View>
        )}
         <View style={[styles.detailRow, {borderBottomWidth: 0}]}>
            <Text style={styles.detailLabel}>Notes</Text>
            <Text style={styles.detailValue}>{transaction.notes || 'No notes'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Receipt color="#8e44ad" size={24} />
          <Text style={styles.actionText}>Download Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.reportButton]}>
          <Flag color="#FF5252" size={24} />
          <Text style={[styles.actionText, styles.reportText]}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  amountCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  merchantIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 16,
    backgroundColor: '#3a3a3a', // Fallback
  },
  amount: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  positiveAmount: { // Add this style
    color: '#4CAF50',
  },
  negativeAmount: { // Add this style
    color: '#FF5252',
  },
  description: {
    fontSize: 18,
    color: '#e0e0e0',
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#4CAF50', // Assuming 'Completed' status is positive
    fontFamily: 'Inter-SemiBold',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 16,
  },
  section: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    paddingHorizontal: 20, // Add horizontal padding inside the card
    paddingVertical: 10,   // Add vertical padding inside the card
    borderRadius: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // For potentially multiline values
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a', // Slightly lighter border
  },
  detailLabel: {
    fontSize: 14, // Slightly smaller
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginRight: 10, // Add some space
  },
  detailValue: {
    fontSize: 14, // Slightly smaller
    color: '#e0e0e0', // Lighter white
    fontFamily: 'Inter-SemiBold',
    flexShrink: 1, // Allow value to wrap if long
    textAlign: 'right',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 30, // More space at bottom
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10, // Increased gap
  },
  actionText: {
    fontSize: 16,
    color: '#8e44ad',
    fontFamily: 'Inter-SemiBold',
  },
  reportButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  reportText: {
    color: '#FF5252',
  },
});