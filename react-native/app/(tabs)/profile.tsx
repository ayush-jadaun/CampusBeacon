import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(onboarding)');
    } catch (error) {
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
          <View style={styles.profileImageContainer}>
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={50} color={COLORS.white} />
              </View>
            )}
          </View>

          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.regNumber}>Reg: {user?.registrationNumber}</Text>
          {user?.branch && user?.year && (
            <Text style={styles.courseInfo}>
              {user.branch} - Year {user.year}
            </Text>
          )}
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard label="Attendance" value="87.5%" icon="calendar" color="#4facfe" />
          <StatCard label="Posts" value="12" icon="create" color="#f093fb" />
          <StatCard label="Activities" value="45" icon="flash" color="#43e97b" />
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => alert('Edit Profile - Coming soon!')}
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
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
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
