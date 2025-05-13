// app/(tabs)/index.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { QrCode, CreditCard, Wallet, Ban as Bank, Bell, Eye, EyeOff, ChevronRight, Briefcase } from 'lucide-react-native'; // Added Briefcase
import { useAuth } from '@/context/authContext';
import { gql, useQuery } from '@apollo/client'; // For fetching data

// Define types for fetched data
interface TransactionSummary {
  id: string; // Changed from number to string to match Prisma CUID
  merchantName: string; // Example: 'Starbucks', 'Amazon', or Payer/Payee Name
  amount: number; // Store as number
  transactionType: 'CREDIT' | 'DEBIT'; // Or use your backend enum values
  timestamp: string; // ISO Date string
  category?: string | null;
  // Add a field for logo/icon if you plan to fetch it or map it
  logo?: string; // e.g., based on category or merchant
}

interface DashboardData {
  totalBalance: number; // Or string if your backend sends Decimal as string
  recentTransactions: TransactionSummary[];
  // Add other dashboard specific data like unreadNotifications if fetched from backend
}

// Example GraphQL Query (You'll need to create this on your backend)
const GET_DASHBOARD_DATA_QUERY = gql`
  query GetDashboardData {
    # Query for total balance (you'd need a resolver for this)
    # Example: myTotalBalance 
    # For now, we'll keep balance local or assume it's part of 'me' query

    # Query for recent transactions (modify your existing 'transactions' query if needed)
    transactions(limit: 3, offset: 0) { # Using existing query, adjust limit
      id
      amount # This is Decimal, will be string or number based on scalar
      transactionType
      timestamp
      category
      notes # Can be used for merchant/description if no dedicated field
      # To get merchant name, we need to look into details
      upiDetails { payeeName }
      cardDetails { payeeMerchantName }
      netBankingDetails { payeeName }
    }
    # me { unreadNotificationCount } # If you add this to 'me' query
  }
`;


const paymentMethods = [
  { id: 'upi', name: 'UPI', icon: QrCode, route: '/upi-payment' },
  { id: 'card', name: 'Card', icon: CreditCard, route: '/payment-methods' }, // Route to manage cards
  { id: 'wallet', name: 'Wallet', icon: Wallet, route: '/profile/wallet' },
  { id: 'bank', name: 'Bank', icon: Bank, route: '/payment-methods' }, // Route to manage bank accounts
];

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  // Apollo Query for dashboard data
  const { data: dashboardGqlData, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboardData } =
    useQuery(GET_DASHBOARD_DATA_QUERY, {
      skip: !user, // Don't run query if user is not logged in
      fetchPolicy: 'cache-and-network', // Get from cache first, then network
    });

  // Mock data to be replaced by GQL data
  const [balance, setBalance] = useState(12345.67); // Will be replaced or calculated
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // TODO: Fetch this


  // Process fetched transactions
  useEffect(() => {
    if (dashboardGqlData?.transactions) {
      const processedTransactions = dashboardGqlData.transactions.map((tx: any) => {
        let merchantName = tx.notes || 'Unknown Transaction'; // Fallback
        if (tx.upiDetails?.payeeName) merchantName = tx.upiDetails.payeeName;
        else if (tx.cardDetails?.payeeMerchantName) merchantName = tx.cardDetails.payeeMerchantName;
        else if (tx.netBankingDetails?.payeeName) merchantName = tx.netBankingDetails.payeeName;

        // Determine if it's credit or debit based on your logic (e.g. positive/negative amount or a type field)
        // Assuming amount is positive for credit, negative for debit if not explicitly typed
        const amountValue = parseFloat(tx.amount); // tx.amount is Prisma.Decimal, will be string or number

        return {
          id: tx.id,
          merchantName: merchantName,
          amount: amountValue,
          // Assuming transactionType is 'CREDIT' or 'DEBIT' or similar from your backend
          // For this example, inferring from amount value if not present
          transactionType: amountValue >= 0 ? 'CREDIT' : 'DEBIT',
          timestamp: tx.timestamp,
          category: tx.category,
          logo: getLogoForMerchant(merchantName, tx.category), // Implement this helper
        };
      });
      setTransactions(processedTransactions);
    }
    // TODO: Set actual balance from backend (e.g., a dedicated query or part of 'me')
    // if (dashboardGqlData?.myTotalBalance) setBalance(parseFloat(dashboardGqlData.myTotalBalance));
  }, [dashboardGqlData]);


  const getLogoForMerchant = (merchantName: string, category?: string | null): string => {
    // Simple logic, expand as needed
    if (merchantName?.toLowerCase().includes('starbucks') || category?.toLowerCase().includes('food')) return 'https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=64&h=64&fit=crop';
    if (merchantName?.toLowerCase().includes('amazon') || category?.toLowerCase().includes('shopping')) return 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=64&h=64&fit=crop';
    if (category?.toLowerCase().includes('salary') || category?.toLowerCase().includes('income')) return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=64&h=64&fit=crop';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName?.[0] || 'T')}&background=3a3a3a&color=fff&size=64`; // Default
  };


  const handleScanPay = () => router.push('/(tabs)/scan');
  const handleViewAllTransactions = () => router.push('/transactions'); // Navigate to full transactions list
  const handlePaymentMethodPress = (route?: string) => { if (route) router.push(route); };

  const onRefresh = async () => {
    if (user) { // Only refetch if user is logged in
      try {
        await refetchDashboardData();
      } catch (e) {
        console.error("Failed to refetch dashboard data:", e);
      }
    }
  };


  if (authLoading && !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8e44ad" />
      </View>
    );
  }

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Guest';
  // Use a placeholder avatar if `user.avatarUrl` is not available (same as profile page)
  const avatarUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.split(' ')[0]?.[0] || 'P')}&background=2a2a2a&color=fff&size=64`;


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={dashboardLoading && !!user} // Show refreshing if loading and user exists
          onRefresh={onRefresh}
          tintColor="#8e44ad" // For iOS
          colors={['#8e44ad']} // For Android
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},</Text>
          <Text style={styles.name}>{displayName}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Bell color="#fff" size={24} />
            {unreadNotifications > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadNotifications}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeButton}>
            {showBalance ? <Eye color="#fff" size={24} /> : <EyeOff color="#fff" size={24} />}
          </TouchableOpacity>
        </View>
        {/* TODO: Fetch actual balance */}
        <Text style={styles.balanceAmount}>
          {showBalance ? `₹${balance.toFixed(2)}` : '••••••'}
        </Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPay}>
          <QrCode color="#fff" size={24} />
          <Text style={styles.scanButtonText}>Scan & Pay</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Methods Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
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

      {/* Recent Transactions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={handleViewAllTransactions}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        {dashboardLoading && transactions.length === 0 && <ActivityIndicator color="#8e44ad" style={{ marginVertical: 20 }}/>}
        {!dashboardLoading && dashboardError && <Text style={styles.errorText}>Error loading transactions: {dashboardError.message}</Text>}
        {!dashboardLoading && !dashboardError && transactions.length === 0 && <Text style={styles.noTransactionsText}>No recent transactions.</Text>}

        {transactions.map((transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={styles.transactionItem}
            onPress={() => router.push({ pathname: '/transaction-details', params: { id: transaction.id } })}
          >
            <Image source={{ uri: transaction.logo }} style={styles.merchantLogo} />
            <View style={styles.transactionInfo}>
              <Text style={styles.merchantName} numberOfLines={1}>{transaction.merchantName}</Text>
              <Text style={styles.transactionDate}>{new Date(transaction.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={[
                styles.transactionAmount,
                transaction.transactionType === 'CREDIT' ? styles.positiveAmount : styles.negativeAmount,
              ]}>
                {transaction.transactionType === 'CREDIT' ? '+ ' : '- '}₹{Math.abs(transaction.amount).toFixed(2)}
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
  scrollContent: {
    paddingBottom: 20, // For scrollable content
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60, // Adjust for status bar
    paddingBottom: 10,
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
    width: 40, // Slightly smaller avatar in header
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  balanceCard: {
    backgroundColor: '#8e44ad',
    marginHorizontal: 20,
    marginTop: 20,
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
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10, // Reduced margin
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30, // Increased spacing between sections
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
    marginHorizontal: -5, // Slight adjustment for card spacing
  },
  methodCard: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100, // Fixed width for method cards
    minHeight: 90, // Ensure consistent height
    justifyContent: 'center',
  },
  methodName: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  transactionItem: { // Renamed from 'transaction' for clarity
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
    backgroundColor: '#3a3a3a', // Fallback bg for logo
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  merchantName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  transactionDate: {
    color: '#999',
    fontSize: 13, // Slightly smaller
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Reduced gap
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
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'Inter-Regular',
  },
  noTransactionsText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  }
});