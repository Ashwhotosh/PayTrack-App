// app/(tabs)/analytics.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { format, subDays, startOfWeek, endOfWeek, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ChartBar } from 'lucide-react-native';
import { useAuth } from '@/context/authContext'; // Assuming this path is correct
import { router } from 'expo-router'; // For navigation

// Import generated hooks and types
import {
  useGetAnalyticsTransactionsQuery,
  useGetCategorySpendingSummaryQuery,
  // Explicit types if needed, e.g., for casting or complex transformations
  // GetAnalyticsTransactionsQuery,
  // GetCategorySpendingSummaryQuery,
  // TransactionType as GqlTransactionType, // If needed for explicit enum usage
} from '@/graphql/generated/graphql';

// Local type for processed transaction for display in the list
interface DisplayTransaction {
  id: string;
  title: string;
  amount: number; // Absolute amount for display
  type: 'CREDIT' | 'DEBIT'; // For styling
  category?: string | null;
  date: string; // Formatted date string
  paymentMethod: string; // e.g., "UPI", "CARD"
  iconUrl?: string; // URL for a category or merchant icon
}

// Local type for processed category spending for display
interface DisplayCategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

type TabType = 'transactions' | 'insights';
type TimeRangeOption = '7d' | '30d' | 'currentWeek' | 'currentMonth' | '90d';

// Predefined colors for common categories for a consistent look
const categoryColors: { [key: string]: string } = {
  'Food': '#FF6384',
  'Salary': '#36A2EB',
  'Income': '#36A2EB',
  'Transportation': '#FFCE56',
  'Shopping': '#4BC0C0',
  'Entertainment': '#9966FF',
  'Bills & Utilities': '#FF9F40',
  'Freelance': '#3DDC97',
  'Housing': '#FFCD56',
  'Groceries': '#FF8A65',
  'Investment': '#66BB6A',
  'Health & Wellness': '#26A69A',
  'Other': '#C9CBCF',
  'Uncategorized': '#BDBDBD',
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Helper to get a placeholder icon URL
const getPlaceholderIcon = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name[0] || 'T')}&background=3a3a3a&color=fff&size=64&font-size=0.5`;

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30d');

  const { dateFrom, dateTo } = useMemo(() => {
    const today = new Date();
    let fromDateInstance = subDays(today, 29); // Default for 30d
    let toDateInstance = today;

    switch (timeRange) {
      case '7d':
        fromDateInstance = subDays(today, 6);
        break;
      case '30d':
        fromDateInstance = subDays(today, 29);
        break;
      case '90d':
        fromDateInstance = subDays(today, 89);
        break;
      case 'currentWeek':
        fromDateInstance = startOfWeek(today, { weekStartsOn: 1 });
        toDateInstance = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'currentMonth':
        fromDateInstance = startOfMonth(today);
        toDateInstance = endOfMonth(today);
        break;
    }
    // Format for GraphQL DateTime scalar (ISO string)
    return {
      dateFrom: format(fromDateInstance, "yyyy-MM-dd'T'00:00:00.000'Z'"),
      dateTo: format(toDateInstance, "yyyy-MM-dd'T'23:59:59.999'Z'")
    };
  }, [timeRange]);

  const {
    data: transactionsGqlData,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useGetAnalyticsTransactionsQuery({
    variables: { dateFrom, dateTo, limit: 100 }, // Fetch more for analytics view
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: categorySummaryGqlData,
    loading: categorySummaryLoading,
    error: categorySummaryError,
    refetch: refetchCategorySummary,
  } = useGetCategorySpendingSummaryQuery({
    variables: { dateFrom, dateTo },
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const processedTransactions: DisplayTransaction[] = useMemo(() => {
    if (!transactionsGqlData?.transactions) return [];
    return transactionsGqlData.transactions.map(tx => {
      let title = tx.notes || 'Transaction';
      if (tx.upiDetails?.payeeName) title = tx.upiDetails.payeeName;
      else if (tx.cardDetails?.payeeMerchantName) title = tx.cardDetails.payeeMerchantName;
      else if (tx.netBankingDetails?.payeeName) title = tx.netBankingDetails.payeeName;

      const amountValue = typeof tx.amount === 'string' ? parseFloat(tx.amount) : typeof tx.amount === 'number' ? tx.amount : 0;

      // IMPORTANT: Determine CREDIT/DEBIT based on your backend's Transaction data.
      // If tx.amount is signed (negative for debit), use that.
      // Otherwise, if your backend's `transactionType` enum can be mapped to credit/debit, use that.
      // This example assumes a simple inference; adjust as needed.
      let type: 'CREDIT' | 'DEBIT' = 'DEBIT'; // Default to debit
      if (tx.category?.toLowerCase() === 'salary' || tx.category?.toLowerCase() === 'income' || (tx.notes && tx.notes.toLowerCase().includes('credited'))) {
        type = 'CREDIT';
      }
      // If your backend's `amount` field can be negative for debits, a simpler check would be:
      // const type: 'CREDIT' | 'DEBIT' = amountValue >= 0 ? 'CREDIT' : 'DEBIT';
      // const displayAmount = Math.abs(amountValue);

      return {
        id: tx.id,
        title: title,
        amount: Math.abs(amountValue), // Show absolute amount
        type: type,
        category: tx.category || 'Uncategorized',
        date: format(parseISO(tx.timestamp as string), 'dd MMM, yy'), // Assuming timestamp is ISO string
        paymentMethod: tx.transactionType.toString(), // Use the GQL enum value
        iconUrl: getPlaceholderIcon(title),
      };
    }).sort((a,b) => parseISO(transactionsGqlData.transactions.find(t => t.id === b.id)!.timestamp as string).getTime() - parseISO(transactionsGqlData.transactions.find(t => t.id === a.id)!.timestamp as string).getTime()); // Sort by original timestamp desc
  }, [transactionsGqlData]);

  const processedCategorySpending: DisplayCategorySpending[] = useMemo(() => {
    if (!categorySummaryGqlData?.categorySpendingSummary) return [];
    const summary = categorySummaryGqlData.categorySpendingSummary.filter(item => item.category !== null); // Filter out null categories

    const totalSpendingAllCategories = summary.reduce((sum, item) => {
        const itemAmount = typeof item.totalAmount === 'string' ? parseFloat(item.totalAmount) : typeof item.totalAmount === 'number' ? item.totalAmount : 0;
        return sum + (itemAmount < 0 ? Math.abs(itemAmount) : 0); // Only sum expenses (negative amounts)
    },0);


    return summary
      .map(item => {
        const amount = typeof item.totalAmount === 'string' ? parseFloat(item.totalAmount) : typeof item.totalAmount === 'number' ? item.totalAmount : 0;
        const expenseAmount = amount < 0 ? Math.abs(amount) : 0; // Consider only expenses for category spending breakdown

        return {
          category: item.category!, // category is String! from GQL
          amount: expenseAmount,
          percentage: totalSpendingAllCategories > 0 ? Math.round((expenseAmount / totalSpendingAllCategories) * 100) : 0,
          color: categoryColors[item.category!] || getRandomColor(),
        };
      })
      .filter(item => item.amount > 0) // Only show categories with expenses
      .sort((a, b) => b.amount - a.amount);
  }, [categorySummaryGqlData]);

  const lineChartData = useMemo(() => {
    if (!transactionsGqlData?.transactions || transactionsGqlData.transactions.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    const expensesByDate: { [key: string]: number } = {};
    // Group expenses by day
    transactionsGqlData.transactions.forEach(tx => {
      const amountValue = typeof tx.amount === 'string' ? parseFloat(tx.amount) : typeof tx.amount === 'number' ? tx.amount : 0;
      if (amountValue < 0) { // Consider only debits/expenses for spending chart
        const dateKey = format(parseISO(tx.timestamp as string), 'yyyy-MM-dd');
        expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + Math.abs(amountValue);
      }
    });

    const sortedDates = Object.keys(expensesByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    // Create labels for the last N days in the range, even if no expense on some days
    const chartLabels: string[] = [];
    const chartDatasetData: number[] = [];
    
    if (sortedDates.length > 0) {
        const firstDate = parseISO(sortedDates[0]);
        const lastDate = parseISO(sortedDates[sortedDates.length -1]);
        let currentDate = firstDate;
        while(currentDate <= lastDate) {
            const dateKey = format(currentDate, 'yyyy-MM-dd');
            const label = format(currentDate, 'dd MMM');
            chartLabels.push(label);
            chartDatasetData.push(expensesByDate[dateKey] || 0);
            currentDate = subDays(currentDate, -1); // Add 1 day
        }
    }
    // Limit labels for readability if too many
    const maxLabels = 10;
    if (chartLabels.length > maxLabels) {
        const nth = Math.ceil(chartLabels.length / maxLabels);
        const filteredLabels = chartLabels.filter((_,i) => i % nth === 0);
        const filteredData = chartDatasetData.filter((_,i) => i % nth === 0);
        return { labels: filteredLabels, datasets: [{ data: filteredData }] };
    }


    return {
      labels: chartLabels,
      datasets: [{ data: chartDatasetData }],
    };
  }, [transactionsGqlData, timeRange]);

  const chartConfig = {
    backgroundGradientFrom: "#2a2a2a", // Darker card background
    backgroundGradientTo: "#2a2a2a",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(142, 68, 173, ${opacity})`, // Accent color
    labelColor: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`, // Light labels
    style: { borderRadius: 16, },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#8e44ad" },
    propsForBackgroundLines: { stroke: "#3a3a3a" }, // Subtle grid lines
    strokeWidth: 2,
  };

  const onRefreshAll = useCallback(async () => {
    if (user) {
      try {
        await Promise.all([refetchTransactions(), refetchCategorySummary()]);
      } catch (e) {
        console.error("Failed to refetch analytics data:", e);
      }
    }
  }, [user, refetchTransactions, refetchCategorySummary]);

  const isLoading = (transactionsLoading && !transactionsGqlData) || (categorySummaryLoading && !categorySummaryGqlData);

  const renderTimeRangeSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRangeOuterContainer}>
        <View style={styles.timeRangeContainer}>
        {(['7d', '30d', 'currentWeek', 'currentMonth', '90d'] as TimeRangeOption[]).map(range => (
          <TouchableOpacity
            key={range}
            style={[styles.timeRangeButton, timeRange === range && styles.activeTimeRangeButton]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[styles.timeRangeButtonText, timeRange === range && styles.activeTimeRangeButtonText]}>
              {range === 'currentWeek' ? 'This Week' : range === 'currentMonth' ? 'This Month' : range.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ChartBar color="#8e44ad" size={32} />
        <Text style={styles.title}>Analytics</Text>
      </View>

      {renderTimeRangeSelector()}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
            Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{paddingBottom: 20}}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefreshAll}
            tintColor="#8e44ad"
            colors={['#8e44ad']}
          />
        }
      >
        {isLoading && <ActivityIndicator size="large" color="#8e44ad" style={styles.loadingIndicator} />}

        {!isLoading && activeTab === 'transactions' && (
          <View style={styles.transactionsContainer}>
            {transactionsError && <Text style={styles.errorText}>Error: {transactionsError.message}</Text>}
            {!transactionsError && processedTransactions.length === 0 && <Text style={styles.noDataText}>No transactions found for this period.</Text>}
            {processedTransactions.map(transaction => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => router.push({ pathname: '/transaction-details', params: { id: transaction.id }})}
              >
                <View style={styles.transactionLeft}>
                  <Image source={{ uri: transaction.iconUrl }} style={styles.transactionIcon} />
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle} numberOfLines={1}>{transaction.title}</Text>
                    <Text style={styles.transactionCategory}>
                      {transaction.category} • {transaction.paymentMethod}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'CREDIT' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaction.type === 'CREDIT' ? '+₹' : '-₹'}{transaction.amount.toFixed(2)}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isLoading && activeTab === 'insights' && (
          <View style={styles.insightsContainer}>
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Spending Trend</Text>
              <View style={styles.chartContainer}>
                {(lineChartData.labels.length > 0 && lineChartData.datasets[0].data.length > 0) ? (
                  <LineChart
                    data={lineChartData}
                    width={Dimensions.get('window').width - 40} // Adjust width for padding
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    yAxisLabel="₹"
                    yAxisSuffix=""
                    fromZero={true}
                  />
                ) : (
                  <Text style={styles.noDataText}>Not enough data to display spending trend.</Text>
                )}
              </View>
            </View>

            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              {categorySummaryError && <Text style={styles.errorText}>Error: {categorySummaryError.message}</Text>}
              {!categorySummaryError && processedCategorySpending.length === 0 && <Text style={styles.noDataText}>No category spending data for this period.</Text>}
              {processedCategorySpending.map((category) => (
                <View key={category.category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.category}</Text>
                    <Text style={styles.categoryAmount}>₹{category.amount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${category.percentage}%`, backgroundColor: category.color }
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageText}>{category.percentage}% of expenses</Text>
                </View>
              ))}
            </View>

            {/* Static Insights Section - to be made dynamic later */}
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>Spending Insights</Text>
              <View style={styles.insightCard}><Text style={styles.insightText}>Track your spending habits to gain better financial control.</Text></View>
              {/* More static or dynamic insights here */}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 60, paddingBottom: 10, gap: 12 },
  title: { fontSize: 24, color: '#fff', fontFamily: 'Inter-Bold' },
  timeRangeOuterContainer: { paddingHorizontal: 15, paddingVertical: 5, },
  timeRangeContainer: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  timeRangeButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#2a2a2a' },
  activeTimeRangeButton: { backgroundColor: '#8e44ad' },
  timeRangeButtonText: { color: '#ccc', fontFamily: 'Inter-SemiBold', fontSize: 12 },
  activeTimeRangeButtonText: { color: '#fff' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, marginTop:5, gap: 12 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#2a2a2a', alignItems: 'center' },
  activeTab: { backgroundColor: '#8e44ad' },
  tabText: { fontSize: 16, color: '#999', fontFamily: 'Inter-SemiBold' },
  activeTabText: { color: '#fff' },
  content: { flex: 1 },
  loadingIndicator: { marginTop: 50 },
  transactionsContainer: { paddingHorizontal: 20, paddingTop: 10 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2a2a2a', padding: 16, borderRadius: 12, marginBottom: 12 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  transactionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3a3a3a', justifyContent: 'center', alignItems: 'center' },
  transactionInfo: { marginLeft: 12, flexShrink: 1 },
  transactionTitle: { fontSize: 15, color: '#fff', fontFamily: 'Inter-SemiBold' },
  transactionCategory: { fontSize: 13, color: '#999', fontFamily: 'Inter-Regular', marginTop: 4 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 15, fontFamily: 'Inter-Bold' },
  creditAmount: { color: '#4CAF50' },
  debitAmount: { color: '#FF5252' },
  transactionDate: { fontSize: 13, color: '#999', fontFamily: 'Inter-Regular', marginTop: 4 },
  insightsContainer: { padding: 20 },
  chartSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, color: '#fff', fontFamily: 'Inter-SemiBold', marginBottom: 16 },
  chartContainer: { backgroundColor: '#2a2a2a', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 5, alignItems: 'center' },
  chart: { borderRadius: 16, },
  categoriesSection: { marginBottom: 32 },
  categoryItem: { backgroundColor: '#2a2a2a', padding:16, borderRadius:12, marginBottom: 12 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  categoryName: { fontSize: 16, color: '#fff', fontFamily: 'Inter-SemiBold' },
  categoryAmount: { fontSize: 16, color: '#fff', fontFamily: 'Inter-Bold' },
  progressContainer: { height: 10, backgroundColor: '#3a3a3a', borderRadius: 5, overflow: 'hidden', marginTop: 8 },
  progressBar: { height: '100%', borderRadius: 5 },
  percentageText: { fontSize: 12, color: '#ccc', fontFamily: 'Inter-Regular', marginTop: 6, textAlign: 'right' },
  insightsSection: { marginBottom: 32 },
  insightCard: { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, marginBottom: 12 },
  insightText: { fontSize: 14, color: '#e0e0e0', fontFamily: 'Inter-Regular', lineHeight: 20 },
  errorText: { color: '#FF5252', textAlign: 'center', marginVertical: 20, fontFamily: 'Inter-Regular', fontSize: 15 },
  noDataText: { color: '#999', textAlign: 'center', marginVertical: 30, fontFamily: 'Inter-Regular', fontSize: 15 },
});