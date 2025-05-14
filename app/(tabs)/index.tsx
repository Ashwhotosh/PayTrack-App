// app/(tabs)/index.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { QrCode, CreditCard, Wallet, Ban as Bank, Bell, Eye, EyeOff, ChevronRight, Briefcase } from 'lucide-react-native';
import { useAuth } from '@/context/authContext';
import { gql, useQuery } from '@apollo/client';

// Define types for fetched data from GraphQL
// This should align with what your GraphQL query returns for each transaction.
interface GqlTransaction {
  id: string;
  amount: string; // Comes as string from GraphQL Decimal scalar
  flow: 'CREDIT' | 'DEBIT'; // The new field indicating direction
  transactionType: 'UPI' | 'CARD' | 'NET_BANKING'; // The payment method
  timestamp: string; // ISO Date string
  category?: string | null;
  notes?: string | null;
  // Optional: If you derive merchantName on backend and include it directly:
  merchantName?: string | null;
  // Optional: If you still derive merchantName on frontend:
  upiDetails?: { payeeName?: string | null } | null;
  cardDetails?: { payeeMerchantName?: string | null } | null;
  netBankingDetails?: { payeeName?: string | null } | null;
}

// Define the structure for your local state transactions list
interface TransactionSummary {
  id: string;
  merchantName: string;
  amount: number; // Parsed amount
  displayFlow: 'CREDIT' | 'DEBIT'; // This will be used for styling and sign
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING'; // For display if needed
  timestamp: string;
  category?: string | null;
  logo?: string;
}

// GraphQL Query: Updated to fetch 'flow' and keep 'transactionType' for payment method
const GET_DASHBOARD_DATA_QUERY = gql`
  query GetDashboardData {
    transactions(limit: 5, offset: 0) { # Adjust limit as needed, e.g., 5
      id
      amount # This is Decimal (string), always positive magnitude from backend
      flow # NEW: Will be DEBIT or CREDIT (from TransactionFlow enum)
      transactionType # The payment method (UPI, CARD, NET_BANKING from TransactionType enum)
      timestamp
      category
      notes
      # To get merchant name, if not derived on backend
      upiDetails { payeeName }
      cardDetails { payeeMerchantName }
      netBankingDetails { payeeName }
      # If merchantName is derived on backend and added to GQL Transaction type:
      # merchantName
    }
    # me { totalBalance, unreadNotificationCount } # Example if fetching these
  }
`;


const paymentMethods = [
  { id: 'upi', name: 'UPI', icon: QrCode, route: '/upi-payment' },
  { id: 'card', name: 'Card', icon: CreditCard, route: '/payment-methods' },
  { id: 'wallet', name: 'Wallet', icon: Wallet, route: '/profile/wallet' },
  { id: 'bank', name: 'Bank', icon: Bank, route: '/payment-methods' },
];

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  const { data: dashboardGqlData, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboardData } =
    useQuery<{ transactions: GqlTransaction[] }>(GET_DASHBOARD_DATA_QUERY, { // Typed useQuery
      skip: !user,
      fetchPolicy: 'cache-and-network',
      onError: (err) => {
        console.error("GraphQL Error fetching dashboard data:", JSON.stringify(err, null, 2));
      }
    });

  const [balance, setBalance] = useState(12345.67);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(3);


  useEffect(() => {
    if (dashboardGqlData?.transactions) {
      const processedTransactions = dashboardGqlData.transactions.map((tx: GqlTransaction) => {
        let merchantName = tx.notes || 'Unknown Transaction'; // Fallback
        // Prefer backend-derived merchantName if available
        if (tx.merchantName) {
            merchantName = tx.merchantName;
        } else { // Fallback to frontend derivation if necessary
            if (tx.upiDetails?.payeeName) merchantName = tx.upiDetails.payeeName;
            else if (tx.cardDetails?.payeeMerchantName) merchantName = tx.cardDetails.payeeMerchantName;
            else if (tx.netBankingDetails?.payeeName) merchantName = tx.netBankingDetails.payeeName;
        }

        // Amount from GraphQL is a string (Decimal scalar), parse it.
        // Backend sends positive magnitude, 'flow' determines sign.
        const amountValue = parseFloat(tx.amount);

        return {
          id: tx.id,
          merchantName: merchantName,
          amount: amountValue, // Store the positive magnitude
          displayFlow: tx.flow, // Use the 'flow' field directly from backend
          paymentMethod: tx.transactionType, // Use 'transactionType' for payment method
          timestamp: tx.timestamp,
          category: tx.category,
          logo: getLogoForMerchant(merchantName, tx.category),
        };
      });
      setTransactions(processedTransactions);
    }
    // if (dashboardGqlData?.me?.totalBalance) setBalance(parseFloat(dashboardGqlData.me.totalBalance));
    // if (dashboardGqlData?.me?.unreadNotificationCount !== undefined) setUnreadNotifications(dashboardGqlData.me.unreadNotificationCount);
  }, [dashboardGqlData]);


  const getLogoForMerchant = (merchantName: string, category?: string | null): string => {
    const merchantLower = merchantName?.toLowerCase() || '';
    const categoryLower = category?.toLowerCase() || '';

    if (merchantLower.includes('starbucks') || categoryLower.includes('food')) return 'https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=64&h=64&fit=crop';
    if (merchantLower.includes('amazon') || categoryLower.includes('shopping')) return 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=64&h=64&fit=crop';
    if (categoryLower.includes('salary') || categoryLower.includes('income')) return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=64&h=64&fit=crop';
    if (merchantLower.includes('ola') || categoryLower.includes('transport')) return 'https://images.unsplash.com/photo-1579559750919-a657a1741695?w=64&h=64&fit=crop'; // Example for Ola
    if (merchantLower.includes('burgerking') || categoryLower.includes('food')) return 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=64&h=64&fit=crop'; // Example for Burger King

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName?.[0] || 'T')}&background=3a3a3a&color=fff&size=64&font-size=0.5`;
  };


  const handleScanPay = () => router.push('/(tabs)/scan');
  const handleViewAllTransactions = () => router.push('/transactions');
  const handlePaymentMethodPress = (route?: string) => { if (route) router.push(route as any); };

  const onRefresh = async () => {
    if (user) {
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
  const avatarInitial = (user?.firstName?.[0] || user?.lastName?.[0] || 'G').toUpperCase();
  const avatarUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarInitial)}&background=2a2a2a&color=fff&size=64&font-size=0.5`;


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={dashboardLoading && !!user}
          onRefresh={onRefresh}
          tintColor="#8e44ad"
          colors={['#8e44ad']}
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

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeButton}>
            {showBalance ? <Eye color="#fff" size={24} /> : <EyeOff color="#fff" size={24} />}
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
            <View style={styles.logoContainer}>
                <Image source={{ uri: transaction.logo }} style={styles.merchantLogo} />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.merchantName} numberOfLines={1}>{transaction.merchantName}</Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {transaction.paymentMethod} {/* Display payment method */}
              </Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={[
                styles.transactionAmount,
                transaction.displayFlow === 'CREDIT' ? styles.positiveAmount : styles.negativeAmount,
              ]}>
                {transaction.displayFlow === 'CREDIT' ? '+ ' : '- '}₹{transaction.amount.toFixed(2)} {/* Amount is already positive magnitude */}
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
    paddingBottom: 20,
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
    paddingTop: Platform.OS === 'android' ? 40 : 60,
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
    paddingHorizontal: 5, // Added padding for text
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
    width: 40,
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
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginTop: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
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
    marginHorizontal: -5,
  },
  methodCard: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
    minHeight: 90,
    justifyContent: 'center',
  },
  methodName: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  logoContainer: { // Added container for consistent logo size/bg
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3a3a3a', // Fallback if image fails or for initials
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Clip image to rounded border
  },
  merchantLogo: {
    width: '100%', // Make image fill container
    height: '100%',
    // borderRadius: 24, // Already on container
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
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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