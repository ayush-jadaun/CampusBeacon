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
import { fetchClubs, setClubCategoryFilter } from '@/store/slices/eventsSlice';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Literary', 'Social'];

export default function ClubsScreen() {
  const dispatch = useAppDispatch();
  const { filteredClubs, isLoading, error, clubCategoryFilter } = useAppSelector(
    (state) => state.events
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchClubs());
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchClubs());
    setIsRefreshing(false);
  };

  if (isLoading && !filteredClubs.length) {
    return <LoadingState message="Loading clubs..." />;
  }

  if (error && !filteredClubs.length) {
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

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              clubCategoryFilter === category && styles.categoryChipActive,
            ]}
            onPress={() => dispatch(setClubCategoryFilter(category))}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryChipText,
                clubCategoryFilter === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredClubs.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No Clubs Found"
            message="Try selecting a different category"
          />
        ) : (
          <View style={styles.clubsList}>
            {filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ClubCard({ club }: any) {
  const categoryColors: { [key: string]: string[] } = {
    Technical: ['#667eea', '#764ba2'],
    Cultural: ['#f093fb', '#f5576c'],
    Sports: ['#4facfe', '#00f2fe'],
    Literary: ['#43e97b', '#38f9d7'],
    Social: ['#fa709a', '#fee140'],
  };

  const colors = categoryColors[club.category] || ['#667eea', '#764ba2'];

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
        {club.logo ? (
          <Image source={{ uri: club.logo }} style={styles.clubLogo} />
        ) : (
          <View style={styles.clubLogoPlaceholder}>
            <Ionicons name="people" size={32} color={COLORS.white} />
          </View>
        )}
        <Text style={styles.clubName}>{club.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{club.category}</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.clubContent}>
        <Text style={styles.clubDescription} numberOfLines={3}>
          {club.description}
        </Text>

        {/* Social Media Links */}
        <View style={styles.socialMedia}>
          {club.socialMedia.facebook && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openSocialMedia(club.socialMedia.facebook)}
            >
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            </TouchableOpacity>
          )}
          {club.socialMedia.instagram && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openSocialMedia(club.socialMedia.instagram)}
            >
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
            </TouchableOpacity>
          )}
          {club.socialMedia.linkedin && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openSocialMedia(club.socialMedia.linkedin)}
            >
              <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
            </TouchableOpacity>
          )}
        </View>

        {/* Coordinators */}
        {club.coordinators && club.coordinators.length > 0 && (
          <View style={styles.coordinators}>
            <Text style={styles.coordinatorsTitle}>Coordinators:</Text>
            {club.coordinators.map((coordinator: any, index: number) => (
              <View key={index} style={styles.coordinator}>
                <Ionicons name="person-circle" size={16} color={COLORS.textSecondary} />
                <Text style={styles.coordinatorText}>
                  {coordinator.name} • {coordinator.phone}
                </Text>
              </View>
            ))}
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
  categoriesScroll: {
    flexGrow: 0,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  categoriesContent: {
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    gap: SIZES.sm,
  },
  categoryChip: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: COLORS.white,
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
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
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
  coordinators: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
  },
  coordinatorsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  coordinator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginTop: SIZES.xs,
  },
  coordinatorText: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
