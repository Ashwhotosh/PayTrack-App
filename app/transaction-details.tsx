import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Receipt, Share2, Download, Flag } from 'lucide-react-native';

export default function TransactionDetailsPage() {
  const { id } = useLocalSearchParams();

  // Update mock transaction data with ₹ symbol
  const transaction = {
    id: 1,
    type: 'debit',
    amount: -1500,
    description: 'Rent Payment',
    date: '2024-02-19 14:30:00',
    merchant: {
      name: 'Property Management Ltd',
      icon: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=128&h=128&fit=crop'
    },
    category: 'Housing',
    paymentMethod: 'Bank Account (****1234)',
    reference: 'TXN123456789',
    status: 'Completed',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
        <TouchableOpacity>
          <Share2 color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.amountCard}>
        <Image source={{ uri: transaction.merchant.icon }} style={styles.merchantIcon} />
        <Text style={styles.amount}>
          {transaction.type === 'credit' ? '+₹' : '-₹'}{Math.abs(transaction.amount)}
        </Text>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.status}>{transaction.status}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time</Text>
          <Text style={styles.detailValue}>{transaction.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{transaction.category}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method</Text>
          <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference ID</Text>
          <Text style={styles.detailValue}>{transaction.reference}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Receipt color="#8e44ad" size={24} />
          <Text style={styles.actionText}>Download Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.reportButton]}>
          <Flag color="#FF5252" size={24} />
          <Text style={[styles.actionText, styles.reportText]}>Report Issue</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  amountCard: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  merchantIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 16,
  },
  amount: {
    fontSize: 36,
    color: '#FF5252',
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
  },
  status: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'Inter-SemiBold',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  section: {
    backgroundColor: '#2a2a2a',
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#8e44ad',
    fontFamily: 'Inter-SemiBold',
  },
  reportButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  reportText: {
    color: '#FF5252',
  },
});