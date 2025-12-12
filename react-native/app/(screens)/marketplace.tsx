import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import marketplaceService, { MarketplaceItem } from '@/services/marketplace.service';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other'];

export default function MarketplaceScreen() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, items]);

  const fetchItems = async () => {
    try {
      setError('');
      const response = await marketplaceService.getAll();
      if (response.success) {
        setItems(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Hide sold items
    filtered = filtered.filter(item => !item.isSold);

    setFilteredItems(filtered);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchItems();
  };

  const handleItemPress = (item: MarketplaceItem) => {
    alert(`Item details: ${item.title}\nPrice: ₹${item.price}`);
  };

  if (isLoading) {
    return <LoadingState message="Loading marketplace..." />;
  }

  if (error && !items.length) {
    return <ErrorState message={error} onRetry={fetchItems} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
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

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {filteredItems.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title="No Items Found"
            message={
              searchQuery
                ? 'Try adjusting your search terms'
                : 'Be the first to sell something!'
            }
            actionLabel="Post Item"
            onAction={() => alert('Create new listing - Coming soon!')}
          />
        ) : (
          <View style={styles.itemsGrid}>
            {filteredItems.map(item => (
              <ProductCard key={item.id} item={item} onPress={() => handleItemPress(item)} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => alert('Create new listing - Coming soon!')}
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
    </SafeAreaView>
  );
}

// Product Card Component
function ProductCard({ item, onPress }: { item: MarketplaceItem; onPress: () => void }) {
  const getConditionColor = () => {
    switch (item.condition) {
      case 'new': return '#10B981';
      case 'like-new': return '#3B82F6';
      case 'good': return '#F59E0B';
      case 'fair': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Image */}
      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Ionicons name="image-outline" size={40} color={COLORS.textLight} />
        </View>
      )}

      {/* Condition Badge */}
      <View style={[styles.conditionBadge, { backgroundColor: getConditionColor() }]}>
        <Text style={styles.conditionBadgeText}>
          {item.condition.replace('-', ' ').toUpperCase()}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardPrice}>₹{item.price.toLocaleString()}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardCategory}>
            <Ionicons name="pricetag-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.cardCategoryText}>{item.category}</Text>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
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
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.xl,
    paddingBottom: SIZES.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    marginBottom: SIZES.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    marginRight: SIZES.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.xxxl * 2,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SIZES.lg,
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.backgroundDark,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  conditionBadge: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    paddingVertical: 4,
    paddingHorizontal: SIZES.sm,
    borderRadius: 8,
  },
  conditionBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SIZES.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  cardCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardCategoryText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: SIZES.xs,
  },
  cardDate: {
    fontSize: 10,
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
