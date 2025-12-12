import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

// Mock data for demonstration
const mockChats = [
  {
    id: '1',
    name: 'Campus Updates',
    lastMessage: 'New event: Tech Talk on AI',
    time: '10:30 AM',
    unread: 2,
    isGroup: true,
    avatar: null,
  },
  {
    id: '2',
    name: 'Lost & Found Group',
    lastMessage: 'Found a laptop near library',
    time: 'Yesterday',
    unread: 0,
    isGroup: true,
    avatar: null,
  },
  {
    id: '3',
    name: 'Marketplace Deals',
    lastMessage: 'Check out new textbooks!',
    time: '2 days ago',
    unread: 5,
    isGroup: true,
    avatar: null,
  },
];

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => alert('Search - Coming soon!')}>
          <Ionicons name="search" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Chats List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockChats.map((chat) => (
          <ChatCard key={chat.id} chat={chat} />
        ))}

        {/* Coming Soon Message */}
        <View style={styles.comingSoonCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.comingSoonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="chatbubbles" size={48} color={COLORS.white} />
            <Text style={styles.comingSoonTitle}>Real-time Chat Coming Soon!</Text>
            <Text style={styles.comingSoonMessage}>
              We're working on bringing you a fully-featured chat system to connect with your campus community.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => alert('New chat - Coming soon!')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="create" size={24} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function ChatCard({ chat }: { chat: any }) {
  return (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => alert(`Opening chat: ${chat.name}`)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {chat.avatar ? (
          <Image source={{ uri: chat.avatar }} style={styles.avatar} />
        ) : (
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.avatarPlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name={chat.isGroup ? 'people' : 'person'}
              size={24}
              color={COLORS.white}
            />
          </LinearGradient>
        )}
        {chat.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{chat.unread}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{chat.name}</Text>
          <Text style={styles.chatTime}>{chat.time}</Text>
        </View>
        <Text
          style={[styles.chatMessage, chat.unread > 0 && styles.chatMessageUnread]}
          numberOfLines={1}
        >
          {chat.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SIZES.xl,
    paddingBottom: SIZES.xxxl * 2,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SIZES.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xs,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  chatMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  chatMessageUnread: {
    fontWeight: '600',
    color: COLORS.text,
  },
  comingSoonCard: {
    marginTop: SIZES.xl,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  comingSoonGradient: {
    padding: SIZES.xxxl,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  comingSoonMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: SIZES.xl,
    bottom: SIZES.xxxl,
    borderRadius: 28,
    ...SHADOWS.large,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
