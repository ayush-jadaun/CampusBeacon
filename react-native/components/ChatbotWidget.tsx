import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { sendMessage, fetchChatHistory } from '@/store/slices/chatbotSlice';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useAppDispatch();

  const { messages, isLoading } = useAppSelector((state) => state.chatbot);

  useEffect(() => {
    if (isOpen) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Load chat history
      dispatch(fetchChatHistory());
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (question.trim() === '') return;

    const userQuestion = question.trim();
    setQuestion('');

    try {
      await dispatch(sendMessage(userQuestion)).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setQuestion(suggestion);
  };

  const suggestions = [
    'What is CampusBeacon?',
    'How do I report lost items?',
    'Show me upcoming events',
    'How to check attendance?',
  ];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <Animated.View
          style={[
            styles.chatWindow,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim,
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatContainer}
          >
            {/* Header */}
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.chatHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.chatHeaderLeft}>
                <View style={styles.chatbotIcon}>
                  <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.white} />
                </View>
                <View>
                  <Text style={styles.chatHeaderTitle}>Campus Assistant</Text>
                  <Text style={styles.chatHeaderSubtitle}>Always here to help</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <View style={styles.welcomeContainer}>
                  <Ionicons name="sparkles" size={40} color="#667eea" />
                  <Text style={styles.welcomeTitle}>Hi there!</Text>
                  <Text style={styles.welcomeMessage}>
                    I'm your campus assistant. Ask me anything about CampusBeacon!
                  </Text>
                  <View style={styles.suggestionsContainer}>
                    {suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionChip}
                        onPress={() => handleSuggestionPress(suggestion)}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#667eea" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                messages.map((msg, index) => (
                  <React.Fragment key={index}>
                    {/* User Question */}
                    {msg.question && (
                      <View style={[styles.messageContainer, styles.userMessageContainer]}>
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          style={styles.userMessage}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.userMessageText}>{msg.question}</Text>
                          <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
                        </LinearGradient>
                      </View>
                    )}

                    {/* Bot Answer */}
                    {msg.answer && (
                      <View style={[styles.messageContainer, styles.botMessageContainer]}>
                        <View style={styles.botMessage}>
                          <View style={styles.botAvatarSmall}>
                            <Ionicons name="chatbubble-ellipses" size={12} color={COLORS.white} />
                          </View>
                          <View style={styles.botMessageContent}>
                            <Text style={styles.botMessageText}>{msg.answer}</Text>
                            <Text style={styles.messageTimeDark}>{formatTime(msg.timestamp)}</Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </React.Fragment>
                ))
              )}

              {isLoading && (
                <View style={styles.loadingContainer}>
                  <View style={styles.botAvatarSmall}>
                    <Ionicons name="chatbubble-ellipses" size={12} color={COLORS.white} />
                  </View>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#667eea" />
                    <Text style={styles.loadingText}>Thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask me anything..."
                placeholderTextColor={COLORS.textLight}
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={500}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !question.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!question.trim() || isLoading}
              >
                <LinearGradient
                  colors={question.trim() ? ['#667eea', '#764ba2'] : ['#ccc', '#ccc']}
                  style={styles.sendBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="send" size={16} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.floatingButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name={isOpen ? 'close' : 'chatbubble-ellipses'}
            size={28}
            color={COLORS.white}
          />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: SIZES.xxxl,
    right: SIZES.xl,
    borderRadius: 30,
    ...SHADOWS.large,
    elevation: 8,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatWindow: {
    position: 'absolute',
    bottom: SIZES.xxxl + 70,
    right: SIZES.xl,
    width: 340,
    height: 500,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    ...SHADOWS.large,
    elevation: 10,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatbotIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.sm,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  chatHeaderSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  messagesContent: {
    padding: SIZES.lg,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xxxl,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  welcomeMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xl,
    paddingHorizontal: SIZES.lg,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.sm,
    ...SHADOWS.small,
  },
  suggestionText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '500',
    flex: 1,
  },
  messageContainer: {
    marginBottom: SIZES.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessage: {
    maxWidth: '85%',
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    ...SHADOWS.small,
  },
  userMessageText: {
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 18,
    marginBottom: SIZES.xs / 2,
  },
  messageTime: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  messageTimeDark: {
    fontSize: 9,
    color: COLORS.textLight,
  },
  botMessage: {
    flexDirection: 'row',
    maxWidth: '85%',
  },
  botAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.xs,
  },
  botMessageContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    ...SHADOWS.small,
  },
  botMessageText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: SIZES.xs / 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    ...SHADOWS.small,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 16,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 80,
    marginRight: SIZES.sm,
  },
  sendBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
