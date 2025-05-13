// app/payment-success.tsx
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share2, Copy, ChevronDown, CheckCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';

// Import generated hooks and types
import {
  useGetAvailableCategoriesQuery,
  useUpdateTransactionCategoryMutation,
  useGetRealtimeCategorySuggestionLazyQuery, // Import the lazy query hook
  // Specific types can be imported if needed for explicit casting or complex logic,
  // but often the hook inference is sufficient.
  // e.g., GetAvailableCategoriesQuery, UpdateTransactionCategoryMutation, GetRealtimeCategorySuggestionQuery
} from '@/graphql/generated/graphql'; // Adjust path if needed

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();

  // --- State ---
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<string | null>(null);

  // --- Local Params ---
  const amount = params.amount as string;
  const upiId = params.upiId as string;
  const transactionId = params.transactionId as string; // Crucial for fetching suggestion
  const referenceNo = params.referenceNo as string | undefined;

  // --- GraphQL Hooks ---
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } =
    useGetAvailableCategoriesQuery(); // Hook for available categories

  const [updateCategory, { loading: updateLoading, error: updateError }] =
    useUpdateTransactionCategoryMutation(); // Hook for updating category

  const [
    fetchAiSuggestion,
    { data: aiSuggestionData, loading: aiSuggestionLoading, error: aiSuggestionError },
  ] = useGetRealtimeCategorySuggestionLazyQuery({ // Lazy query for AI suggestion
    onCompleted: (suggestionData: any) => {
      if (suggestionData?.getRealtimeCategorySuggestion?.category &&
          suggestionData.getRealtimeCategorySuggestion.category !== "Error" && // Check for AI service errors
          suggestionData.getRealtimeCategorySuggestion.category !== "Error: Prediction Failed" &&
          suggestionData.getRealtimeCategorySuggestion.category !== "Error: Artifacts Unavailable" &&
          suggestionData.getRealtimeCategorySuggestion.category !== "Error: Preprocessing Failed" ) {
        const suggestedCat = suggestionData.getRealtimeCategorySuggestion.category;
        setAiSuggestedCategory(suggestedCat);
        if (!selectedCategory) { // Only pre-fill if user hasn't manually selected yet
            setSelectedCategory(suggestedCat);
        }
      } else if (suggestionData?.getRealtimeCategorySuggestion?.category) {
        // Handle specific "Error" categories from AI service if needed, e.g., log them
        console.warn("AI Suggestion Error:", suggestionData.getRealtimeCategorySuggestion.category);
      }
    },
    onError: (error: any) => {
      console.error("Error fetching AI category suggestion:", error.message);
      // Optionally inform user, but don't block categorization
    }
  });

  // --- Effects ---
  // Fetch AI suggestion when transactionId is available
  useEffect(() => {
    if (transactionId) {
      fetchAiSuggestion({ variables: { transactionId } });
    }
  }, [transactionId, fetchAiSuggestion]);

  // --- Event Handlers ---
  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setShowCategoriesModal(false);
    if (transactionId) {
      try {
        const { data: updateData } = await updateCategory({ variables: { transactionId, category } });
        if (updateData?.updateTransactionCategory) {
          console.log(`Category for tx ${transactionId} updated to: ${updateData.updateTransactionCategory.category}`);
        }
      } catch (e: any) {
        console.error("Failed to update category:", JSON.stringify(e, null, 2));
        Alert.alert("Error Updating Category", e.message || "Could not update category.");
      }
    }
  };

  // --- Derived Data ---
  const recipientName = upiId?.split('@')[0] || 'Recipient';
  const formattedAmount = parseFloat(amount || '0').toFixed(2);
  const currentDate = new Date();
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formattedDate = currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const transactionRefDisplay = referenceNo || ('TXN' + (transactionId?.substring(3) || Date.now()));
  const availableCategories = categoriesData?.availableTransactionCategories || [];

  // --- Loading State ---
  // Consider a more granular loading state if categories and AI suggestion load at different times
  const isLoadingInitialData = (categoriesLoading && !categoriesData) || (aiSuggestionLoading && !aiSuggestedCategory && transactionId);

  if (isLoadingInitialData) {
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
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Paid Successfully</Text>
        <TouchableOpacity>
          <Share2 color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
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
            disabled={categoriesLoading || availableCategories.length === 0 || updateLoading || aiSuggestionLoading}
          >
            <Text style={styles.categoryButtonText}>
              {selectedCategory || 
               (aiSuggestionLoading && transactionId ? 'Getting suggestion...' : 
               (categoriesLoading ? 'Loading categories...' : 
               (availableCategories.length === 0 ? 'No Categories' : 'Select Category')))}
            </Text>
            <ChevronDown color="#666" size={20} />
          </TouchableOpacity>
        </View>

        {categoriesError && <Text style={styles.errorText}>Error loading categories: {categoriesError.message}</Text>}
        {aiSuggestionError && <Text style={styles.errorText}>Could not get AI suggestion: {aiSuggestionError.message}</Text>}
        {updateError && <Text style={styles.errorText}>Error updating category: {updateError.message}</Text>}


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
              <Text style={styles.detailValueRightAlign}>{transactionRefDisplay}</Text>
              <TouchableOpacity>
                <Copy color="#8e44ad" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showCategoriesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoriesModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowCategoriesModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {(updateLoading || categoriesLoading) && <ActivityIndicator color="#8e44ad" style={{ marginBottom: 10 }} />}
            <ScrollView>
              {availableCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.modalOption,
                    selectedCategory === category && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  disabled={updateLoading}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedCategory === category && styles.modalOptionTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
              {availableCategories.length === 0 && !categoriesLoading && (
                <Text style={styles.modalOptionText}>No categories available.</Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Styles (mostly same as before, ensure they are complete in your actual file)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  loadingText: { color: '#fff', marginTop: 10, fontFamily: 'Inter-Regular' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 60, paddingBottom: 10, },
  title: { fontSize: 20, color: '#fff', fontFamily: 'Inter-SemiBold' },
  contentContainer: { flexGrow: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 20 },
  amountSection: { alignItems: 'center', marginVertical: 30, },
  successIcon: { marginBottom: 16 },
  amountText: { fontSize: 40, color: '#fff', fontFamily: 'Inter-Bold', marginBottom: 8 },
  paidToText: { fontSize: 16, color: '#ccc', fontFamily: 'Inter-Regular' },
  categorySection: { marginBottom: 24 },
  categoryLabel: { fontSize: 14, color: '#aaa', fontFamily: 'Inter-Regular', marginBottom: 8 },
  categoryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2a2a2a', padding: 16, borderRadius: 12 },
  categoryButtonText: { fontSize: 16, color: '#fff', fontFamily: 'Inter-Regular' },
  detailsCard: { backgroundColor: '#2a2a2a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333333' },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 14, color: '#999', fontFamily: 'Inter-Regular' },
  detailValueRightAlign: { fontSize: 14, color: '#fff', fontFamily: 'Inter-SemiBold', textAlign: 'right' },
  referenceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doneButton: { backgroundColor: '#8e44ad', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  doneButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter-SemiBold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#2a2a2a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, color: '#fff', fontFamily: 'Inter-Bold', marginBottom: 16, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#3a3a3a' },
  modalOptionSelected: { backgroundColor: '#8e44ad30' },
  modalOptionText: { fontSize: 16, color: '#fff', fontFamily: 'Inter-Regular', textAlign: 'center' },
  modalOptionTextSelected: { fontFamily: 'Inter-SemiBold', color: '#8e44ad' },
  errorText: { color: '#FF5252', textAlign: 'center', marginBottom: 10, fontFamily: 'Inter-Regular' },
});