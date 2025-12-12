import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
import { fetchHostels, fetchMessMenu, setSelectedHostel } from '@/store/slices/hostelSlice';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

export default function MessMenuScreen() {
  const dispatch = useAppDispatch();
  const { hostels, selectedHostel, menu, isLoading, error } = useAppSelector(
    (state) => state.hostel
  );
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>(
    getCurrentMeal()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchHostels());
  }, []);

  useEffect(() => {
    if (selectedHostel) {
      dispatch(fetchMessMenu(selectedHostel));
    }
  }, [selectedHostel]);

  function getCurrentMeal(): 'breakfast' | 'lunch' | 'dinner' {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 16) return 'lunch';
    return 'dinner';
  }

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchHostels());
    if (selectedHostel) {
      await dispatch(fetchMessMenu(selectedHostel));
    }
    setIsRefreshing(false);
  };

  if (isLoading && !hostels.length) {
    return <LoadingState message="Loading mess menu..." />;
  }

  if (error && !hostels.length) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchHostels())} />;
  }

  const currentHostel = hostels.find((h) => h.id === selectedHostel) || hostels[0];
  const todayMenu = menu.filter(
    (m) => m.day === DAYS[new Date().getDay() - 1] && m.mealType === selectedMeal
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mess Menu</Text>
        <TouchableOpacity onPress={() => alert('Submit complaint - Coming soon!')}>
          <Ionicons name="chatbox-ellipses" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hostel Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hostelScroll}>
          {hostels.map((hostel) => (
            <TouchableOpacity
              key={hostel.id}
              style={[
                styles.hostelChip,
                currentHostel?.id === hostel.id && styles.hostelChipActive,
              ]}
              onPress={() => dispatch(setSelectedHostel(hostel.id))}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.hostelChipText,
                  currentHostel?.id === hostel.id && styles.hostelChipTextActive,
                ]}
              >
                {hostel.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meal Type Tabs */}
        <View style={styles.mealTabs}>
          {MEAL_TYPES.map((meal) => (
            <TouchableOpacity
              key={meal}
              style={[styles.mealTab, selectedMeal === meal && styles.mealTabActive]}
              onPress={() => setSelectedMeal(meal)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={
                  meal === 'breakfast'
                    ? 'sunny'
                    : meal === 'lunch'
                    ? 'partly-sunny'
                    : 'moon'
                }
                size={20}
                color={selectedMeal === meal ? COLORS.white : COLORS.textSecondary}
              />
              <Text
                style={[styles.mealTabText, selectedMeal === meal && styles.mealTabTextActive]}
              >
                {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Menu */}
        <View style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Today's Menu</Text>
            <Text style={styles.menuDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
          </View>

          {todayMenu.length > 0 ? (
            <View style={styles.menuItems}>
              {todayMenu[0].items.map((item, index) => (
                <View key={index} style={styles.menuItem}>
                  <Ionicons name="restaurant" size={18} color={COLORS.primary} />
                  <Text style={styles.menuItemText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="fast-food-outline"
              title="No Menu Available"
              message="Menu for this meal has not been uploaded yet"
            />
          )}
        </View>

        {/* Weekly Menu */}
        <Text style={styles.sectionTitle}>Weekly Menu</Text>
        {DAYS.map((day) => (
          <WeeklyMenuCard
            key={day}
            day={day}
            menu={menu.filter((m) => m.day === day && m.mealType === selectedMeal)}
          />
        ))}
      </ScrollView>

      {/* Complaint FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => alert('Submit complaint - Coming soon!')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="chatbox-ellipses" size={24} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function WeeklyMenuCard({ day, menu }: { day: string; menu: any[] }) {
  const isToday = DAYS[new Date().getDay() - 1] === day;

  return (
    <View style={[styles.weeklyCard, isToday && styles.weeklyCardToday]}>
      <View style={styles.weeklyCardHeader}>
        <Text style={[styles.weeklyCardDay, isToday && styles.weeklyCardDayToday]}>{day}</Text>
        {isToday && <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>Today</Text></View>}
      </View>

      {menu.length > 0 ? (
        <View style={styles.weeklyMenuItems}>
          {menu[0].items.map((item, index) => (
            <Text key={index} style={styles.weeklyMenuItem}>• {item}</Text>
          ))}
        </View>
      ) : (
        <Text style={styles.noMenuText}>No menu available</Text>
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
    paddingBottom: SIZES.xxxl * 2,
  },
  hostelScroll: {
    flexGrow: 0,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
  },
  hostelChip: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: SIZES.sm,
    ...SHADOWS.small,
  },
  hostelChipActive: {
    backgroundColor: COLORS.primary,
  },
  hostelChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  hostelChipTextActive: {
    color: COLORS.white,
  },
  mealTabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.lg,
    gap: SIZES.sm,
  },
  mealTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    gap: SIZES.xs,
    ...SHADOWS.small,
  },
  mealTabActive: {
    backgroundColor: COLORS.primary,
  },
  mealTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  mealTabTextActive: {
    color: COLORS.white,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.xl,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    ...SHADOWS.medium,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  menuDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  menuItems: {
    gap: SIZES.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  menuItemText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  weeklyCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.xl,
    borderRadius: 12,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  weeklyCardToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  weeklyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  weeklyCardDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  weeklyCardDayToday: {
    color: COLORS.primary,
  },
  todayBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  weeklyMenuItems: {
    gap: SIZES.xs,
  },
  weeklyMenuItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  noMenuText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
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
