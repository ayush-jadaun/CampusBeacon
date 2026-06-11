import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
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
import { fetchAttendance, addAttendance } from '@/store/slices/attendanceSlice';

type MarkStatus = 'Present' | 'Absent';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const getTodayDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const getTodayLabel = () => {
  const now = new Date();
  return `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`;
};

export default function AttendanceScreen() {
  const dispatch = useAppDispatch();
  const { stats, isLoading, error } = useAppSelector((state) => state.attendance);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [marking, setMarking] = useState<{ subjectId: number; status: MarkStatus } | null>(null);

  useEffect(() => {
    dispatch(fetchAttendance());
  }, [dispatch]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchAttendance());
    setIsRefreshing(false);
  };

  const handleMark = async (subjectId: number, status: MarkStatus) => {
    if (marking) return;
    setMarking({ subjectId, status });
    try {
      await dispatch(addAttendance({ subjectId, date: getTodayDate(), status })).unwrap();
    } catch (err) {
      const message =
        typeof err === 'string' && err.length > 0
          ? err
          : 'Failed to mark attendance. Please try again.';
      Alert.alert('Attendance Not Marked', message);
    } finally {
      setMarking(null);
    }
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
        title="No Subjects Yet"
        message="Subjects appear here once you're enrolled in them. After enrolling in your courses, come back to mark and track your daily attendance."
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Attendance Tracker</Text>
          <Text style={styles.headerDate}>{getTodayLabel()}</Text>
        </View>
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
            onMark={(status) => handleMark(subject.subjectId, status)}
            markingStatus={marking?.subjectId === subject.subjectId ? marking.status : null}
            markDisabled={marking !== null}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SubjectCard({
  subject,
  onPress,
  onMark,
  markingStatus,
  markDisabled,
}: {
  subject: Subject;
  onPress: () => void;
  onMark: (status: MarkStatus) => void;
  markingStatus: MarkStatus | null;
  markDisabled: boolean;
}) {
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

        <View style={styles.markRow}>
          <Text style={styles.markLabel}>Mark today</Text>
          <View style={styles.markActions}>
            <TouchableOpacity
              style={[styles.markButton, styles.presentButton, markDisabled && styles.markButtonDisabled]}
              onPress={() => onMark('Present')}
              disabled={markDisabled}
              activeOpacity={0.7}
            >
              {markingStatus === 'Present' ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                  <Text style={[styles.markButtonText, styles.presentButtonText]}>Present</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.markButton, styles.absentButton, markDisabled && styles.markButtonDisabled]}
              onPress={() => onMark('Absent')}
              disabled={markDisabled}
              activeOpacity={0.7}
            >
              {markingStatus === 'Absent' ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                  <Text style={[styles.markButtonText, styles.absentButtonText]}>Absent</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
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
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundDark,
  },
  markLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  markActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: SIZES.sm,
    minWidth: 84,
  },
  presentButton: {
    borderColor: '#10B981',
    backgroundColor: '#10B98115',
  },
  absentButton: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444415',
  },
  markButtonDisabled: {
    opacity: 0.5,
  },
  markButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: SIZES.xs,
  },
  presentButtonText: {
    color: '#10B981',
  },
  absentButtonText: {
    color: '#EF4444',
  },
});
