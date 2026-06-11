import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchHostels, fetchMessMenu, fetchOfficials, setSelectedHostel } from '@/store/slices/hostelSlice';

type TabType = 'menu' | 'officials' | 'complaints';

export default function HostelScreen() {
  const dispatch = useAppDispatch();
  const { hostels, selectedHostel, menu, officials, isLoading, error } = useAppSelector(
    (state) => state.hostel
  );
  const [selectedTab, setSelectedTab] = useState<TabType>('menu');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchHostels());
  }, [dispatch]);

  useEffect(() => {
    if (selectedHostel) {
      if (selectedTab === 'menu') {
        dispatch(fetchMessMenu(selectedHostel));
      } else if (selectedTab === 'officials') {
        dispatch(fetchOfficials(selectedHostel));
      }
    }
  }, [selectedHostel, selectedTab, dispatch]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchHostels());
    if (selectedHostel) {
      if (selectedTab === 'menu') {
        await dispatch(fetchMessMenu(selectedHostel));
      } else if (selectedTab === 'officials') {
        await dispatch(fetchOfficials(selectedHostel));
      }
    }
    setIsRefreshing(false);
  };

  if (isLoading && !hostels.length) {
    return <LoadingState message="Loading hostel info..." />;
  }

  if (error && !hostels.length) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchHostels())} />;
  }

  const currentHostel = hostels.find((h) => h.hostel_id === selectedHostel) || hostels[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hostel</Text>
        <TouchableOpacity onPress={() => router.push('/(screens)/mess-menu' as any)}>
          <Ionicons name="restaurant" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Hostel Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hostelScroll}>
        {hostels.map((hostel) => (
          <TouchableOpacity
            key={hostel.hostel_id}
            style={[
              styles.hostelChip,
              currentHostel?.hostel_id === hostel.hostel_id && styles.hostelChipActive,
            ]}
            onPress={() => dispatch(setSelectedHostel(hostel.hostel_id))}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.hostelChipText,
                currentHostel?.hostel_id === hostel.hostel_id && styles.hostelChipTextActive,
              ]}
            >
              {hostel.hostel_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'menu' && styles.tabActive]}
          onPress={() => setSelectedTab('menu')}
        >
          <Ionicons
            name="restaurant"
            size={20}
            color={selectedTab === 'menu' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, selectedTab === 'menu' && styles.tabTextActive]}>
            Menu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'officials' && styles.tabActive]}
          onPress={() => setSelectedTab('officials')}
        >
          <Ionicons
            name="people"
            size={20}
            color={selectedTab === 'officials' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, selectedTab === 'officials' && styles.tabTextActive]}>
            Officials
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'complaints' && styles.tabActive]}
          onPress={() => setSelectedTab('complaints')}
        >
          <Ionicons
            name="megaphone"
            size={20}
            color={selectedTab === 'complaints' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, selectedTab === 'complaints' && styles.tabTextActive]}>
            Complaints
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedTab === 'menu' && <MenuTab menu={menu} />}
        {selectedTab === 'officials' && <OfficialsTab officials={officials} />}
        {selectedTab === 'complaints' && <ComplaintsTab />}
      </ScrollView>

      {/* Floating Complaint Button */}
      {selectedTab === 'complaints' && (
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
            <Ionicons name="add" size={28} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function MenuTab({ menu }: { menu: any[] }) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.infoText}>
        View detailed mess menu in the Mess Menu section
      </Text>
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => router.push('/(screens)/mess-menu' as any)}
      >
        <Ionicons name="restaurant" size={20} color={COLORS.white} />
        <Text style={styles.infoButtonText}>View Mess Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

function OfficialsTab({ officials }: { officials: any[] }) {
  const callOfficial = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => alert('Failed to make call'));
  };

  const emailOfficial = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() => alert('Failed to open email'));
  };

  return (
    <View style={styles.tabContent}>
      {officials.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Officials Listed</Text>
          <Text style={styles.emptyMessage}>Contact information will be available soon</Text>
        </View>
      ) : (
        <View style={styles.officialsList}>
          {officials.map((official) => (
            <View key={official.id} style={styles.officialCard}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.officialIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="person" size={24} color={COLORS.white} />
              </LinearGradient>

              <View style={styles.officialInfo}>
                <Text style={styles.officialName}>{official.name}</Text>
                <Text style={styles.officialPosition}>{official.position}</Text>

                <View style={styles.officialContacts}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => callOfficial(official.phone)}
                  >
                    <Ionicons name="call" size={16} color={COLORS.primary} />
                    <Text style={styles.contactText}>{official.phone}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => emailOfficial(official.email)}
                  >
                    <Ionicons name="mail" size={16} color={COLORS.primary} />
                    <Text style={styles.contactText} numberOfLines={1}>
                      {official.email}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ComplaintsTab() {
  return (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
        <Text style={styles.infoCardTitle}>Submit Your Complaints</Text>
        <Text style={styles.infoCardText}>
          Have an issue with hostel facilities, mess food, or maintenance? Submit a complaint and our team will address it.
        </Text>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => alert('Submit complaint - Coming soon!')}
        >
          <Text style={styles.submitButtonText}>Submit Complaint</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.complaintsSection}>
        <Text style={styles.sectionTitle}>Recent Complaints</Text>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle" size={64} color={COLORS.success} />
          <Text style={styles.emptyTitle}>All Clear!</Text>
          <Text style={styles.emptyMessage}>No recent complaints from this hostel</Text>
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
  hostelScroll: {
    flexGrow: 0,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.white,
  },
  hostelChip: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    marginRight: SIZES.sm,
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.xl,
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    gap: SIZES.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  scrollContent: {
    padding: SIZES.xl,
    paddingBottom: SIZES.xxxl * 2,
  },
  tabContent: {},
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
    borderRadius: 12,
    gap: SIZES.sm,
  },
  infoButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
  officialsList: {
    gap: SIZES.lg,
  },
  officialCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    ...SHADOWS.small,
  },
  officialIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  officialInfo: {
    flex: 1,
  },
  officialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  officialPosition: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SIZES.sm,
  },
  officialContacts: {
    gap: SIZES.xs,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  contactText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.xl,
    alignItems: 'center',
    marginBottom: SIZES.xl,
    ...SHADOWS.medium,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  infoCardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.lg,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xxxl,
    borderRadius: 12,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
  complaintsSection: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.xxxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.lg,
    marginBottom: SIZES.xs,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
