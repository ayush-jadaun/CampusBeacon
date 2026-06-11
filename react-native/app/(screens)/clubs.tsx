import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchClubs } from '@/store/slices/eventsSlice';
import { Club } from '@/services/events.service';

export default function ClubsScreen() {
  const dispatch = useAppDispatch();
  const { clubs, isLoading, error } = useAppSelector((state) => state.events);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchClubs());
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchClubs());
    setIsRefreshing(false);
  };

  if (isLoading && !clubs.length) {
    return <LoadingState message="Loading clubs..." />;
  }

  if (error && !clubs.length) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchClubs())} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campus Clubs</Text>
        <TouchableOpacity onPress={() => router.push('/(screens)/events' as any)}>
          <Ionicons name="calendar" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {clubs.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No Clubs Found"
            message="Check back later for new clubs!"
          />
        ) : (
          <View style={styles.clubsList}>
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const GRADIENTS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
] as const;

function getSocialIcon(url: string): {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
} {
  if (url.includes('facebook')) return { name: 'logo-facebook', color: '#1877F2' };
  if (url.includes('instagram')) return { name: 'logo-instagram', color: '#E4405F' };
  if (url.includes('linkedin')) return { name: 'logo-linkedin', color: '#0A66C2' };
  return { name: 'link', color: COLORS.primary };
}

function ClubCard({ club }: { club: Club }) {
  const colors = GRADIENTS[club.id % GRADIENTS.length];
  const logo = club.images?.[0];

  const openSocialMedia = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(() => alert('Failed to open link'));
    }
  };

  return (
    <View style={styles.clubCard}>
      {/* Header with gradient */}
      <LinearGradient
        colors={colors}
        style={styles.clubHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {logo ? (
          <Image source={{ uri: logo }} style={styles.clubLogo} />
        ) : (
          <View style={styles.clubLogoPlaceholder}>
            <Ionicons name="people" size={32} color={COLORS.white} />
          </View>
        )}
        <Text style={styles.clubName}>{club.name}</Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.clubContent}>
        {club.description ? (
          <Text style={styles.clubDescription} numberOfLines={3}>
            {club.description}
          </Text>
        ) : null}

        {/* Social Media Links */}
        {club.social_media_links && club.social_media_links.length > 0 && (
          <View style={styles.socialMedia}>
            {club.social_media_links.map((link, index) => {
              const icon = getSocialIcon(link);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.socialButton}
                  onPress={() => openSocialMedia(link)}
                >
                  <Ionicons name={icon.name} size={20} color={icon.color} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(screens)/events' as any)}
          >
            <Ionicons name="calendar-outline" size={18} color={COLORS.white} />
            <Text style={styles.actionButtonText}>View Events</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SIZES.xl,
    paddingBottom: SIZES.xxxl,
  },
  clubsList: {
    gap: SIZES.lg,
  },
  clubCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  clubHeader: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  clubLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: COLORS.white,
    marginBottom: SIZES.md,
  },
  clubLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    marginBottom: SIZES.md,
  },
  clubName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  clubContent: {
    padding: SIZES.lg,
  },
  clubDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SIZES.lg,
  },
  socialMedia: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    gap: SIZES.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: 12,
    gap: SIZES.xs,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
