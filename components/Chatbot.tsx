// FILE: components/Chatbot.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { X as XIcon, Send, Bot } from 'lucide-react-native';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatbotProps {
  visible: boolean;
  onClose: () => void;
  userContext: string | null;
}

const LMSTUDIO_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:1234' : 'http://localhost:1234';
const LMSTUDIO_ENDPOINT = `${LMSTUDIO_HOST}/v1/chat/completions`;
const MODEL_NAME = "google/gemma-3-4b";

const preprocessBotMessage = (text: string): string => {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
};

export default function Chatbot({ visible, onClose, userContext }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && messages.length === 0) {
      const greetingText = userContext
        ? 'Hello! I am your personalized PayTrack assistant. I have your data loaded and am ready to help. What would you like to know?'
        : 'Hello! I am the PayTrack assistant. How can I help you today?';
      setMessages([
        { id: 'greeting', text: greetingText, sender: 'bot' },
      ]);
    }
  }, [visible, userContext]);

  useEffect(() => {
    if(messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
    };

    let systemPrompt = 'You are a helpful and friendly financial assistant for the PayTrack app. Your name is Bolt. You provide concise and accurate answers based on the user data provided. Format your answers clearly using Markdown, especially for tables.';
    if (userContext) {
      systemPrompt += `\n\nHere is the user's data in JSON format for your reference. Use this data to answer their questions. keep in mind the user is in india therefore the currency is INR(₹) Do not mention the JSON structure directly in your responses unless the user asks for it. Today's date is ${new Date().toDateString()}.\n\nUSER DATA:\n${userContext}`;
    }

    // --- FIX: Filter out the initial greeting from the history sent to the API ---
    const historyForApi = messages.filter(msg => msg.id !== 'greeting');

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...historyForApi.map(msg => ({ // Use the filtered history
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text,
      })),
      { role: 'user', content: userMessage.text },
    ];

    // Update UI optimistically
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        LMSTUDIO_ENDPOINT,
        {
          model: MODEL_NAME,
          messages: apiMessages,
          temperature: 0.3,
          max_tokens: 30000,
          stream: false,
        },
        { timeout: 600000 }
      );

      const botResponseText = response.data.choices[0]?.message?.content;

      if (botResponseText) {
        const cleanedText = preprocessBotMessage(botResponseText);
        const botMessage: ChatMessage = {
          id: response.data.id,
          text: cleanedText,
          sender: 'bot',
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('No response text from API.');
      }
    } catch (error: any) {
      console.error('Chatbot API Error:', error);
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now().toString(),
        text: `Sorry, I'm having trouble connecting. Please ensure LM Studio is running and accessible. (${error.message})`,
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Bot color="#8e44ad" size={28} />
            <Text style={styles.title}>PayTrack Assistant</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <XIcon color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              {message.sender === 'bot' ? (
                <Markdown style={markdownStyles}>{message.text}</Markdown>
              ) : (
                <Text style={styles.messageText}>{message.text}</Text>
              )}
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.botBubble]}>
              <ActivityIndicator size="small" color="#e0e0e0" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about your finances..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (isLoading || !inputText.trim()) && styles.disabledButton]}
            onPress={handleSend}
            disabled={isLoading || !inputText.trim()}
          >
            <Send color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// --- Styles for Markdown component ---
const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  heading4: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  strong: {
    fontFamily: 'Inter-Bold',
  },
  table: {
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 4,
    marginTop: 10,
  },
  thead: {
    backgroundColor: '#3a3a3a',
  },
  th: {
    flex: 1,
    padding: 8,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    borderWidth: 1,
    borderColor: '#555',
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: '#555',
    flexDirection: 'row',
  },
  td: {
    flex: 1,
    padding: 8,
    color: '#eee',
    borderWidth: 1,
    borderColor: '#555',
  },
});


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1a1a1a',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'android' ? 40 : 60,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#2a2a2a',
    },
    headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 20,
      color: '#fff',
      fontFamily: 'Inter-Bold',
    },
    closeButton: {
      padding: 5,
    },
    chatContainer: {
      flex: 1,
    },
    chatContent: {
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 10,
    },
    userBubble: {
      backgroundColor: '#8e44ad',
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    botBubble: {
      backgroundColor: '#2a2a2a',
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 15,
      color: '#fff',
      fontFamily: 'Inter-Regular',
      lineHeight: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: '#2a2a2a',
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    textInput: {
      flex: 1,
      backgroundColor: '#2a2a2a',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      maxHeight: 100,
      color: '#fff',
      fontSize: 16,
      marginRight: 10,
      fontFamily: 'Inter-Regular',
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#8e44ad',
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: '#666',
    },
});