import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import ServiceCard from '@/components/ServiceCard';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { SERVICES } from '@/constants/services';

const ALL_SERVICES = SERVICES;

// Group services by category
const SERVICE_CATEGORIES = [
  {
    id: 'academic',
    title: 'Academic',
    icon: 'school',
    color: '#4facfe',
    services: ['Attendance Tracker', 'Resources Hub'],
  },
  {
    id: 'social',
    title: 'Social & Events',
    icon: 'people',
    color: '#43e97b',
    services: ['Events & Workshops', 'Campus Clubs'],
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    icon: 'cart',
    color: '#f093fb',
    services: ['Buy & Sell', 'Lost & Found'],
  },
  {
    id: 'campus-life',
    title: 'Campus Life',
    icon: 'home',
    color: '#fa709a',
    services: ['Mess Menu', 'Hostel Hub', 'Campus Eateries'],
  },
  {
    id: 'travel',
    title: 'Travel',
    icon: 'car',
    color: '#30cfd0',
    services: ['Ride Sharing'],
  },
];

// Featured services
const FEATURED_SERVICES = ['Events & Workshops', 'Buy & Sell', 'Attendance Tracker'];

export default function ServicesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredServices = ALL_SERVICES.filter(service => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (!selectedCategory) return true;

    const category = SERVICE_CATEGORIES.find(cat => cat.id === selectedCategory);
    return category?.services.includes(service.title);
  });

  const featuredServices = ALL_SERVICES.filter(service =>
    FEATURED_SERVICES.includes(service.title)
  );

  const handleServicePress = (route: string) => {
    if (route) {
      router.push(route as any);
    } else {
      alert('Coming soon!');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Campus Services</Text>
          <Text style={styles.headerSubtitle}>
            Everything you need, all in one place
          </Text>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textLight}
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Pills */}
        {!searchQuery && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  !selectedCategory && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Ionicons
                  name="apps"
                  size={20}
                  color={!selectedCategory ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    !selectedCategory && styles.categoryPillTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              {SERVICE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryPill,
                    selectedCategory === category.id && styles.categoryPillActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={selectedCategory === category.id ? COLORS.white : category.color}
                  />
                  <Text
                    style={[
                      styles.categoryPillText,
                      selectedCategory === category.id && styles.categoryPillTextActive,
                    ]}
                  >
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Services */}
        {!searchQuery && !selectedCategory && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.featuredBadgeText}>Popular</Text>
              </View>
            </View>
            <View style={styles.featuredGrid}>
              {featuredServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.featuredCard}
                  onPress={() => handleServicePress(service.route)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={service.gradientColors}
                    style={styles.featuredCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.featuredIconContainer}>
                      <Ionicons name={service.icon} size={28} color={COLORS.white} />
                    </View>
                    <Text style={styles.featuredCardTitle}>{service.title}</Text>
                    <Text style={styles.featuredCardDesc} numberOfLines={2}>
                      {service.description}
                    </Text>
                    {service.badge && (
                      <View style={styles.featuredBadgeOverlay}>
                        <Text style={styles.featuredBadgeOverlayText}>{service.badge}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* All Services */}
        <View style={styles.allServicesSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory
              ? SERVICE_CATEGORIES.find(cat => cat.id === selectedCategory)?.title
              : searchQuery
              ? 'Search Results'
              : 'All Services'}
          </Text>

          <View style={styles.servicesGrid}>
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                icon={service.icon}
                gradientColors={service.gradientColors}
                badge={service.badge}
                onPress={() => handleServicePress(service.route)}
              />
            ))}
          </View>

          {filteredServices.length === 0 && (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.emptyIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="search-outline" size={48} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptyMessage}>
                Try adjusting your search or filters
              </Text>
              {searchQuery && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={{ height: SIZES.xxxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xxxl,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  searchSection: {
    paddingHorizontal: SIZES.xl,
    marginTop: -SIZES.xl,
    marginBottom: SIZES.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    ...SHADOWS.medium,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  categoriesSection: {
    marginBottom: SIZES.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.md,
  },
  categoriesScroll: {
    paddingHorizontal: SIZES.xl,
    gap: SIZES.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: 24,
    marginRight: SIZES.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SIZES.xs,
  },
  categoryPillTextActive: {
    color: COLORS.white,
  },
  featuredSection: {
    marginBottom: SIZES.xl,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C4941A',
    marginLeft: SIZES.xs / 2,
  },
  featuredGrid: {
    paddingHorizontal: SIZES.xl,
    gap: SIZES.md,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  featuredCardGradient: {
    padding: SIZES.xl,
    minHeight: 140,
    position: 'relative',
  },
  featuredIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  featuredCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  featuredCardDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  featuredBadgeOverlay: {
    position: 'absolute',
    top: SIZES.lg,
    right: SIZES.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs / 2,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  featuredBadgeOverlayText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  allServicesSection: {
    paddingBottom: SIZES.xl,
  },
  servicesGrid: {
    paddingHorizontal: SIZES.xl,
    gap: SIZES.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxxl * 2,
    paddingHorizontal: SIZES.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  clearButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: 12,
    marginTop: SIZES.md,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
