// app/(tabs)/analytics.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  FlatList,
} from 'react-native';
import {
  ChartBar,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  XCircle,
  CreditCard,
  Repeat,
  Smartphone,
  DollarSign,
} from 'lucide-react-native';
import SpendingPieChart, {
  CategorySpendingData,
} from '../../components/SpendingPieChart';
import {
  useGetCategorySpendingSummaryLazyQuery,
  useGetAnalyticsWithInsightLazyQuery,
  useGetAnalyticsTransactionsLazyQuery,
  GetAnalyticsTransactionsQuery,
} from '@/graphql/generated/graphql';
import { subDays, format } from 'date-fns';

type TabType = 'transactions' | 'insights';
type TimeRange = '7d' | '30d' | '90d';
type ViewType = 'actual' | 'forecast';

type TransactionListItem = NonNullable<
  GetAnalyticsTransactionsQuery['transactions']
>[0];

const TRANSACTIONS_LIMIT = 20;

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [viewType, setViewType] = useState<ViewType>('actual');

  // State for Category Spending Summary
  const [categorySpendingData, setCategorySpendingData] = useState<
    CategorySpendingData[]
  >([]);
  const [categorySummaryError, setCategorySummaryError] = useState<
    string | null
  >(null);

  // State for Forecast and LLM Insights
  const [selectedCategoryForForecast, setSelectedCategoryForForecast] =
    useState<string | null>(null);
  const [forecastData, setForecastData] = useState<number[] | null>(null);
  const [expenditureTip, setExpenditureTip] = useState<string | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [forecastPeriodsCovered, setForecastPeriodsCovered] =
    useState<number>(0);
  const [forecastCategoryContext, setForecastCategoryContext] = useState<
    string | null
  >(null);

  // State for Transactions List
  const [userTransactions, setUserTransactions] = useState<
    TransactionListItem[]
  >([]);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  );
  const [transactionsOffset, setTransactionsOffset] = useState(0); // Keep for managing fetchMore logic
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [isLoadingMoreTransactions, setIsLoadingMoreTransactions] =
    useState(false); // For fetchMore UI

  // --- GraphQL Hooks ---
  const [
    fetchCategorySummary,
    { loading: categorySummaryHookLoading, error: categorySummaryHookError },
  ] = useGetCategorySpendingSummaryLazyQuery({
    onCompleted: (data) => {
      if (data?.categorySpendingSummary) {
        const chartData = data.categorySpendingSummary.map((item, index) => ({
          name: item.category,
          amount: parseFloat(item.totalAmount as string),
          color: PieChartColors[index % PieChartColors.length],
        }));
        setCategorySpendingData(chartData);
        setCategorySummaryError(null);
      } else {
        setCategorySpendingData([]);
        setCategorySummaryError('No spending data received.');
      }
    },
    onError: (err) => {
      setCategorySpendingData([]);
      setCategorySummaryError(
        err.message || 'Failed to fetch spending summary.'
      );
      console.error('Error fetching category spending summary:', err);
    },
    fetchPolicy: 'cache-and-network',
  });

  const [
    fetchInsight,
    { loading: insightHookLoading, error: insightHookError },
  ] = useGetAnalyticsWithInsightLazyQuery({
    onCompleted: (data) => {
      if (data?.getAnalyticsWithInsight) {
        setForecastData(data.getAnalyticsWithInsight.forecastedSpending);
        setExpenditureTip(data.getAnalyticsWithInsight.expenditureTip ?? null);
        setForecastPeriodsCovered(
          data.getAnalyticsWithInsight.periodsCovered || 0
        );
        setForecastCategoryContext(
          data.getAnalyticsWithInsight.categoryContext || 'Overall'
        );
        setInsightError(null);
      } else {
        setForecastData(null);
        setExpenditureTip(null);
        setInsightError('No insight data received.');
      }
    },
    onError: (err) => {
      setForecastData(null);
      setExpenditureTip(null);
      setInsightError(err.message || 'Failed to fetch insights.');
      console.error('Error fetching analytics insight:', err);
    },
    fetchPolicy: 'network-only',
  });

  const [
    fetchUserTransactions,
    {
      loading: transactionsHookLoading,
      error: transactionsListHookError,
      fetchMore: fetchMoreHookTransactions,
    },
  ] = useGetAnalyticsTransactionsLazyQuery({
    onCompleted: (data) => {
      setIsLoadingMoreTransactions(false); // Reset for fetchMore
      const newTransactions =
        (data?.transactions as TransactionListItem[]) || [];
      // Use transactionsOffset to determine if this is the initial load or a fetchMore
      if (transactionsOffset === 0) {
        setUserTransactions(newTransactions);
      } else {
        setUserTransactions((prev) => [...prev, ...newTransactions]);
      }
      setHasMoreTransactions(newTransactions.length === TRANSACTIONS_LIMIT);
      setTransactionsError(null);
    },
    onError: (err) => {
      setIsLoadingMoreTransactions(false); // Reset for fetchMore
      setTransactionsError(err.message || 'Failed to fetch transactions.');
      console.error('Error fetching user transactions:', err);
    },
    fetchPolicy: 'cache-and-network',
  });

  const PieChartColors = [
    '#4361EE',
    '#3DDC97',
    '#FF9F1C',
    '#F72585',
    '#7209B7',
    '#4CC9F0',
    '#FB8500',
    '#8338EC',
    '#FF006E',
    '#3A86FF',
    '#FFBE0B',
    '#0ead69',
  ];

  const getDateRangeForSummary = useCallback(() => {
    const today = new Date();
    let dateFrom: Date;
    switch (timeRange) {
      case '7d':
        dateFrom = subDays(today, 7);
        break;
      case '90d':
        dateFrom = subDays(today, 90);
        break;
      case '30d':
      default:
        dateFrom = subDays(today, 30);
        break;
    }
    return {
      dateFromISO: dateFrom.toISOString(),
      dateToISO: today.toISOString(),
    };
  }, [timeRange]);

  useEffect(() => {
    if (activeTab === 'insights' && viewType === 'actual') {
      setCategorySpendingData([]); // Clear previous
      setCategorySummaryError(null);
      const { dateFromISO, dateToISO } = getDateRangeForSummary();
      fetchCategorySummary({
        variables: { dateFrom: dateFromISO, dateTo: dateToISO },
      });
    }
  }, [
    activeTab,
    viewType,
    timeRange,
    fetchCategorySummary,
    getDateRangeForSummary,
  ]);

  useEffect(() => {
    if (activeTab === 'insights' && viewType === 'forecast') {
      setForecastData(null);
      setExpenditureTip(null);
      setInsightError(null);
      setForecastCategoryContext(null);
      let periodsToForecast = 4;
      fetchInsight({
        variables: {
          periodsAhead: periodsToForecast,
          category: selectedCategoryForForecast,
        },
      });
    }
  }, [
    activeTab,
    viewType,
    selectedCategoryForForecast,
    fetchInsight,
    timeRange,
  ]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      setUserTransactions([]);
      setTransactionsOffset(0);
      setHasMoreTransactions(true);
      setTransactionsError(null);
      fetchUserTransactions({
        variables: { limit: TRANSACTIONS_LIMIT, offset: 0 },
      });
    }
  }, [activeTab, fetchUserTransactions]);

  const handleCategorySelect = (categoryName: string) => {
    if (
      selectedCategoryForForecast === categoryName &&
      viewType === 'forecast'
    ) {
      setSelectedCategoryForForecast(null);
    } else {
      setSelectedCategoryForForecast(categoryName);
      if (viewType !== 'forecast') {
        setViewType('forecast');
      }
    }
  };

  const clearCategoryFilter = () => {
    setSelectedCategoryForForecast(null);
  };

  const loadMoreTransactions = useCallback(() => {
    if (
      !transactionsHookLoading &&
      hasMoreTransactions &&
      fetchMoreHookTransactions &&
      !isLoadingMoreTransactions
    ) {
      setIsLoadingMoreTransactions(true);
      const newOffset = userTransactions.length; // Calculate new offset
      setTransactionsOffset(newOffset); // Update state if needed, though variables use newOffset directly
      fetchMoreHookTransactions({
        variables: {
          limit: TRANSACTIONS_LIMIT,
          offset: newOffset,
        },
      })
        .catch((err) => {
          console.error('Failed to fetch more transactions:', err);
        })
        .finally(() => {
          setIsLoadingMoreTransactions(false);
        });
    }
  }, [
    transactionsHookLoading,
    hasMoreTransactions,
    fetchMoreHookTransactions,
    userTransactions.length,
    isLoadingMoreTransactions,
  ]);

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            timeRange === range && styles.activeTimeRange,
          ]}
          onPress={() => setTimeRange(range)}
        >
          <Text
            style={[
              styles.timeRangeText,
              timeRange === range && styles.activeTimeRangeText,
            ]}
          >
            {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderViewTypeSelector = () => (
    <View style={styles.viewTypeContainer}>
      {(['actual', 'forecast'] as ViewType[]).map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.viewTypeButton,
            viewType === type && styles.activeViewType,
          ]}
          onPress={() => setViewType(type)}
        >
          {type === 'actual' ? (
            <ChartBar size={20} color={viewType === type ? '#fff' : '#666'} />
          ) : (
            <TrendingUp size={20} color={viewType === type ? '#fff' : '#666'} />
          )}
          <Text
            style={[
              styles.viewTypeText,
              viewType === type && styles.activeViewTypeText,
            ]}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getTransactionTypeIcon = (type: string | undefined | null) => {
    switch (type) {
      case 'UPI':
        return <Smartphone size={24} color="#6366F1" />;
      case 'CARD':
        return <CreditCard size={24} color="#EC4899" />;
      case 'NET_BANKING':
        return <Repeat size={24} color="#10B981" />;
      default:
        return <DollarSign size={24} color="#A1A1AA" />;
    }
  };

  const renderTransactionItem = ({ item }: { item: TransactionListItem }) => {
    const transactionDate = new Date(item.timestamp);
    const formattedDate = format(transactionDate, 'PPp');

    let payeeDisplay = 'Unknown Payee';
    if (item.transactionType === 'UPI' && item.upiDetails) {
      payeeDisplay =
        item.upiDetails.payeeName ||
        item.upiDetails.payeeUpiId ||
        'UPI Transaction';
    } else if (item.transactionType === 'CARD' && item.cardDetails) {
      payeeDisplay = item.cardDetails.payeeMerchantName || 'Card Payment';
    } else if (
      item.transactionType === 'NET_BANKING' &&
      item.netBankingDetails
    ) {
      payeeDisplay = item.netBankingDetails.payeeName || 'Net Banking';
    } else if (item.notes && item.notes.trim() !== '') {
      payeeDisplay = item.notes;
    }

    return (
      <TouchableOpacity
        style={styles.transactionItemContainer}
        activeOpacity={0.7}
      >
        <View style={styles.transactionIconContainer}>
          {getTransactionTypeIcon(item.transactionType)}
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionPayee} numberOfLines={1}>
            {payeeDisplay}
          </Text>
          <Text style={styles.transactionTimestamp}>{formattedDate}</Text>
          {item.category && (
            <Text style={styles.transactionCategory}>{item.category}</Text>
          )}
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text
            style={[
              styles.transactionAmount,
              item.flow === 'DEBIT' ? styles.debitAmount : styles.creditAmount,
            ]}
          >
            {item.flow === 'DEBIT' ? '-' : '+'}₹
            {parseFloat(item.amount as string).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ChartBar color="#8e44ad" size={32} />
        <Text style={styles.title}>Analytics</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'transactions' && styles.activeTabText,
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'insights' && styles.activeTabText,
            ]}
          >
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'transactions' && (
          <View style={styles.transactionsListContainer}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            {transactionsHookLoading && userTransactions.length === 0 && (
              <ActivityIndicator
                size="large"
                color="#8e44ad"
                style={styles.loader}
              />
            )}
            {(transactionsListHookError && (
              <Text style={styles.errorText}>
                {transactionsListHookError.message}
              </Text>
            )) ||
              (transactionsError && (
                <Text style={styles.errorText}>{transactionsError}</Text>
              ))}
            {!transactionsHookLoading &&
              !transactionsListHookError &&
              !transactionsError &&
              userTransactions.length === 0 && (
                <Text style={styles.infoText}>No transactions found.</Text>
              )}
            {userTransactions.length > 0 && (
              <FlatList
                data={userTransactions}
                renderItem={renderTransactionItem}
                keyExtractor={(item, index) => item.id + index.toString()}
                onEndReached={loadMoreTransactions}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isLoadingMoreTransactions ? (
                    <ActivityIndicator
                      size="small"
                      color="#8e44ad"
                      style={{ marginVertical: 15 }}
                    />
                  ) : null
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'insights' && (
          <View style={styles.insightsContainer}>
            {renderTimeRangeSelector()}
            {renderViewTypeSelector()}
            {selectedCategoryForForecast && viewType === 'forecast' && (
              <View style={styles.filterChipContainer}>
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    Forecasting for: {selectedCategoryForForecast}
                  </Text>
                  <TouchableOpacity
                    onPress={clearCategoryFilter}
                    style={styles.clearFilterButton}
                  >
                    <XCircle color="#fff" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {viewType === 'actual' && (
              <View style={styles.chartSection}>
                <Text style={styles.sectionTitle}>
                  Spending by Category (
                  {timeRange === '7d'
                    ? 'Last 7 Days'
                    : timeRange === '30d'
                    ? 'Last 30 Days'
                    : 'Last 90 Days'}
                  )
                </Text>

                {/* --- TOTAL EXPENDITURE CARD --- */}
                {!categorySummaryHookLoading &&
                  categorySpendingData.length > 0 && (
                    <View style={styles.totalExpenditureCard}>
                      <Text style={styles.totalExpenditureLabel}>
                        Total Expenditure
                      </Text>
                      <Text style={styles.totalExpenditureValue}>
                        ₹
                        {categorySpendingData
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </Text>
                    </View>
                  )}

                {categorySummaryHookLoading && (
                  <ActivityIndicator
                    size="large"
                    color="#8e44ad"
                    style={styles.loader}
                  />
                )}
                {(categorySummaryHookError?.message || categorySummaryError) &&
                  !categorySummaryHookLoading && (
                    <Text style={styles.errorText}>
                      {categorySummaryHookError?.message ||
                        categorySummaryError}
                    </Text>
                  )}
                {!categorySummaryHookLoading &&
                  !categorySummaryHookError &&
                  !categorySummaryError &&
                  categorySpendingData.length === 0 && (
                    <Text style={styles.infoText}>
                      No spending data available for this period.
                    </Text>
                  )}
                {!categorySummaryHookLoading &&
                  !categorySummaryHookError &&
                  !categorySummaryError &&
                  categorySpendingData.length > 0 && (
                    <SpendingPieChart
                      categories={categorySpendingData}
                      onCategorySelect={handleCategorySelect}
                    />
                  )}
              </View>
            )}
            {viewType === 'forecast' && (
              <>
                <View style={styles.forecastSection}>
                  <Text style={styles.sectionTitle}>
                    Spending Forecast ({forecastCategoryContext || 'Overall'} -
                    next {forecastPeriodsCovered || 'N/A'} periods)
                  </Text>
                  {insightHookLoading && (
                    <ActivityIndicator
                      size="large"
                      color="#8e44ad"
                      style={styles.loader}
                    />
                  )}
                  {(insightHookError?.message || insightError) &&
                    !insightHookLoading && (
                      <Text style={styles.errorText}>
                        {insightHookError?.message || insightError}
                      </Text>
                    )}
                  {!insightHookLoading &&
                    !insightHookError &&
                    !insightError &&
                    forecastData &&
                    forecastData.length > 0 && (
                      <View>
                        {forecastData.map((value, index) => (
                          <View key={index} style={styles.forecastRow}>
                            <Text style={styles.forecastLabel}>
                              Week {index + 1}
                            </Text>
                            <Text style={styles.forecastValue}>
                              ₹{value.toLocaleString('en-IN')}
                            </Text>
                          </View>
                        ))}
                        <View style={styles.forecastSeparator} />
                        <View style={styles.forecastTotalContainer}>
                          <Text style={styles.forecastTotalLabel}>
                            Monthly Expenditure
                          </Text>
                          <Text style={styles.forecastTotalValue}>
                            ₹
                            {forecastData
                              .reduce((sum, val) => sum + val, 0)
                              .toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </View>
                    )}
                  {!insightHookLoading &&
                    !insightHookError &&
                    !insightError &&
                    (!forecastData || forecastData.length === 0) && (
                      <Text style={styles.infoText}>
                        No forecast data available.
                      </Text>
                    )}
                </View>
                {!insightHookLoading && expenditureTip && (
                  <View style={styles.tipSection}>
                    <Text style={styles.sectionTitle}>Smart Tip ✨</Text>
                    <Text style={styles.tipText}>{expenditureTip}</Text>
                  </View>
                )}
                {!insightHookLoading && !expenditureTip && !insightError && (
                  <Text style={styles.infoText}>
                    No financial tip available.
                  </Text>
                )}
              </>
            )}
            {/* The General Insights section was here but empty, removing for brevity */}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 10,
    gap: 12,
  },
  title: { fontSize: 24, color: '#fff', fontFamily: 'Inter-Bold' },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  activeTab: { backgroundColor: '#8e44ad' },
  tabText: { fontSize: 15, color: '#999', fontFamily: 'Inter-SemiBold' },
  activeTabText: { color: '#fff' },
  content: { flex: 1 },
  insightsContainer: { paddingHorizontal: 20, paddingTop: 10 },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTimeRange: { backgroundColor: '#8e44ad' },
  timeRangeText: { fontSize: 14, color: '#999', fontFamily: 'Inter-SemiBold' },
  activeTimeRangeText: { color: '#fff' },
  viewTypeContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  viewTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 14,
  },
  activeViewType: { backgroundColor: '#8e44ad' },
  viewTypeText: { fontSize: 14, color: '#666', fontFamily: 'Inter-SemiBold' },
  activeViewTypeText: { color: '#fff' },
  filterChipContainer: { marginBottom: 16, alignItems: 'flex-start' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8e44ad',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterChipText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginRight: 8,
  },
  clearFilterButton: { padding: 2 },
  chartSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    color: '#e0e0e0',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16, // Increased margin
  },
  forecastSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
  },
  tipSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#232323',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8e44ad',
  },
  tipText: {
    fontSize: 15,
    color: '#e0e0e0',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  loader: { marginVertical: 20 },
  errorText: {
    color: '#FF6B6B',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 15,
  },
  infoText: {
    color: '#888',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 15,
  },
  transactionsListContainer: { paddingHorizontal: 20, paddingTop: 10 },
  transactionItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#252525',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#383838',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: { flex: 1 },
  transactionPayee: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#e8e8e8',
    marginBottom: 3,
  },
  transactionTimestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  transactionCategory: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#ccc',
    backgroundColor: '#3e3e3e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    overflow: 'hidden',
  },
  transactionAmountContainer: {
    marginLeft: 10,
    alignItems: 'flex-end',
    minWidth: 80,
  },
  transactionAmount: { fontSize: 16, fontFamily: 'Inter-Bold' },
  debitAmount: { color: '#FF7675' },
  creditAmount: { color: '#55E6C1' },
  separator: { height: 0 },
  // --- New and Modified Styles for Forecast ---
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  forecastLabel: {
    fontSize: 15,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
  },
  forecastValue: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  forecastSeparator: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 12,
  },
  forecastTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  forecastTotalLabel: {
    fontSize: 16,
    color: '#e0e0e0',
    fontFamily: 'Inter-Bold',
  },
  forecastTotalValue: {
    fontSize: 16,
    color: '#8e44ad',
    fontFamily: 'Inter-Bold',
  },
  // --- New Styles for Total Expenditure Card ---
  totalExpenditureCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  totalExpenditureLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#e0e0e0',
  },
  totalExpenditureValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
});