import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, Filter, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';

// This will be replaced with actual DB data
const mockTransactions = [
  {
    id: 1,
    merchant: 'Starbucks',
    amount: -28.50,
    date: '2024-02-20',
    type: 'debit',
    category: 'Food & Drinks',
  },
  {
    id: 2,
    merchant: 'Amazon',
    amount: -156.99,
    date: '2024-02-19',
    type: 'debit',
    category: 'Shopping',
  },
  {
    id: 3,
    merchant: 'Salary',
    amount: 5000.00,
    date: '2024-02-18',
    type: 'credit',
    category: 'Income',
  },
  // Add more transactions...
];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions] = useState(mockTransactions);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#8e44ad" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {transactions.map((transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={styles.transactionItem}
            onPress={() => router.push({
              pathname: '/transaction-details',
              params: { id: transaction.id }
            })}
          >
            <View style={styles.transactionHeader}>
              <Text style={styles.merchantName}>{transaction.merchant}</Text>
              <Text style={[
                styles.amount,
                transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
              ]}>
                {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
            <View style={styles.transactionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{transaction.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{transaction.category}</Text>
              </View>
            </View>
            <View style={styles.viewDetails}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <ChevronDown color="#666" size={16} />
            </View>
          </TouchableOpacity>
        ))}
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
    gap: 16,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  transactionItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  merchantName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  amount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#FF5252',
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-SemiBold',
  },
});