import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
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
import { fetchRides, joinRide, leaveRide, setFilters, clearFilters } from '@/store/slices/ridesSlice';

export default function RideShareScreen() {
  const dispatch = useAppDispatch();
  const { filteredRides, isLoading, error, filters } = useAppSelector((state) => state.rides);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchRides());
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchRides());
    setIsRefreshing(false);
  };

  if (isLoading && !filteredRides.length) {
    return <LoadingState message="Loading rides..." />;
  }

  if (error && !filteredRides.length) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchRides())} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Sharing</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <TextInput
            style={styles.filterInput}
            placeholder="From (e.g., Campus)"
            value={filters.from}
            onChangeText={(text) => dispatch(setFilters({ from: text }))}
            placeholderTextColor={COLORS.textLight}
          />
          <TextInput
            style={styles.filterInput}
            placeholder="To (e.g., Railway Station)"
            value={filters.to}
            onChangeText={(text) => dispatch(setFilters({ to: text }))}
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => dispatch(clearFilters())}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredRides.length === 0 ? (
          <EmptyState
            icon="car-outline"
            title="No Rides Available"
            message={
              filters.from || filters.to
                ? 'Try adjusting your search filters'
                : 'Be the first to create a ride!'
            }
            actionLabel="Create Ride"
            onAction={() => alert('Create ride - Coming soon!')}
          />
        ) : (
          <View style={styles.ridesList}>
            {filteredRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onJoin={() => dispatch(joinRide(ride.id))}
                onLeave={() => dispatch(leaveRide(ride.id))}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Ride FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => alert('Create ride - Coming soon!')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#43e97b', '#38f9d7']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function RideCard({ ride, onJoin, onLeave }: any) {
  const [hasJoined, setHasJoined] = useState(false);
  const isAvailable = ride.seatsAvailable > 0;

  const handleAction = () => {
    if (hasJoined) {
      onLeave();
      setHasJoined(false);
    } else if (isAvailable) {
      onJoin();
      setHasJoined(true);
    }
  };

  return (
    <View style={styles.rideCard}>
      {/* Route */}
      <View style={styles.rideRoute}>
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: COLORS.success }]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>From</Text>
            <Text style={styles.routeLocation}>{ride.from}</Text>
          </View>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: COLORS.error }]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>To</Text>
            <Text style={styles.routeLocation}>{ride.to}</Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.rideDetails}>
        <View style={styles.rideDetail}>
          <Ionicons name="calendar" size={16} color={COLORS.textSecondary} />
          <Text style={styles.rideDetailText}>
            {new Date(ride.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.rideDetail}>
          <Ionicons name="time" size={16} color={COLORS.textSecondary} />
          <Text style={styles.rideDetailText}>{ride.time}</Text>
        </View>
        <View style={styles.rideDetail}>
          <Ionicons name="car" size={16} color={COLORS.textSecondary} />
          <Text style={styles.rideDetailText}>{ride.vehicleType}</Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.rideBottom}>
        <View style={styles.rideLeft}>
          <Text style={styles.ridePrice}>₹{ride.pricePerSeat}/seat</Text>
          <Text style={styles.rideSeats}>
            {ride.seatsAvailable}/{ride.totalSeats} seats available
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            hasJoined && styles.actionButtonJoined,
            !isAvailable && !hasJoined && styles.actionButtonDisabled,
          ]}
          onPress={handleAction}
          disabled={!isAvailable && !hasJoined}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>
            {hasJoined ? 'Leave' : isAvailable ? 'Join' : 'Full'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Driver Info */}
      <View style={styles.driverInfo}>
        <Ionicons name="person-circle" size={18} color={COLORS.textLight} />
        <Text style={styles.driverText}>
          {ride.driver.name} • {ride.driver.phone}
        </Text>
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
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  filterInput: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
  },
  clearFiltersText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: SIZES.xl,
    paddingBottom: SIZES.xxxl * 2,
  },
  ridesList: {
    gap: SIZES.lg,
  },
  rideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  rideRoute: {
    marginBottom: SIZES.lg,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: SIZES.md,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.backgroundDark,
    marginLeft: 5,
    marginVertical: SIZES.xs,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  routeLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  rideDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.lg,
    marginBottom: SIZES.lg,
    paddingBottom: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  rideDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  rideDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  rideBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  rideLeft: {},
  ridePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  rideSeats: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
    borderRadius: 12,
  },
  actionButtonJoined: {
    backgroundColor: COLORS.error,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  driverText: {
    fontSize: 12,
    color: COLORS.textLight,
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
