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
import { fetchEateries, submitRating } from '@/store/slices/eateriesSlice';
import { Eatery } from '@/services/eateries.service';

export default function EateriesScreen() {
  const dispatch = useAppDispatch();
  const { eateries, isLoading, error } = useAppSelector((state) => state.eateries);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedEatery, setExpandedEatery] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchEateries());
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchEateries());
    setIsRefreshing(false);
  };

  if (isLoading && !eateries.length) {
    return <LoadingState message="Loading eateries..." />;
  }

  if (error && !eateries.length) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchEateries())} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eateries</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {eateries.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title="No Eateries Available"
            message="Check back later for food options!"
          />
        ) : (
          <View style={styles.eateriesList}>
            {eateries.map((eatery) => (
              <EateryCard
                key={eatery.id}
                eatery={eatery}
                isExpanded={expandedEatery === eatery.id}
                onToggle={() =>
                  setExpandedEatery(expandedEatery === eatery.id ? null : eatery.id)
                }
                onRate={(rating: number) => dispatch(submitRating({ eateryId: eatery.id, rating }))}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EateryCard({
  eatery,
  isExpanded,
  onToggle,
  onRate,
}: {
  eatery: Eatery;
  isExpanded: boolean;
  onToggle: () => void;
  onRate: (rating: number) => void;
}) {
  const callEatery = () => {
    if (eatery.phoneNumber) {
      Linking.openURL(`tel:${eatery.phoneNumber}`).catch(() => alert('Failed to make call'));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFC107"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.eateryCard}>
      <TouchableOpacity activeOpacity={0.9} onPress={onToggle}>
        {/* Header */}
        <View style={styles.eateryHeader}>
          {eatery.menuImageUrl ? (
            <Image source={{ uri: eatery.menuImageUrl }} style={styles.eateryImage} />
          ) : (
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.eateryImagePlaceholder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="restaurant" size={32} color={COLORS.white} />
            </LinearGradient>
          )}

          <View style={styles.eateryInfo}>
            <Text style={styles.eateryName}>{eatery.name}</Text>
            <Text style={styles.eateryType}>{eatery.location}</Text>

            <View style={styles.ratingContainer}>
              {renderStars(Math.round(eatery.rating ?? 0))}
              <Text style={styles.ratingText}>
                {(eatery.rating ?? 0).toFixed(1)} ({eatery.totalRatings} reviews)
              </Text>
            </View>
          </View>

          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={COLORS.textSecondary}
          />
        </View>

        {/* Details */}
        <View style={styles.eateryDetails}>
          <View style={styles.detail}>
            <Ionicons name="location" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{eatery.location}</Text>
          </View>
          <View style={styles.detail}>
            <Ionicons name="time" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {eatery.openingTime ?? 'N/A'} - {eatery.closingTime ?? 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.description}>{eatery.description}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={callEatery}>
              <Ionicons name="call" size={18} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => alert('Rate eatery - Coming soon!')}
            >
              <Ionicons name="star" size={18} color={COLORS.primary} />
              <Text style={styles.actionButtonTextSecondary}>Rate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  eateriesList: {
    gap: SIZES.lg,
  },
  eateryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  eateryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  eateryImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: SIZES.md,
  },
  eateryImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  eateryInfo: {
    flex: 1,
  },
  eateryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  eateryType: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SIZES.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  eateryDetails: {
    gap: SIZES.sm,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  expandedContent: {
    marginTop: SIZES.lg,
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundDark,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SIZES.lg,
  },
  menuSection: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.sm,
  },
  menuItemName: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: 12,
    gap: SIZES.xs,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.backgroundDark,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonTextSecondary: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
