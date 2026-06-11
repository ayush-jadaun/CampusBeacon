import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchMyChannels,
  fetchChannelMessages,
  sendMessage,
  setActiveChannel,
  addMessageToChannel,
} from '@/store/slices/chatSlice';
import chatService from '@/services/chat.service';

export default function ChatScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { channels, activeChannelId, messages, isLoading } = useAppSelector((state) => state.chat);
  const [inputText, setInputText] = useState('');
  const [showChannelList, setShowChannelList] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Load user's channels
    dispatch(fetchMyChannels());
  }, [dispatch]);

  useEffect(() => {
    if (activeChannelId) {
      // Load messages for active channel
      dispatch(fetchChannelMessages({ channelId: activeChannelId }));
      setShowChannelList(false);

      // Subscribe to realtime updates
      const sub = chatService.subscribeToChannel(activeChannelId, (newMessage) => {
        dispatch(addMessageToChannel({ channelId: activeChannelId, message: newMessage }));
      });

      setSubscription(sub);

      return () => {
        if (sub) {
          chatService.unsubscribeFromChannel(sub);
        }
      };
    }
  }, [activeChannelId, dispatch]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current && activeChannelId && messages[activeChannelId]?.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, activeChannelId]);

  const handleSend = async () => {
    if (inputText.trim() === '' || !activeChannelId || !user) return;

    const content = inputText.trim();
    setInputText('');

    try {
      await dispatch(sendMessage({
        channelId: activeChannelId,
        content,
        userId: user.id,
      })).unwrap();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleChannelPress = (channelId: number) => {
    dispatch(setActiveChannel(channelId));
  };

  const handleBackToChannels = () => {
    setShowChannelList(true);
    dispatch(setActiveChannel(null as any));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeMessages = activeChannelId ? messages[activeChannelId] || [] : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        {!showChannelList && (
          <TouchableOpacity onPress={handleBackToChannels} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          {showChannelList ? (
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.headerIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="chatbubbles" size={24} color={COLORS.white} />
            </LinearGradient>
          ) : null}
          <View>
            <Text style={styles.headerTitle}>
              {showChannelList ? 'Messages' : activeChannel?.name || 'Chat'}
            </Text>
            {!showChannelList && activeChannel?.type && (
              <Text style={styles.headerSubtitle}>
                {activeChannel.type === 'direct' ? 'Direct Message' : activeChannel.type}
              </Text>
            )}
          </View>
        </View>
        {!showChannelList && (
          <TouchableOpacity onPress={() => alert('Channel info')}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      {showChannelList ? (
        // Channel List
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.channelList}>
          {isLoading && channels.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading channels...</Text>
            </View>
          ) : channels.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.emptyIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="chatbubbles" size={48} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No Conversations Yet</Text>
              <Text style={styles.emptyMessage}>
                Start chatting with other students or join event channels
              </Text>
            </View>
          ) : (
            channels.map((channel) => (
              <TouchableOpacity
                key={channel.id}
                style={styles.channelCard}
                onPress={() => handleChannelPress(channel.id)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={channel.type === 'direct' ? ['#4facfe', '#00f2fe'] : ['#43e97b', '#38f9d7']}
                  style={styles.channelAvatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={channel.type === 'direct' ? 'person' : 'people'}
                    size={24}
                    color={COLORS.white}
                  />
                </LinearGradient>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>{channel.name}</Text>
                  {channel.description && (
                    <Text style={styles.channelDescription} numberOfLines={1}>
                      {channel.description}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        // Messages View
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
          keyboardVerticalOffset={90}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading && activeMessages.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : activeMessages.length === 0 ? (
              <View style={styles.emptyMessagesState}>
                <Text style={styles.emptyMessagesText}>No messages yet</Text>
                <Text style={styles.emptyMessagesSubtext}>Start the conversation!</Text>
              </View>
            ) : (
              activeMessages.map((message, index) => {
                const isMyMessage = message.userId === user?.id;
                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageContainer,
                      isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
                    ]}
                  >
                    {!isMyMessage && (
                      <View style={styles.messageAvatar}>
                        <Ionicons name="person-circle" size={32} color={COLORS.primary} />
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isMyMessage ? styles.myMessageText : styles.otherMessageText,
                        ]}
                      >
                        {message.content}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
                        ]}
                      >
                        {formatTime(message.createdAt)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor={COLORS.textLight}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={inputText.trim() ? ['#667eea', '#764ba2'] : ['#ccc', '#ccc']}
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="send" size={20} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SIZES.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  channelList: {
    padding: SIZES.xl,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  channelAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs / 2,
  },
  channelDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SIZES.xl,
    paddingBottom: SIZES.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: SIZES.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    ...SHADOWS.small,
  },
  myMessageBubble: {
    backgroundColor: '#667eea',
    borderTopRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: SIZES.xs / 2,
  },
  myMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 10,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: COLORS.textLight,
  },
  loadingContainer: {
    paddingVertical: SIZES.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SIZES.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxxl * 2,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyMessagesState: {
    alignItems: 'center',
    paddingVertical: SIZES.xxxl,
  },
  emptyMessagesText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 20,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
    marginRight: SIZES.sm,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
