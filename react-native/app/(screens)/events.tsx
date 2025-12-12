import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
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
import { fetchEvents, setEventFilter, registerForEvent } from '@/store/slices/eventsSlice';

const FILTERS = ['upcoming', 'ongoing', 'completed', 'all'] as const;

export default function EventsScreen() {
  const dispatch = useAppDispatch();
  const { filteredEvents, isLoading, error, eventFilter } = useAppSelector((state) => state.events);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchEvents());
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchEvents());
    setIsRefreshing(false);
  };

  if (isLoading && !filteredEvents.length) {
    return <LoadingState message="Loading events..." />;
  }

  if (error && !filteredEvents.length) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchEvents())} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
        <TouchableOpacity onPress={() => router.push('/(screens)/clubs' as any)}>
          <Ionicons name="people" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, eventFilter === filter && styles.filterChipActive]}
            onPress={() => dispatch(setEventFilter(filter))}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterChipText, eventFilter === filter && styles.filterChipTextActive]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No Events Found"
            message="Check back later for upcoming events!"
          />
        ) : (
          <View style={styles.eventsList}>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={() => dispatch(registerForEvent(event.id))}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EventCard({ event, onRegister }: any) {
  const statusColors = {
    upcoming: '#4facfe',
    ongoing: '#43e97b',
    completed: '#95a5a6',
  };

  const isFull = event.currentParticipants >= event.maxParticipants;

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => alert(`Event details: ${event.title}`)}
      activeOpacity={0.7}
    >
      {/* Event Image */}
      {event.image ? (
        <Image source={{ uri: event.image }} style={styles.eventImage} />
      ) : (
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.eventImagePlaceholder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="calendar" size={48} color={COLORS.white} />
        </LinearGradient>
      )}

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColors[event.status] }]}>
        <Text style={styles.statusBadgeText}>{event.status}</Text>
      </View>

      {/* Content */}
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>

        {/* Event Details */}
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Ionicons name="calendar" size={14} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText}>
              {new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons name="time" size={14} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText}>{event.time}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons name="location" size={14} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        </View>

        {/* Club Info */}
        <View style={styles.clubInfo}>
          {event.club.logo ? (
            <Image source={{ uri: event.club.logo }} style={styles.clubLogo} />
          ) : (
            <View style={styles.clubLogoPlaceholder}>
              <Ionicons name="people" size={16} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.clubName}>{event.club.name}</Text>
        </View>

        {/* Registration */}
        {event.registrationRequired && event.status === 'upcoming' && (
          <View style={styles.registrationSection}>
            <Text style={styles.participantsText}>
              {event.currentParticipants}/{event.maxParticipants} registered
            </Text>
            <TouchableOpacity
              style={[styles.registerButton, isFull && styles.registerButtonDisabled]}
              onPress={onRegister}
              disabled={isFull}
              activeOpacity={0.7}
            >
              <Text style={styles.registerButtonText}>{isFull ? 'Full' : 'Register'}</Text>
            </TouchableOpacity>
          </View>
        )}
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
  filtersScroll: {
    flexGrow: 0,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  filtersContent: {
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    gap: SIZES.sm,
  },
  filterChip: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: SIZES.xl,
    paddingBottom: SIZES.xxxl,
  },
  eventsList: {
    gap: SIZES.lg,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  eventImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: SIZES.md,
    right: SIZES.md,
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  eventContent: {
    padding: SIZES.lg,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
    lineHeight: 20,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  eventDetailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundDark,
    marginBottom: SIZES.md,
  },
  clubLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SIZES.sm,
  },
  clubLogoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.sm,
  },
  clubName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  registrationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 12,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  registerButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
});
