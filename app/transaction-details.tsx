// app/transaction-details.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, Modal, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Receipt, Share2, Flag, ChevronDown } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';

// Import generated hooks and types
import {
  useGetTransactionDetailsQuery,
  useGetAvailableCategoriesQuery, // For fetching categories
  useUpdateTransactionCategoryMutation, // For updating the category
  TransactionType as GqlTransactionType,
  TransactionFlow, // Import the TransactionFlow enum if you're using it directly for styling
} from '@/graphql/generated/graphql'; // Ensure this path is correct

// Helper to get a placeholder icon URL
const getPlaceholderIcon = (name?: string | null) => {
    const initial = name ? name[0].toUpperCase() : 'T';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=3a3a3a&color=fff&size=128&font-size=0.5`;
};


export default function TransactionDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // --- State for Category Editing ---
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

  // --- GraphQL Hooks ---
  const { data: transactionData, loading: transactionLoading, error: transactionError, refetch: refetchTransactionDetails } = useGetTransactionDetailsQuery({
    variables: { id: id || '' },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => { // Pre-fill selectedCategory when transaction data loads
      if (data?.transaction?.category) {
        setSelectedCategory(data.transaction.category);
      } else if (data?.transaction) {
        setSelectedCategory(null); // Explicitly set to null if not categorized
      }
    }
  });

  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } =
    useGetAvailableCategoriesQuery();

  const [updateCategoryMutation, { loading: updateCategoryLoading, error: updateCategoryError }] =
    useUpdateTransactionCategoryMutation();

  const transaction = transactionData?.transaction;

  // --- Effect to update selectedCategory if transaction changes ---
  useEffect(() => {
    if (transaction?.category) {
      setSelectedCategory(transaction.category);
    } else if (transaction) { // If transaction exists but has no category
      setSelectedCategory(null);
    }
  }, [transaction?.category, transaction?.id]); // Depend on transaction.id too, to reset if transaction changes


  // --- Event Handlers ---
  const handleCategorySelect = async (category: string) => {
    if (!id) return;
    setShowCategoriesModal(false); // Close modal first

    // Optimistic update for UI
    const previousCategory = selectedCategory;
    setSelectedCategory(category);

    try {
      const { data: updateData, errors: gqlErrors } = await updateCategoryMutation({
        variables: { transactionId: id, category: category },
        // Optional: Refetch transaction details after update or update cache
        // refetchQueries: [{ query: GET_TRANSACTION_DETAILS_QUERY, variables: { id } }],
      });

      if (gqlErrors && gqlErrors.length > 0) {
        console.error("GraphQL errors updating category:", JSON.stringify(gqlErrors, null, 2));
        Alert.alert("Error Updating Category", gqlErrors.map(e => e.message).join('\n'));
        setSelectedCategory(previousCategory); // Revert optimistic update
      } else if (updateData?.updateTransactionCategory) {
        console.log(`Category for tx ${id} successfully updated to: ${updateData.updateTransactionCategory.category}`);
        // The selectedCategory is already set. If you refetch, it will update naturally.
        // If not refetching, ensure the local state is definitely what was saved:
        setSelectedCategory(updateData.updateTransactionCategory.category);
        // Optionally refetch to ensure all data is fresh
        if(refetchTransactionDetails) refetchTransactionDetails();

      } else {
        console.warn("Category update mutation returned no data and no GraphQL errors.");
        setSelectedCategory(previousCategory); // Revert
      }
    } catch (e: any) {
      console.error("Network/Exception Failed to update category:", JSON.stringify(e, null, 2));
      Alert.alert("Error Updating Category", e.message || "Could not update category.");
      setSelectedCategory(previousCategory); // Revert
    }
  };


  if (transactionLoading && !transactionData) { // Show loading only on initial fetch
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (transactionError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading transaction: {transactionError.message}</Text>
        <TouchableOpacity style={styles.genericActionButton} onPress={() => router.back()}>
            <Text style={styles.genericActionText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Transaction not found.</Text>
         <TouchableOpacity style={styles.genericActionButton} onPress={() => router.back()}>
            <Text style={styles.genericActionText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Process data for display ---
  let merchantNameOrPayee = transaction.notes || 'N/A';
  let paymentMethodDisplay = transaction.transactionType.toString(); // Use paymentMethod from GQL
  let iconUrl = getPlaceholderIcon(merchantNameOrPayee);
  let referenceDisplay = 'N/A';

  if (transaction.transactionType === GqlTransactionType.Upi && transaction.upiDetails) {
    merchantNameOrPayee = transaction.upiDetails.payeeName;
    iconUrl = getPlaceholderIcon(merchantNameOrPayee);
    paymentMethodDisplay = `UPI from ${transaction.upiDetails.payerUpiAccount?.displayName || transaction.upiDetails.payerUpiAccount?.upiId || 'UPI Account'}`;
    referenceDisplay = transaction.upiDetails.payeeUpiId;
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

  const amountValue = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : 0;
  
  // Use the 'flow' field from GraphQL
  const isCredit = transaction.flow === TransactionFlow.Credit; // Or 'CREDIT' string if not using enum type directly

  const displayAmount = amountValue; // Amount from backend is already positive magnitude
  const amountStyle = isCredit ? styles.positiveAmount : styles.negativeAmount;
  const amountPrefix = isCredit ? '+₹' : '-₹';
  const status = "Completed";

  const availableCategories = categoriesData?.availableTransactionCategories || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 20}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={updateCategoryLoading}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
        <TouchableOpacity disabled={updateCategoryLoading}>
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
        {/* Category Row - Clickable */}
        <TouchableOpacity
          style={styles.detailRow}
          onPress={() => setShowCategoriesModal(true)}
          disabled={categoriesLoading || updateCategoryLoading || availableCategories.length === 0}
        >
          <Text style={styles.detailLabel}>Category</Text>
          <View style={styles.categoryValueContainer}>
            <Text style={[
                styles.detailValue,
                selectedCategory === null && styles.notCategorizedText
            ]}>
              {updateCategoryLoading ? 'Saving...' : (selectedCategory || 'Not Categorized')}
            </Text>
            {!updateCategoryLoading && <ChevronDown color="#8e44ad" size={16} style={{ marginLeft: 5 }}/>}
            {updateCategoryLoading && <ActivityIndicator size="small" color="#8e44ad" style={{ marginLeft: 5 }} />}
          </View>
        </TouchableOpacity>
        {categoriesError && <Text style={styles.inlineErrorText}>Error: {categoriesError.message}</Text>}
        {updateCategoryError && <Text style={styles.inlineErrorText}>Error: {updateCategoryError.message}</Text>}


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
        <TouchableOpacity style={styles.actionButton} disabled={updateCategoryLoading}>
          <Receipt color="#8e44ad" size={24} />
          <Text style={styles.actionText}>Download Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.reportButton]} disabled={updateCategoryLoading}>
          <Flag color="#FF5252" size={24} />
          <Text style={[styles.actionText, styles.reportText]}>Report Issue</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Modal */}
      {/* Categories Modal */}
{showCategoriesModal && (
  <Modal
    visible
    transparent
    animationType="slide"
    onRequestClose={() => setShowCategoriesModal(false)}
  >
    {/* 
      The outer Pressable is our backdrop.
      Tapping it will close the modal.
    */}
    <Pressable
      style={styles.modalOverlay}
      onPress={() => setShowCategoriesModal(false)}
    >
      {/* 
        The inner Pressable is our content container.
        We call stopPropagation so taps here do NOT bubble up.
      */}
      <Pressable
        style={styles.modalContent}
        onPress={(e: any) => e.stopPropagation()}
      >
        <Text style={styles.modalTitle}>Select Category</Text>
        {categoriesLoading && (
          <ActivityIndicator color="#8e44ad" style={{ marginBottom: 10 }} />
        )}
        <ScrollView>
          {availableCategories.map((categoryName) => (
            <TouchableOpacity
              key={categoryName}
              style={[
                styles.modalOption,
                selectedCategory === categoryName && styles.modalOptionSelected,
              ]}
              onPress={() => handleCategorySelect(categoryName)}
              disabled={updateCategoryLoading}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  selectedCategory === categoryName && styles.modalOptionTextSelected,
                ]}
              >
                {categoryName}
              </Text>
            </TouchableOpacity>
          ))}
          {availableCategories.length === 0 && !categoriesLoading && (
            <Text style={styles.modalOptionText}>
              No categories available.
            </Text>
          )}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
)}

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
    marginBottom: 15,
  },
  inlineErrorText: {
    color: '#FF5252',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    paddingVertical: 5,
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
    backgroundColor: '#3a3a3a',
  },
  amount: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
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
    color: '#4CAF50',
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed to center for category icon
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginRight: 10,
  },
  detailValue: {
    fontSize: 14,
    color: '#e0e0e0',
    fontFamily: 'Inter-SemiBold',
    flexShrink: 1,
    textAlign: 'right',
  },
  categoryValueContainer: { // For category text and icon
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    justifyContent: 'flex-end',
  },
  notCategorizedText: {
    color: '#888', // Dimmer color for "Not Categorized"
    fontFamily: 'Inter-Regular',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
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
  genericActionButton: { // For standalone back/retry buttons
    backgroundColor: '#8e44ad',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  genericActionText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // SafeArea for bottom
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(142, 68, 173, 0.2)', // Lighter selection color
  },
  modalOptionText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    fontFamily: 'Inter-SemiBold',
    color: '#8e44ad',
  },
});