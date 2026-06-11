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
import * as Progress from 'react-native-progress';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { Subject } from '@/services/attendance.service';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAttendance } from '@/store/slices/attendanceSlice';

export default function AttendanceScreen() {
  const dispatch = useAppDispatch();
  const { stats, isLoading, error } = useAppSelector((state) => state.attendance);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAttendance());
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchAttendance());
    setIsRefreshing(false);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 85) return '#10B981';
    if (percentage >= 75) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusMessage = (percentage: number) => {
    if (percentage >= 85) return 'Excellent! Keep it up!';
    if (percentage >= 75) return 'Good! Stay consistent!';
    return 'Alert! Need more classes!';
  };

  if (isLoading) {
    return <LoadingState message="Loading attendance..." />;
  }

  if (error && !stats) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchAttendance())} />;
  }

  if (!stats || !stats.subjects || stats.subjects.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="No Attendance Data"
        message="Start marking your attendance to track progress"
        actionLabel="Add Attendance"
        onAction={() => alert('Add attendance - Coming soon!')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Tracker</Text>
        <TouchableOpacity onPress={() => alert('Analytics - Coming soon!')}>
          <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Overall Stats Card */}
        <LinearGradient
          colors={[getPercentageColor(stats.overallPercentage), getPercentageColor(stats.overallPercentage) + '88']}
          style={styles.overallCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.overallLabel}>Overall Attendance</Text>
          <Text style={styles.overallPercentage}>{stats.overallPercentage.toFixed(1)}%</Text>
          <Text style={styles.overallStatus}>{getStatusMessage(stats.overallPercentage)}</Text>

          <View style={styles.overallStats}>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatValue}>{stats.attendedClasses}</Text>
              <Text style={styles.overallStatLabel}>Present</Text>
            </View>
            <View style={styles.overallStatDivider} />
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatValue}>{stats.totalClasses}</Text>
              <Text style={styles.overallStatLabel}>Total</Text>
            </View>
            <View style={styles.overallStatDivider} />
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatValue}>{stats.totalSubjects}</Text>
              <Text style={styles.overallStatLabel}>Subjects</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Subjects List */}
        <Text style={styles.sectionTitle}>Subject-wise Attendance</Text>

        {stats.subjects.map(subject => (
          <SubjectCard
            key={subject.subjectId}
            subject={subject}
            onPress={() => alert(`Subject details: ${subject.name}`)}
          />
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => alert('Mark attendance - Coming soon!')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
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

function SubjectCard({ subject, onPress }: { subject: Subject; onPress: () => void }) {
  const percentage = subject.percentage;
  const color = percentage >= 85 ? '#10B981' : percentage >= 75 ? '#F59E0B' : '#EF4444';

  return (
    <TouchableOpacity style={styles.subjectCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.subjectHeader}>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <Text style={styles.subjectCode}>{subject.code}</Text>
        </View>
        <View style={[styles.percentageBadge, { backgroundColor: color }]}>
          <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
        </View>
      </View>

      <View style={styles.subjectBody}>
        <Progress.Bar
          progress={percentage / 100}
          width={null}
          height={8}
          color={color}
          unfilledColor={COLORS.backgroundDark}
          borderWidth={0}
          borderRadius={4}
          style={styles.progressBar}
        />

        <View style={styles.subjectStats}>
          <View style={styles.subjectStat}>
            <Ionicons name="checkmark-circle" size={16} color={color} />
            <Text style={styles.subjectStatText}>
              {subject.presentDays}/{subject.totalDays} classes
            </Text>
          </View>
          {subject.credits != null && (
            <Text style={styles.creditsText}>{subject.credits} Credits</Text>
          )}
        </View>
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
  scrollContent: {
    padding: SIZES.xl,
    paddingBottom: SIZES.xxxl * 2,
  },
  overallCard: {
    padding: SIZES.xxxl,
    borderRadius: 20,
    marginBottom: SIZES.xl,
    ...SHADOWS.large,
  },
  overallLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SIZES.xs,
  },
  overallPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  overallStatus: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: SIZES.xl,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: SIZES.lg,
  },
  overallStatItem: {
    alignItems: 'center',
  },
  overallStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  overallStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SIZES.xs,
  },
  overallStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  subjectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  subjectCode: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  percentageBadge: {
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subjectBody: {},
  progressBar: {
    marginBottom: SIZES.md,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectStatText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
  creditsText: {
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
