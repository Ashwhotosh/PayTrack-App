import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { CircleHelp as HelpCircle, MessageCircle, Phone, Mail, ChevronDown, ChevronRight } from 'lucide-react-native';

const faqs = [
  {
    id: 1,
    question: 'How do I add a new payment method?',
    answer: 'To add a new payment method, go to Profile > Payment Methods and tap on "Add New Payment Method". Follow the instructions to add your card or bank account.',
  },
  {
    id: 2,
    question: 'What should I do if I forget my PIN?',
    answer: 'If you forget your PIN, go to Profile > Security Settings > Change Transaction PIN. You\'ll need to verify your identity before setting a new PIN.',
  },
  {
    id: 3,
    question: 'How do I report a suspicious transaction?',
    answer: 'If you notice any suspicious activity, immediately contact our 24/7 support team through the app or call our helpline. We\'ll help you secure your account and investigate the transaction.',
  },
];

export default function HelpSupportPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <HelpCircle color="#8e44ad" size={32} />
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for help"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactGrid}>
          <TouchableOpacity style={styles.contactCard}>
            <MessageCircle color="#8e44ad" size={32} />
            <Text style={styles.contactText}>Live Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard}>
            <Phone color="#8e44ad" size={32} />
            <Text style={styles.contactText}>Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard}>
            <Mail color="#8e44ad" size={32} />
            <Text style={styles.contactText}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Topics</Text>
        <View style={styles.topicsGrid}>
          {['Payments', 'Account', 'Security', 'Rewards'].map((topic) => (
            <TouchableOpacity key={topic} style={styles.topicCard}>
              <Text style={styles.topicText}>{topic}</Text>
              <ChevronRight color="#666" size={20} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq) => (
          <TouchableOpacity key={faq.id} style={styles.faqItem}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <ChevronDown color="#666" size={20} />
            </View>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.supportButton}>
        <Text style={styles.supportButtonText}>Contact Support Team</Text>
      </TouchableOpacity>
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
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    width: '48%',
  },
  topicText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  faqItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 12,
  },
  supportButton: {
    backgroundColor: '#8e44ad',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
});