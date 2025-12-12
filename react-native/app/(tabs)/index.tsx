import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ServiceCard from '@/components/ServiceCard';
import QuickStatCard from '@/components/QuickStatCard';
import RecentActivityCard from '@/components/RecentActivityCard';
import { COLORS, SIZES } from '@/constants/theme';
import { SERVICES } from '@/constants/services';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return currentDate.toLocaleDateString('en-US', options);
  };

  const handleServicePress = (route: string) => {
    // Map routes to actual screen paths
    const routeMap: Record<string, string> = {
      '/lost-found': '/(screens)/lost-found',
      '/marketplace': '/(screens)/marketplace',
      '/attendance': '/(screens)/attendance',
      '/mess-menu': '/(screens)/mess-menu',
      '/resources': '/(screens)/resources',
      '/ride-share': '/(screens)/ride-share',
      '/events': '/(screens)/events',
      '/clubs': '/(screens)/clubs',
      '/eateries': '/(screens)/eateries',
      '/hostel': '/(screens)/hostel',
    };

    const screenPath = routeMap[route];
    if (screenPath) {
      router.push(screenPath as any);
    } else {
      alert(`${route} - Coming Soon!`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.userName}>
                  {user?.firstName || 'Student'} {user?.lastName || ''}! 👋
                </Text>
              </View>

              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => alert('Notifications - Coming Soon!')}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.date}>{formatDate()}</Text>
          </View>

          {/* Quick Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Overview</Text>

            <QuickStatCard
              icon="calendar-outline"
              label="Overall Attendance"
              value="87.5%"
              subtext="Keep it up! 3% more for safe zone"
              gradientColors={['#4facfe', '#00f2fe']}
            />

            <QuickStatCard
              icon="ticket-outline"
              label="Upcoming Event"
              value="Tech Fest 2025"
              subtext="Tomorrow at 10:00 AM • CSE Auditorium"
              gradientColors={['#43e97b', '#38f9d7']}
            />

            <QuickStatCard
              icon="chatbubbles-outline"
              label="Unread Messages"
              value="12"
              subtext="3 group chats, 9 direct messages"
              gradientColors={['#fa709a', '#fee140']}
            />
          </View>

          {/* Services Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Campus Services</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/services')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.servicesGrid}>
              {SERVICES.map((service) => (
                <ServiceCard
                  key={service.id}
                  title={service.title}
                  icon={service.icon}
                  gradientColors={service.gradientColors}
                  onPress={() => handleServicePress(service.route)}
                  badge={service.badge}
                />
              ))}
            </View>
          </View>

          {/* Recent Activities Section */}
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            <RecentActivityCard
              icon="cart-outline"
              iconColor="#f5576c"
              iconBg="#f5576c20"
              title="New Item in Marketplace"
              description="iPhone 13 Pro Max - 128GB available for ₹45,000"
              time="2 hours ago"
              onPress={() => alert('Marketplace item - Coming Soon!')}
            />

            <RecentActivityCard
              icon="search-outline"
              iconColor="#764ba2"
              iconBg="#764ba220"
              title="Lost Item Found"
              description="Water bottle found near Library - Check Lost & Found"
              time="5 hours ago"
              onPress={() => alert('Lost & Found - Coming Soon!')}
            />

            <RecentActivityCard
              icon="car-outline"
              iconColor="#330867"
              iconBg="#30cfd020"
              title="New Ride Available"
              description="Delhi to Campus - Tomorrow 8:00 AM, 2 seats available"
              time="1 day ago"
              onPress={() => alert('Ride Share - Coming Soon!')}
            />

            <RecentActivityCard
              icon="restaurant-outline"
              iconColor="#38f9d7"
              iconBg="#43e97b20"
              title="Mess Menu Updated"
              description="Special dinner menu for Friday - Paneer Butter Masala!"
              time="2 days ago"
              onPress={() => alert('Mess Menu - Coming Soon!')}
            />

            <RecentActivityCard
              icon="book-outline"
              iconColor="#fee140"
              iconBg="#fa709a20"
              title="New Study Material"
              description="Operating Systems - Mid-Sem notes uploaded by senior"
              time="3 days ago"
              onPress={() => alert('Resources - Coming Soon!')}
            />
          </View>

          {/* Footer Spacing */}
          <View style={styles.footer} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.xl,
    backgroundColor: COLORS.white,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lastSection: {
    paddingBottom: SIZES.xl,
  },
  footer: {
    height: SIZES.xxxl,
  },
});
