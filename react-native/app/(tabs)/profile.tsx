import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import EditProfileModal from '@/components/EditProfileModal';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { fetchAttendance } from '@/store/slices/attendanceSlice';
import { fetchMyListings } from '@/store/slices/marketplaceSlice';
import { fetchRecentActivities } from '@/store/slices/activitySlice';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const { stats } = useAppSelector((state) => state.attendance);
  const { myListings } = useAppSelector((state) => state.marketplace);
  const { activities } = useAppSelector((state) => state.activity);
  const [statsLoading, setStatsLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        await Promise.all([
          dispatch(fetchAttendance()).unwrap(),
          dispatch(fetchMyListings()).unwrap(),
          dispatch(fetchRecentActivities(50)).unwrap(),
        ]);
      } catch (error) {
        console.error('Failed to load profile stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [dispatch]);

  const calculateOverallAttendance = () => {
    const subjects = stats?.subjects;
    if (!subjects || subjects.length === 0) return '0.0%';

    const totalClasses = subjects.reduce((sum, subject) => sum + subject.totalDays, 0);
    const totalAttended = subjects.reduce((sum, subject) => sum + subject.presentDays, 0);

    if (totalClasses === 0) return '0.0%';
    return ((totalAttended / totalClasses) * 100).toFixed(1) + '%';
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(onboarding)');
    } catch {
      alert('Failed to logout');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={18} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.profileImageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={50} color={COLORS.white} />
            </View>
          </View>

          <Text style={styles.name}>{user?.name || 'Student'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.registration_number && (
            <Text style={styles.regNumber}>Reg: {user.registration_number}</Text>
          )}
          {user?.branch && user?.semester && (
            <Text style={styles.courseInfo}>
              {user.branch} - Semester {user.semester}
            </Text>
          )}
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {statsLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.statsLoadingText}>Loading stats...</Text>
            </View>
          ) : (
            <>
              <StatCard
                label="Attendance"
                value={calculateOverallAttendance()}
                icon="calendar"
                color="#4facfe"
              />
              <StatCard
                label="Marketplace Posts"
                value={myListings?.length || 0}
                icon="cart"
                color="#f093fb"
              />
              <StatCard
                label="Activities"
                value={activities?.length || 0}
                icon="flash"
                color="#43e97b"
              />
            </>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => setEditModalVisible(true)}
          />
          <MenuItem
            icon="settings-outline"
            label="Settings"
            onPress={() => alert('Settings - Coming soon!')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => alert('Notifications - Coming soon!')}
          />
          <MenuItem
            icon="bookmark-outline"
            label="Saved Items"
            onPress={() => alert('Saved Items - Coming soon!')}
          />
          <MenuItem
            icon="share-social-outline"
            label="Share App"
            onPress={() => alert('Share App - Coming soon!')}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => alert('Help & Support - Coming soon!')}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About"
            onPress={() => alert('CampusBeacon v1.0.0\nMade with ❤️ at MNNIT')}
          />
          <MenuItem
            icon="log-out-outline"
            label="Logout"
            onPress={handleLogout}
            isDestructive
          />
        </View>

        <View style={{ height: SIZES.xxxl }} />
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        user={user}
        onClose={() => setEditModalVisible(false)}
      />
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={24} color={color} />
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{String(value)}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress, isDestructive }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={isDestructive ? COLORS.error : COLORS.textSecondary}
        />
        <Text
          style={[styles.menuItemLabel, isDestructive && { color: COLORS.error }]}
        >
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    padding: SIZES.xxxl,
    alignItems: 'center',
    paddingTop: SIZES.xxxxl,
  },
  editButton: {
    position: 'absolute',
    top: SIZES.xl,
    right: SIZES.xl,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  profileImageContainer: {
    marginBottom: SIZES.lg,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SIZES.xs,
  },
  regNumber: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  courseInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SIZES.xs,
  },
  statsContainer: {
    padding: SIZES.xl,
    gap: SIZES.md,
  },
  statsLoading: {
    paddingVertical: SIZES.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsLoadingText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SIZES.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  statContent: {
    marginLeft: SIZES.lg,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.xl,
    borderRadius: 12,
    padding: SIZES.sm,
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: SIZES.lg,
    fontWeight: '500',
  },
});
