import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Plus } from 'lucide-react-native';

const transactions = [
  {
    id: 1,
    type: 'credit',
    amount: 5000,
    description: 'Salary Deposit',
    date: '2024-02-20',
    icon: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=64&h=64&fit=crop'
  },
  {
    id: 2,
    type: 'debit',
    amount: -1500,
    description: 'Rent Payment',
    date: '2024-02-19',
    icon: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=64&h=64&fit=crop'
  },
  {
    id: 3,
    type: 'credit',
    amount: 2000,
    description: 'Freelance Payment',
    date: '2024-02-18',
    icon: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=64&h=64&fit=crop'
  }
];

export default function WalletPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Wallet color="#8e44ad" size={32} />
        <Text style={styles.title}>My Wallet</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₹45,678.90</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/add-money')}
          >
            <Plus color="#fff" size={24} />
            <Text style={styles.actionButtonText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/send-money')}
          >
            <ArrowUpRight color="#fff" size={24} />
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/request-money')}
          >
            <ArrowDownLeft color="#fff" size={24} />
            <Text style={styles.actionButtonText}>Request</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <History color="#8e44ad" size={24} />
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
        
        {transactions.map((transaction) => (
          <TouchableOpacity 
            key={transaction.id} 
            style={styles.transactionItem}
            onPress={() => router.push({
              pathname: '/transaction-details',
              params: { id: transaction.id }
            })}
          >
            <Image source={{ uri: transaction.icon }} style={styles.transactionIcon} />
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
            ]}>
              {transaction.type === 'credit' ? '+' : '-'}₹{Math.abs(transaction.amount)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
  balanceCard: {
    backgroundColor: '#8e44ad',
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  balanceAmount: {
    fontSize: 36,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  transactionDate: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
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
});