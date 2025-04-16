import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { 
  CreditCard, 
  Plus,
  ChevronRight,
  Trash2
} from 'lucide-react-native';

const paymentMethods = [
  {
    id: 1,
    type: 'credit',
    name: 'Visa Credit Card',
    number: '•••• 4589',
    expiry: '12/25',
    icon: 'https://images.unsplash.com/photo-1577003811926-53b288a6e5d3?w=64&h=64&fit=crop'
  },
  {
    id: 2,
    type: 'debit',
    name: 'Mastercard Debit',
    number: '•••• 7856',
    expiry: '09/24',
    icon: 'https://images.unsplash.com/photo-1580508174046-170816f65662?w=64&h=64&fit=crop'
  },
];

export default function PaymentMethodsPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <CreditCard color="#8e44ad" size={32} />
        <Text style={styles.title}>Payment Methods</Text>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Plus color="#8e44ad" size={24} />
        <Text style={styles.addButtonText}>Add New Payment Method</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Cards</Text>
        {paymentMethods.map(method => (
          <View key={method.id} style={styles.cardItem}>
            <Image source={{ uri: method.icon }} style={styles.cardIcon} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{method.name}</Text>
              <Text style={styles.cardNumber}>{method.number} • Expires {method.expiry}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton}>
              <Trash2 color="#FF5252" size={20} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Payment Methods</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>UPI</Text>
          <ChevronRight color="#666" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Bank Account</Text>
          <ChevronRight color="#666" size={24} />
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
    padding: 20,
    paddingTop: 60,
    gap: 12,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#8e44ad',
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  cardNumber: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
});