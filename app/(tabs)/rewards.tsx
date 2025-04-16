import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Gift, Ticket, CreditCard, Coins } from 'lucide-react-native';

const rewards = [
  {
    id: 1,
    type: 'cashback',
    amount: 250.50,
    description: 'Total Cashback Earned',
    icon: CreditCard,
  },
  {
    id: 2,
    type: 'points',
    amount: 5000,
    description: 'Reward Points',
    icon: Coins,
  },
];

const coupons = [
  {
    id: 1,
    title: '20% off on Food Delivery',
    code: 'FOOD20',
    validUntil: '2024-03-31',
  },
  {
    id: 2,
    title: '₹100 off on Movie Tickets',
    code: 'MOVIE100',
    validUntil: '2024-03-15',
  },
  {
    id: 3,
    title: '15% Cashback on Shopping',
    code: 'SHOP15',
    validUntil: '2024-03-20',
  },
];

export default function RewardsPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Gift color="#8e44ad" size={32} />
        <Text style={styles.title}>My Rewards</Text>
      </View>

      <View style={styles.rewardsContainer}>
        {rewards.map((reward) => (
          <View key={reward.id} style={styles.rewardCard}>
            <reward.icon color="#8e44ad" size={32} />
            <Text style={styles.rewardAmount}>
              {reward.type === 'cashback' ? `₹${reward.amount}` : reward.amount}
            </Text>
            <Text style={styles.rewardDescription}>{reward.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.couponsSection}>
        <View style={styles.sectionHeader}>
          <Ticket color="#8e44ad" size={24} />
          <Text style={styles.sectionTitle}>Available Coupons</Text>
        </View>
        
        {coupons.map((coupon) => (
          <View key={coupon.id} style={styles.couponCard}>
            <View style={styles.couponInfo}>
              <Text style={styles.couponTitle}>{coupon.title}</Text>
              <Text style={styles.couponValidity}>Valid until {coupon.validUntil}</Text>
            </View>
            <TouchableOpacity style={styles.couponButton}>
              <Text style={styles.couponCode}>{coupon.code}</Text>
              <Text style={styles.couponButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
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
  rewardsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  rewardAmount: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 12,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  couponsSection: {
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
  couponCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  couponInfo: {
    marginBottom: 12,
  },
  couponTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  couponValidity: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  couponButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponCode: {
    fontSize: 16,
    color: '#8e44ad',
    fontFamily: 'Inter-Bold',
  },
  couponButtonText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-SemiBold',
  },
});