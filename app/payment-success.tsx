// app/payment-success.tsx
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  Copy,
  ChevronDown,
  CheckCircle,
} from 'lucide-react-native';
import { useState, useEffect } from 'react';

// Import generated hooks and types
import {
  useGetAvailableCategoriesQuery,
  useUpdateTransactionCategoryMutation,
  useGetRealtimeCategorySuggestionLazyQuery,
} from '@/graphql/generated/graphql'; // Adjust path if needed

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();

  // --- State ---
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<string | null>(
    null
  ); // Store the raw AI suggestion

  // --- Local Params ---
  const amount = params.amount as string;
  const upiId = params.upiId as string;
  const transactionId = params.transactionId as string;
  const referenceNo = params.referenceNo as string | undefined;

  // --- GraphQL Hooks ---
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useGetAvailableCategoriesQuery();

  const [
    updateCategoryMutation,
    { error: updateMutationError, loading: updateMutationLoading },
  ] = useUpdateTransactionCategoryMutation();

  // --- Helper for updating category ---
  const performCategoryUpdate = async (categoryToSave: string) => {
    if (!transactionId) {
      console.warn('No transactionId, cannot update category.');
      return;
    }
    if (!categoryToSave) {
      console.warn('No category to save.');
      return;
    }
    // updateMutationLoading will be true while this is in flight, managed by Apollo Client.

    console.log(
      `Attempting to update category to: ${categoryToSave} for tx: ${transactionId}`
    );
    try {
      const { data: updateData, errors: gqlErrors } =
        await updateCategoryMutation({
          variables: { transactionId, category: categoryToSave },
        });

      if (gqlErrors && gqlErrors.length > 0) {
        console.error(
          'GraphQL errors updating category:',
          JSON.stringify(gqlErrors, null, 2)
        );
        Alert.alert(
          'Error Updating Category',
          gqlErrors.map((e) => e.message).join('\n')
        );
      } else if (updateData?.updateTransactionCategory) {
        console.log(
          `Category for tx ${transactionId} successfully updated to: ${updateData.updateTransactionCategory.category}`
        );
        // Ensure UI reflects what was saved, though setSelectedCategory should precede this call.
        if (selectedCategory !== categoryToSave) {
          setSelectedCategory(categoryToSave);
        }
      } else {
        // This case might occur if the mutation response is unexpected (e.g., no data and no errors but not success)
        console.warn(
          'Category update mutation returned no data and no GraphQL errors. Check backend response structure or resolver logic.'
        );
        // Potentially Alert.alert("Notice", "Category update status unclear. Please check details later.");
      }
    } catch (e: any) {
      // Network errors or other exceptions from Apollo Client
      console.error(
        'Network/Exception Failed to update category:',
        JSON.stringify(e, null, 2)
      );
      Alert.alert(
        'Error Updating Category',
        e.message || 'Could not update category due to a network issue.'
      );
    }
    // updateMutationLoading will automatically become false when the mutation promise resolves or rejects.
  };

  // --- AI Suggestion Logic ---
  const [
    fetchAiSuggestion,
    {
      data: aiSuggestionData,
      loading: aiSuggestionLoading,
      error: aiSuggestionError,
    },
  ] = useGetRealtimeCategorySuggestionLazyQuery({
    onCompleted: (suggestionData) => {
      const suggestedCat =
        suggestionData?.getRealtimeCategorySuggestion?.category;
      // More robust check for valid, non-error suggestion strings
      const isValidSuggestion =
        suggestedCat &&
        ![
          'Error',
          'Error: Prediction Failed',
          'Error: Artifacts Unavailable',
          'Error: Preprocessing Failed',
        ].includes(suggestedCat);

      if (isValidSuggestion) {
        setAiSuggestedCategory(suggestedCat); // Store the raw AI suggestion

        // Only auto-select and trigger backend update if the user hasn't manually picked one yet.
        if (!selectedCategory && suggestedCat) {
          // Double check suggestedCat for truthiness
          setSelectedCategory(suggestedCat); // Update UI
          performCategoryUpdate(suggestedCat); // Update Backend
        }
      } else if (suggestedCat) {
        // AI returned a known "Error" string or other unhandled value
        console.warn(
          'AI Suggestion Error or non-actionable category:',
          suggestedCat
        );
      }
      // If suggestionData or category is null/undefined, aiSuggestionError (if network/GraphQL error) should catch it, or nothing happens.
    },
    onError: (error) => {
      console.error('Error fetching AI category suggestion:', error.message);
    },
  });

  // --- Effects ---
  // Fetch AI suggestion when transactionId is available and we haven't tried yet / don't have one.
  useEffect(() => {
    if (transactionId && !aiSuggestedCategory && !aiSuggestionLoading) {
      fetchAiSuggestion({ variables: { transactionId } });
    }
  }, [
    transactionId,
    aiSuggestedCategory,
    fetchAiSuggestion,
    aiSuggestionLoading,
  ]);

  // --- Event Handlers ---
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoriesModal(false);
    performCategoryUpdate(category);
  };

  const handleDonePress = () => {
    if (updateMutationLoading) {
      Alert.alert(
        'Saving...',
        'Please wait while the category is being saved.'
      );
      return;
    }
    router.replace('/(tabs)');
  };

  // --- Derived Data ---
  const recipientName = upiId?.split('@')[0] || 'Recipient';
  const formattedAmount = parseFloat(amount || '0').toFixed(2);
  const currentDate = new Date();
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const formattedDate = currentDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const transactionRefDisplay =
    referenceNo || 'TXN' + (transactionId?.substring(3) || Date.now());
  // Ensure categories are strings and filter out any nulls that might come from GraphQL if not careful with schema
  const availableCategories =
    (categoriesData?.availableTransactionCategories?.filter(
      (cat) => typeof cat === 'string'
    ) as string[]) || [];

  // --- Loading State for initial screen setup ---
  const isLoadingInitialScreenData =
    (categoriesLoading && !categoriesData) ||
    (aiSuggestionLoading &&
      !selectedCategory &&
      !aiSuggestedCategory &&
      transactionId);

  if (isLoadingInitialScreenData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading details & suggestions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          disabled={updateMutationLoading}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Paid Successfully</Text>
        <TouchableOpacity disabled={updateMutationLoading}>
          <Share2 color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.amountSection}>
          <CheckCircle color="#4CAF50" size={64} style={styles.successIcon} />
          <Text style={styles.amountText}>₹{formattedAmount}</Text>
          <Text style={styles.paidToText}>Paid to {recipientName}</Text>
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>Categorize this transaction:</Text>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setShowCategoriesModal(true)}
            disabled={
              categoriesLoading ||
              availableCategories.length === 0 ||
              aiSuggestionLoading ||
              updateMutationLoading
            }
          >
            <Text style={styles.categoryButtonText}>
              {selectedCategory ||
                (aiSuggestionLoading
                  ? 'Getting suggestion...'
                  : categoriesLoading
                  ? 'Loading categories...'
                  : availableCategories.length === 0
                  ? 'No Categories'
                  : 'Select Category')}
            </Text>
            {updateMutationLoading && (
              <ActivityIndicator
                size="small"
                color="#ccc"
                style={{ marginLeft: 10 }}
              />
            )}
            {!updateMutationLoading && <ChevronDown color="#666" size={20} />}
          </TouchableOpacity>
        </View>

        {categoriesError && (
          <Text style={styles.errorText}>
            Error loading categories: {categoriesError.message}
          </Text>
        )}
        {aiSuggestionError && (
          <Text style={styles.errorText}>
            Could not get AI suggestion: {aiSuggestionError.message}
          </Text>
        )}
        {updateMutationError && (
          <Text style={styles.errorText}>
            Error updating category: {updateMutationError.message}
          </Text>
        )}

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>To</Text>
            <Text style={styles.detailValueRightAlign}>{upiId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValueRightAlign}>{formattedTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValueRightAlign}>{formattedDate}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Reference No.</Text>
            <View style={styles.referenceContainer}>
              <Text style={styles.detailValueRightAlign}>
                {transactionRefDisplay}
              </Text>
              <TouchableOpacity>
                <Copy color="#8e44ad" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDonePress}
          disabled={updateMutationLoading}
        >
          {updateMutationLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.doneButtonText}>Done</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showCategoriesModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!updateMutationLoading) setShowCategoriesModal(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => {
            if (!updateMutationLoading) setShowCategoriesModal(false);
          }}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {/* Show categoriesLoading indicator only if it's truly for categories, not confused with updateMutationLoading */}
            {categoriesLoading && (
              <ActivityIndicator color="#8e44ad" style={{ marginBottom: 10 }} />
            )}
            <ScrollView>
              {availableCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.modalOption,
                    selectedCategory === category && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  disabled={updateMutationLoading || categoriesLoading}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedCategory === category &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
              {availableCategories.length === 0 && !categoriesLoading && (
                <Text style={styles.modalOptionText}>
                  No categories available.
                </Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: { color: '#fff', marginTop: 10, fontFamily: 'Inter-Regular' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 10,
  },
  title: { fontSize: 20, color: '#fff', fontFamily: 'Inter-SemiBold' },
  contentContainer: { flexGrow: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 20 },
  amountSection: { alignItems: 'center', marginVertical: 30 },
  successIcon: { marginBottom: 16 },
  amountText: {
    fontSize: 40,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  paidToText: { fontSize: 16, color: '#ccc', fontFamily: 'Inter-Regular' },
  categorySection: { marginBottom: 24 },
  categoryLabel: {
    fontSize: 14,
    color: '#aaa',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    minHeight: 50 /* For indicator space */,
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  detailsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 14, color: '#999', fontFamily: 'Inter-Regular' },
  detailValueRightAlign: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
  },
  referenceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doneButton: {
    backgroundColor: '#8e44ad',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    minHeight: 50,
    justifyContent: 'center',
  },
  doneButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter-SemiBold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
  modalOptionSelected: { backgroundColor: 'rgba(142, 68, 173, 0.2)' }, // Lighter selection color
  modalOptionText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  modalOptionTextSelected: { fontFamily: 'Inter-SemiBold', color: '#8e44ad' }, // Main purple for selected text
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
  },
});
