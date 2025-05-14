// app/transactions.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, Filter, ChevronDown } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns'; // For date formatting

// Import generated hook and types
import {
  useGetDashboardTransactionsQuery, // Or your specific query hook for all transactions
  Transaction as GqlTransaction, // Assuming 'Transaction' is the type from your GQL schema
  TransactionFlow, // Enum for CREDIT/DEBIT
  TransactionType as GqlPaymentMethod, // Enum for UPI/CARD/NET_BANKING
} from '@/graphql/generated/graphql';

// Define the structure for your local state transactions list
interface DisplayTransaction {
  id: string;
  merchantNameOrPayee: string;
  amount: number; // Parsed amount
  flow: TransactionFlow; // CREDIT or DEBIT
  paymentMethod: GqlPaymentMethod; // UPI, CARD, NET_BANKING
  date: string; // Formatted date string
  category?: string | null;
  // logo?: string; // If you have logo logic
}

const ITEMS_PER_PAGE = 20;

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  // const [filterOptions, setFilterOptions] = useState({}); // TODO: Implement filter state & UI
  const [offset, setOffset] = useState(0);

  const { data, loading, error, fetchMore, refetch } =
    useGetDashboardTransactionsQuery({
      variables: {
        limit: ITEMS_PER_PAGE,
        offset: 0,
        // dateFrom: null, // Add date filters if implementing
        // dateTo: null,
        // filterType: null, // Add payment method filter if implementing
      },
      fetchPolicy: 'cache-and-network',
      // notifyOnNetworkStatusChange: true, // Useful for fetchMore loading state
    });

  const [displayTransactions, setDisplayTransactions] = useState<
    DisplayTransaction[]
  >([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [canFetchMore, setCanFetchMore] = useState(true);

  const processGqlTransactions = (
    gqlTransactions: GqlTransaction[]
  ): DisplayTransaction[] => {
    return gqlTransactions.map((tx) => {
      let merchantName = tx.notes || 'Unknown Transaction';
      if (tx.upiDetails?.payeeName) {
        // Prefer backend derived
        merchantName = tx.upiDetails.payeeName;
      } else if (tx.upiDetails?.payeeName) {
        merchantName = tx.upiDetails.payeeName;
      } else if (tx.cardDetails?.payeeMerchantName) {
        merchantName = tx.cardDetails.payeeMerchantName;
      } else if (tx.netBankingDetails?.payeeName) {
        merchantName = tx.netBankingDetails.payeeName;
      }

      return {
        id: tx.id,
        merchantNameOrPayee: merchantName,
        amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : 0,
        flow: tx.flow,
        paymentMethod: tx.transactionType, // Or tx.transactionType if you didn't rename in GQL
        date: format(parseISO(tx.timestamp as string), 'dd MMM yyyy'),
        category: tx.category,
      };
    });
  };

  useEffect(() => {
    if (data?.transactions) {
      const newProcessed = processGqlTransactions(
        data.transactions as GqlTransaction[]
      );
      if (offset === 0) {
        // Initial load or refresh
        setDisplayTransactions(newProcessed);
      } else {
        // Fetch more
        setDisplayTransactions((prev) => [...prev, ...newProcessed]);
      }
      setCanFetchMore(newProcessed.length === ITEMS_PER_PAGE);
    }
  }, [data, offset]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search logic - either client-side filter or backend search
    // For backend search, you'd refetch with a search variable
    // For now, this just updates state. Client-side filtering can be added below.
  };

  const filteredTransactions = displayTransactions.filter(
    (tx) =>
      tx.merchantNameOrPayee
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (tx.category &&
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLoadMore = useCallback(() => {
    if (!loading && !isFetchingMore && canFetchMore && data?.transactions) {
      setIsFetchingMore(true);
      const currentOffset = offset + ITEMS_PER_PAGE;
      fetchMore({
        variables: {
          offset: currentOffset,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          setIsFetchingMore(false);
          if (
            !fetchMoreResult?.transactions ||
            fetchMoreResult.transactions.length === 0
          ) {
            setCanFetchMore(false);
            return prev;
          }
          // setDisplayTransactions is handled by useEffect based on `data` and `offset` change.
          // Apollo Client merges the results into `data` if cache policies are set up correctly.
          // We just need to update our local offset to trigger the useEffect.
          setOffset(currentOffset);
          return {
            ...prev,
            transactions: [
              ...(prev.transactions || []),
              ...fetchMoreResult.transactions,
            ],
          };
        },
      }).catch((e) => {
        console.error('Failed to fetch more transactions:', e);
        setIsFetchingMore(false);
      });
    }
  }, [loading, isFetchingMore, canFetchMore, data, fetchMore, offset]);

  const onRefresh = useCallback(async () => {
    setOffset(0); // Reset offset for refresh
    if (refetch) {
      try {
        await refetch({ limit: ITEMS_PER_PAGE, offset: 0 }); // Pass variables to refetch
      } catch (e) {
        console.error('Failed to refetch transactions:', e);
      }
    }
  }, [refetch]);

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#8e44ad" />
      </View>
    );
  };

  if (loading && offset === 0 && displayTransactions.length === 0) {
    // Initial loading state
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  if (error && displayTransactions.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity
          onPress={() => onRefresh()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for balance */}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by merchant or category"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch} // Use the debounced search or direct search
          />
        </View>
      </View>

      {filteredTransactions.length === 0 && !loading && (
        <View style={styles.centeredContainer}>
          <Text style={styles.noResultsText}>No transactions found.</Text>
          {searchQuery !== '' && (
            <Text style={styles.noResultsSubText}>
              Try adjusting your search.
            </Text>
          )}
        </View>
      )}

      <ScrollView
        style={styles.content}
        onScrollEndDrag={({ nativeEvent }) => {
          if (
            nativeEvent.layoutMeasurement.height +
              nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 20
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={150}
        refreshControl={
          <RefreshControl
            refreshing={loading && offset === 0} // Show refreshing state on pull-to-refresh
            onRefresh={onRefresh}
            tintColor="#8e44ad"
          />
        }
      >
        {filteredTransactions.map((transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={styles.transactionItem}
            onPress={() =>
              router.push({
                pathname: '/transaction-details',
                params: { id: transaction.id.toString() }, // Ensure ID is string
              })
            }
          >
            <View style={styles.transactionHeader}>
              <Text style={styles.merchantName} numberOfLines={1}>
                {transaction.merchantNameOrPayee}
              </Text>
              <Text
                style={[
                  styles.amount,
                  transaction.flow === TransactionFlow.Credit
                    ? styles.creditAmount
                    : styles.debitAmount,
                ]}
              >
                {transaction.flow === TransactionFlow.Credit ? '+' : '-'}₹
                {transaction.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.transactionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{transaction.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>
                  {transaction.category || 'Uncategorized'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {renderFooter()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  centeredContainer: {
    // For loading, error, no results
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#aaa',
    marginTop: 10,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    color: '#FF5252',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#8e44ad',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  noResultsText: {
    fontSize: 18,
    color: '#aaa',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Adjusted for placeholder
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 60, // SafeArea
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 20, // Slightly smaller
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48, // Fixed height
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    // Kept for future use
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    width: 48, // Square button
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, // Add horizontal padding for scroll content
  },
  transactionItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12, // Slightly smaller border radius
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Reduced margin
  },
  merchantName: {
    fontSize: 16, // Slightly smaller
    color: '#e0e0e0', // Lighter white
    fontFamily: 'Inter-SemiBold',
    flexShrink: 1, // Allow merchant name to shrink if amount is long
    marginRight: 8,
  },
  amount: {
    fontSize: 16, // Slightly smaller
    fontFamily: 'Inter-Bold',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#FF5252',
  },
  transactionDetails: {
    // borderTopWidth: 1, // Can remove this if design is cleaner without
    // borderTopColor: '#333',
    // paddingTop: 10, // Reduced padding
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6, // Reduced margin
  },
  detailLabel: {
    fontSize: 13, // Slightly smaller
    color: '#888', // Dimmer label
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 13, // Slightly smaller
    color: '#ccc', // Slightly dimmer value
    fontFamily: 'Inter-Regular',
  },
  // Removed viewDetails and viewDetailsText as item is clickable
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
