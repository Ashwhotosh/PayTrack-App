// FILE: components/ChatbotFAB.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MessageSquare } from 'lucide-react-native';

interface ChatbotFABProps {
  onPress: () => void;
}

export default function ChatbotFAB({ onPress }: ChatbotFABProps) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <MessageSquare color="#fff" size={30} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    // FIX: Increased the bottom position on Android to avoid overlapping the tab bar.
    bottom: Platform.OS === 'ios' ? 90 : 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8e44ad',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});