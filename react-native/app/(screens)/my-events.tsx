import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchEvents,
  fetchMyRegistrations,
  fetchRegistrationCounts,
  unregisterFromEvent,
} from '@/store/slices/eventsSlice';
import { Event, EventStatus, getEventStatus } from '@/services/events.service';

export default function MyEventsScreen() {
  const dispatch = useAppDispatch();
  const { events, isLoading, registeredEventIds, registrationCounts, registeringEventId } =
    useAppSelector((state) => state.events);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchMyRegistrations());
    dispatch(fetchRegistrationCounts());
  }, [dispatch]);

  const myEvents = useMemo(() => {
    const registered = events.filter((event) => registeredEventIds.includes(event.id));
    const active = registered
      .filter((event) => getEventStatus(event) !== 'completed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = registered
      .filter((event) => getEventStatus(event) === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { active, past };
  }, [events, registeredEventIds]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchEvents()),
      dispatch(fetchMyRegistrations()),
      dispatch(fetchRegistrationCounts()),
    ]);
    setIsRefreshing(false);
  };

  const handleUnregister = (event: Event) => {
    Alert.alert(
      'Unregister',
      `Unregister from "${event.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unregister',
          style: 'destructive',
          onPress: async () => {
            const result = await dispatch(unregisterFromEvent(event.id));
            if (unregisterFromEvent.rejected.match(result)) {
              Alert.alert('Error', (result.payload as string) || 'Failed to unregister');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !events.length) {
    return <LoadingState message="Loading your events..." />;
  }

  const totalRegistered = myEvents.active.length + myEvents.past.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Events</Text>
        <TouchableOpacity onPress={() => router.push('/(screens)/events' as any)}>
          <Ionicons name="calendar" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {totalRegistered === 0 ? (
          <EmptyState
            icon="ticket-outline"
            title="No Registered Events"
            message="Events you register for will show up here"
            actionLabel="Browse Events"
            onAction={() => router.push('/(screens)/events' as any)}
          />
        ) : (
          <>
            {myEvents.active.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Upcoming &amp; Ongoing</Text>
                <View style={styles.eventsList}>
                  {myEvents.active.map((event) => (
                    <MyEventCard
                      key={event.id}
                      event={event}
                      registrationCount={registrationCounts[event.id] ?? 0}
                      isPending={registeringEventId === event.id}
                      onUnregister={handleUnregister}
                    />
                  ))}
                </View>
              </>
            )}

            {myEvents.past.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Past Events</Text>
                <View style={styles.eventsList}>
                  {myEvents.past.map((event) => (
                    <MyEventCard
                      key={event.id}
                      event={event}
                      registrationCount={registrationCounts[event.id] ?? 0}
                      isPending={false}
                      onUnregister={null}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MyEventCard({
  event,
  registrationCount,
  isPending,
  onUnregister,
}: {
  event: Event;
  registrationCount: number;
  isPending: boolean;
  onUnregister: ((event: Event) => void) | null;
}) {
  const statusColors: Record<EventStatus, string> = {
    upcoming: '#4facfe',
    ongoing: '#43e97b',
    completed: '#95a5a6',
  };

  const status = getEventStatus(event);
  const image = event.images?.[0];
  const eventDate = new Date(event.date);

  return (
    <View style={styles.eventCard}>
      <View style={styles.cardRow}>
        {image ? (
          <Image source={{ uri: image }} style={styles.eventThumb} />
        ) : (
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.eventThumbPlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="calendar" size={24} color={COLORS.white} />
          </LinearGradient>
        )}

        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {event.name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[status] }]}>
              <Text style={styles.statusBadgeText}>{status}</Text>
            </View>
          </View>

          <View style={styles.eventDetail}>
            <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText}>
              {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' · '}
              {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.eventDetail}>
            <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.eventDetail}>
              <Ionicons name="people-outline" size={13} color={COLORS.textSecondary} />
              <Text style={styles.eventDetailText}>
                {event.max_participants != null
                  ? `${registrationCount}/${event.max_participants}`
                  : registrationCount}{' '}
                registered
              </Text>
            </View>

            {onUnregister && (
              <TouchableOpacity
                style={styles.unregisterButton}
                onPress={() => onUnregister(event)}
                disabled={isPending}
                activeOpacity={0.7}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color={COLORS.error} />
                ) : (
                  <Text style={styles.unregisterButtonText}>Unregister</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
    marginTop: SIZES.sm,
  },
  eventsList: {
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  cardRow: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  eventThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  eventThumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  eventTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: SIZES.sm,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginBottom: 2,
  },
  eventDetailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  unregisterButton: {
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.error,
    minWidth: 90,
    alignItems: 'center',
  },
  unregisterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
  },
});
