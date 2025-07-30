import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../services/api';
import { ChatMessage, AIResponse } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.messageBubble,
      isUser ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={[
        styles.messageText,
        isUser ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {message.content}
      </Text>
      <Text style={[
        styles.messageTime,
        isUser ? styles.userMessageTime : styles.assistantMessageTime
      ]}>
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load conversation history or show welcome message
    loadInitialMessages();
  }, []);

  const loadInitialMessages = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: "Hello! I'm your AI coding assistant. I can help you with:\n\n• Writing and debugging code\n• Explaining programming concepts\n• Reviewing your projects\n• Suggesting improvements\n\nWhat would you like to work on today?",
      role: 'assistant',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // For demo purposes, simulate AI response
      // In production, this would call apiClient.sendMessage()
      const response = await simulateAIResponse(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate AI response for demo
  const simulateAIResponse = async (userMessage: string): Promise<AIResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const responses = [
      "I'd be happy to help you with that! Could you provide more details about what you're working on?",
      "That's a great question! Here's how I would approach this problem...",
      "I can help you implement that feature. Let me break it down into steps:",
      "Based on your description, I recommend using the following approach:",
      "Here's a code example that should solve your problem:\n\n```javascript\nfunction example() {\n  // Your code here\n  return 'Hello, World!';\n}\n```",
    ];
    
    return {
      message: responses[Math.floor(Math.random() * responses.length)],
    };
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => setInputText('Help me debug this code')}
      >
        <Text style={styles.quickActionText}>Debug Code</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => setInputText('Explain this concept')}
      >
        <Text style={styles.quickActionText}>Explain</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => setInputText('Review my project')}
      >
        <Text style={styles.quickActionText}>Review</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>AI is typing...</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        {messages.length <= 1 && renderQuickActions()}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about coding..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || loading) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={(!inputText.trim() || loading) ? '#9ca3af' : '#16a34a'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#16a34a',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  assistantMessageTime: {
    color: '#9ca3af',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-around',
  },
  quickActionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    maxHeight: 120,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});