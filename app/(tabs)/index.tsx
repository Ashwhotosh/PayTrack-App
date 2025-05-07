// app/(tabs)/index.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { QrCode, CreditCard, Wallet, Ban as Bank, Bell, Eye, EyeOff, ChevronRight } from 'lucide-react-native';

const mockData = {
  balance: 12345.67,
  transactions: [
    {
      id: 1,
      merchant: 'Starbucks',
      amount: -28.50,
      date: '2024-02-20',
      logo: 'https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=64&h=64&fit=crop',
      upiId: 'starbucks@icici',
      reference: 'TXN123456789',
      location: 'Mumbai, India',
    },
    {
      id: 2,
      merchant: 'Amazon',
      amount: -156.99,
      date: '2024-02-19',
      logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=64&h=64&fit=crop',
      upiId: 'amazon@icici',
      reference: 'TXN123456790',
      location: 'Online',
    },
    {
      id: 3,
      merchant: 'Salary',
      amount: 5000.00,
      date: '2024-02-18',
      logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=64&h=64&fit=crop',
      upiId: 'employer@icici',
      reference: 'TXN123456791',
      location: 'Bank Transfer',
    },
  ],
};

const paymentMethods = [
  { id: 1, name: 'UPI', icon: QrCode, route: '/upi-payment' },
  { id: 2, name: 'Credit Card', icon: CreditCard },
  { id: 3, name: 'Wallet', icon: Wallet },
  { id: 4, name: 'Bank', icon: Bank },
];

export default function HomePage() {
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState(mockData.balance);
  const [transactions] = useState(mockData.transactions.slice(0, 3));
  const unreadNotifications = 3;

  const handleScanPay = () => {
    router.push('/(tabs)/scan');
  };

  const handleViewAllTransactions = () => {
    router.push('/(tabs)/analytics');
  };

  const handlePaymentMethodPress = (route?: string) => {
    if (route) {
      router.push(route);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>John Doe</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Bell color="#fff" size={24} />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop' }}
            style={styles.avatar}
          />
        </View>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeButton}>
            {showBalance ? (
              <Eye color="#fff" size={24} />
            ) : (
              <EyeOff color="#fff" size={24} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceAmount}>
          {showBalance ? `₹${balance.toFixed(2)}` : '••••••'}
        </Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPay}>
          <QrCode color="#fff" size={24} />
          <Text style={styles.scanButtonText}>Scan & Pay</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodsScroll}>
          {paymentMethods.map((method) => (
            <TouchableOpacity 
              key={method.id} 
              style={styles.methodCard}
              onPress={() => handlePaymentMethodPress(method.route)}
            >
              <method.icon color="#8e44ad" size={24} />
              <Text style={styles.methodName}>{method.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={handleViewAllTransactions}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        {transactions.map((transaction) => (
          <TouchableOpacity 
            key={transaction.id} 
            style={styles.transaction}
            onPress={() => router.push({
              pathname: '/transaction-details',
              params: { id: transaction.id }
            })}
          >
            <Image source={{ uri: transaction.logo }} style={styles.merchantLogo} />
            <View style={styles.transactionInfo}>
              <Text style={styles.merchantName}>{transaction.merchant}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={[
                styles.transactionAmount,
                transaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount,
              ]}>
                {transaction.amount > 0 ? '+₹' : '-₹'}{Math.abs(transaction.amount).toFixed(2)}
              </Text>
              <ChevronRight color="#666" size={16} />
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#8e44ad',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  greeting: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  name: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  balanceCard: {
    backgroundColor: '#8e44ad',
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  eyeButton: {
    padding: 8,
  },
  balanceAmount: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  scanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#8e44ad',
    fontFamily: 'Inter-SemiBold',
  },
  methodsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  methodCard: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
  },
  methodName: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  merchantLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  merchantName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  transactionDate: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#FF5252',
  },
});