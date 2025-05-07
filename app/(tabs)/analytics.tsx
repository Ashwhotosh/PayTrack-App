// app/(tabs)/analytics.tsx
import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { format, subDays } from 'date-fns';
import { ChartBar, ArrowDown, ArrowUp, CreditCard, Wallet, Ban as Bank } from 'lucide-react-native';

// Types for our data structures
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  date: string;
  paymentMethod: string;
  icon: string;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// Mock data - replace with actual API calls
const mockTransactions = [
  {
    id: '1',
    title: 'Monthly salary',
    amount: 2500,
    type: 'credit',
    category: 'Salary',
    date: '08 Apr',
    paymentMethod: 'Bank Transfer',
    icon: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=64&h=64&fit=crop'
  },
  {
    id: '2',
    title: 'Grocery shopping',
    amount: 120,
    type: 'debit',
    category: 'Food',
    date: '07 Apr',
    paymentMethod: 'Credit Card',
    icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=64&h=64&fit=crop'
  },
  {
    id: '3',
    title: 'Uber ride',
    amount: 50,
    type: 'debit',
    category: 'Transportation',
    date: '06 Apr',
    paymentMethod: 'UPI',
    icon: 'https://images.unsplash.com/photo-1549925862-990f5e908238?w=64&h=64&fit=crop'
  },
  {
    id: '4',
    title: 'Movie tickets',
    amount: 200,
    type: 'debit',
    category: 'Entertainment',
    date: '05 Apr',
    paymentMethod: 'Debit Card',
    icon: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=64&h=64&fit=crop'
  },
  {
    id: '5',
    title: 'Design project payment',
    amount: 1000,
    type: 'credit',
    category: 'Freelance',
    date: '04 Apr',
    paymentMethod: 'Bank Transfer',
    icon: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=64&h=64&fit=crop'
  },
];

const categorySpending = [
  { category: 'Food', amount: 450, percentage: 30, color: '#4361EE' },
  { category: 'Transportation', amount: 300, percentage: 20, color: '#3DDC97' },
  { category: 'Entertainment', amount: 750, percentage: 50, color: '#FF9F1C' },
];

type TabType = 'transactions' | 'insights';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const data = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: subDays(new Date(), days - 1 - i),
      amount: Math.floor(Math.random() * 1000) + 500,
    }));
  }, [timeRange]);

  const chartData = {
    labels: data.map(d => format(d.date, 'd MMM')),
    datasets: [{
      data: data.map(d => d.amount),
    }],
  };

  const chartConfig = {
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    color: (opacity = 1) => `rgba(142, 68, 173, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
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

      <ScrollView style={styles.content}>
        {activeTab === 'transactions' ? (
          <View style={styles.transactionsContainer}>
            {mockTransactions.map(transaction => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Image source={{ uri: transaction.icon }} style={styles.transactionIcon} />
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionCategory}>
                      {transaction.category} • {transaction.paymentMethod}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaction.type === 'credit' ? '+₹' : '-₹'}{transaction.amount}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.insightsContainer}>
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Spending by Category</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  data={chartData}
                  width={Platform.OS === 'web' ? 800 : 360}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>
            </View>

            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              {categorySpending.map((category) => (
                <View key={category.category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.category}</Text>
                    <Text style={styles.categoryAmount}>₹{category.amount}</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${category.percentage}%`, backgroundColor: category.color }
                      ]} 
                    />
                  </View>
                  <Text style={styles.percentageText}>{category.percentage}%</Text>
                </View>
              ))}
            </View>

            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>Spending Insights</Text>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  You spend 20% more on food this month compared to last month
                </Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  Your biggest expense category is Entertainment
                </Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  Set up a budget to track your spending better
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
    gap: 12,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8e44ad',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-SemiBold',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  transactionsContainer: {
    padding: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  transactionInfo: {
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#FF5252',
  },
  transactionDate: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  insightsContainer: {
    padding: 20,
  },
  chartSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
  },
  chart: {
    borderRadius: 16,
  },
  categoriesSection: {
    marginBottom: 32,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  categoryAmount: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  insightsSection: {
    marginBottom: 32,
  },
  insightCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
});