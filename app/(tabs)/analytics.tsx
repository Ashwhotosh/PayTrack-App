import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChartBar, ArrowDown, ArrowUp, TrendingUp } from 'lucide-react-native';
import SpendingPieChart from '../../components/SpendingPieChart';

type TabType = 'transactions' | 'insights';
type TimeRange = '7d' | '30d';
type ViewType = 'actual' | 'forecast';

const categorySpending = [
  { name: 'Food & Dining', amount: 450, percentage: 15, color: '#4361EE' },
  { name: 'Transportation', amount: 300, percentage: 10, color: '#3DDC97' },
  { name: 'Entertainment', amount: 750, percentage: 25, color: '#FF9F1C' },
  { name: 'Shopping', amount: 600, percentage: 20, color: '#F72585' },
  { name: 'Bills & Utilities', amount: 450, percentage: 15, color: '#7209B7' },
  { name: 'Health', amount: 150, percentage: 5, color: '#4CC9F0' },
  { name: 'Education', amount: 180, percentage: 6, color: '#FB8500' },
  { name: 'Others', amount: 120, percentage: 4, color: '#8338EC' }
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [viewType, setViewType] = useState<ViewType>('actual');

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['7d', '30d'] as TimeRange[]).map((range) => (
        <TouchableOpacity
          key={range}
          style={[styles.timeRangeButton, timeRange === range && styles.activeTimeRange]}
          onPress={() => setTimeRange(range)}
        >
          <Text style={[styles.timeRangeText, timeRange === range && styles.activeTimeRangeText]}>
            {range === '7d' ? 'Week' : 'Month'}
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
          style={[styles.viewTypeButton, viewType === type && styles.activeViewType]}
          onPress={() => setViewType(type)}
        >
          {type === 'actual' ? (
            <ChartBar color={viewType === type ? '#fff' : '#666'} size={20} />
          ) : (
            <TrendingUp color={viewType === type ? '#fff' : '#666'} size={20} />
          )}
          <Text style={[styles.viewTypeText, viewType === type && styles.activeViewTypeText]}>
            {type === 'actual' ? 'Actual' : 'Forecast'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
        {activeTab === 'insights' && (
          <View style={styles.insightsContainer}>
            {renderTimeRangeSelector()}
            {renderViewTypeSelector()}

            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Spending by Category</Text>
              <SpendingPieChart categories={categorySpending} />
            </View>

            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>Spending Insights</Text>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <ArrowUp color="#4CAF50" size={24} />
                  <Text style={styles.insightTitle}>Highest Spending Category</Text>
                </View>
                <Text style={styles.insightText}>
                  Entertainment accounts for 25% of your monthly spending
                </Text>
              </View>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <ArrowDown color="#FF5252" size={24} />
                  <Text style={styles.insightTitle}>Unusual Activity</Text>
                </View>
                <Text style={styles.insightText}>
                  Your shopping expenses increased by 30% compared to last month
                </Text>
              </View>
              {viewType === 'forecast' && (
                <View style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <TrendingUp color="#8e44ad" size={24} />
                    <Text style={styles.insightTitle}>Forecast Alert</Text>
                  </View>
                  <Text style={styles.insightText}>
                    Based on your spending pattern, you might exceed your monthly budget by ₹2,000
                  </Text>
                </View>
              )}
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
  insightsContainer: {
    padding: 20,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTimeRange: {
    backgroundColor: '#8e44ad',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-SemiBold',
  },
  activeTimeRangeText: {
    color: '#fff',
  },
  viewTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  viewTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
  },
  activeViewType: {
    backgroundColor: '#8e44ad',
  },
  viewTypeText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-SemiBold',
  },
  activeViewTypeText: {
    color: '#fff',
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
  insightsSection: {
    marginBottom: 32,
  },
  insightCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  insightText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
});