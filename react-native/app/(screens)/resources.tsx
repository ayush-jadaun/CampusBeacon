import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingState from '@/components/LoadingState';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedBranch,
  setSelectedYear,
  resetSelection,
  fetchBranches,
  fetchYears,
  fetchMaterials,
} from '@/store/slices/resourcesSlice';
import type { Branch, Year, StudyMaterial } from '@/services/resources.service';
import type { ColorValue } from "react-native";

export default function ResourcesScreen() {
  const dispatch = useAppDispatch();
  const { branches, years, materials, selectedBranch, selectedYear, isLoading } =
    useAppSelector((state) => state.resources);

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  const handleBranchSelect = (branch: Branch) => {
    dispatch(setSelectedBranch(branch));
    dispatch(fetchYears(branch.branch_id));
  };

  const handleYearSelect = (year: Year) => {
    if (selectedBranch) {
      dispatch(setSelectedYear(year));
      dispatch(fetchMaterials({ branchId: selectedBranch.branch_id, yearId: year.year_id }));
    }
  };

  const handleBack = () => {
    if (selectedYear) {
      dispatch(setSelectedYear(null));
    } else if (selectedBranch) {
      dispatch(resetSelection());
    } else {
      router.back();
    }
  };

  const downloadResource = (url: string) => {
    Linking.openURL(url).catch(() => alert('Failed to open file'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resources</Text>
        <TouchableOpacity onPress={() => alert('Upload resource - Coming soon!')}>
          <Ionicons name="cloud-upload" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingState message="Loading resources..." />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Branch Selection */}
          {!selectedBranch && (
            <>
              <Text style={styles.instructionText}>Select your branch to access resources</Text>
              <View style={styles.grid}>
                {branches.map((branch) => (
                  <BranchCard
                    key={branch.branch_id}
                    branch={branch}
                    onPress={() => handleBranchSelect(branch)}
                  />
                ))}
              </View>
            </>
          )}

          {/* Year Selection */}
          {selectedBranch && !selectedYear && (
            <>
              <Text style={styles.instructionText}>Select your year</Text>
              <View style={styles.yearGrid}>
                {years.map((year) => (
                  <YearCard key={year.year_id} year={year} onPress={() => handleYearSelect(year)} />
                ))}
              </View>
            </>
          )}

          {/* Resources List */}
          {selectedBranch && selectedYear && (
            <>
              <Text style={styles.instructionText}>
                {selectedBranch.branch_name} - {selectedYear.year_name}
              </Text>
              {materials.length > 0 ? (
                <View style={styles.resourcesList}>
                  {materials.map((material) => (
                    <ResourceCard
                      key={material.material_id}
                      material={material}
                      onPress={() => downloadResource(material.material_url)}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={64} color={COLORS.textLight} />
                  <Text style={styles.emptyTitle}>No Resources Available</Text>
                  <Text style={styles.emptyMessage}>Be the first to upload resources for this subject!</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Upload FAB */}
      {selectedBranch && selectedYear && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => alert('Upload resource - Coming soon!')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="cloud-upload" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function BranchCard({ branch, onPress }: { branch: Branch; onPress: () => void }) {


  const branchColors: { [key: string]: readonly [ColorValue, ColorValue] } = {
    'Computer Science and Engineering': ['#667eea', '#764ba2'],
    'Electronics and Communication Engineering': ['#f093fb', '#f5576c'],
    'Mechanical Engineering': ['#4facfe', '#00f2fe'],
    'Civil Engineering': ['#43e97b', '#38f9d7'],
    'Electrical Engineering': ['#fa709a', '#fee140'],
    'Chemical Engineering': ['#30cfd0', '#330867'],
    'Biotechnology': ['#a8edea', '#fed6e3'],
  };

  return (
    <TouchableOpacity style={styles.branchCard} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={branchColors[branch.branch_name] ?? ['#667eea', '#764ba2'] as [ColorValue, ColorValue]}
        style={styles.branchGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="book" size={32} color={COLORS.white} />
        <Text style={styles.branchText}>{branch.branch_name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function YearCard({ year, onPress }: { year: Year; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.yearCard} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="school" size={40} color={COLORS.primary} />
      <Text style={styles.yearLabel}>{year.year_name}</Text>
    </TouchableOpacity>
  );
}

function ResourceCard({ material, onPress }: { material: StudyMaterial; onPress: () => void }) {
  const getFileIcon = (type: StudyMaterial['material_type']) => {
    switch (type) {
      case 'Video': return 'videocam';
      case 'PDF': return 'document-text';
      default: return 'document';
    }
  };

  return (
    <TouchableOpacity style={styles.resourceCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.resourceIcon}>
        <Ionicons name={getFileIcon(material.material_type)} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.resourceContent}>
        <Text style={styles.resourceTitle}>{material.title}</Text>
        <View style={styles.resourceMeta}>
          <View style={styles.resourceTag}>
            <Text style={styles.resourceTagText}>{material.material_type}</Text>
          </View>
        </View>
        <Text style={styles.resourceUploader}>
          Added on {new Date(material.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="download-outline" size={22} color={COLORS.primary} />
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
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
  },
  branchCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  branchGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  branchText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    paddingHorizontal: SIZES.sm,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
  },
  yearCard: {
    width: '47%',
    aspectRatio: 1.5,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  yearNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  yearLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  resourcesList: {
    gap: SIZES.md,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.lg,
    ...SHADOWS.small,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  resourceTag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: SIZES.sm,
  },
  resourceTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  resourceSubject: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  resourceUploader: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.xxxl * 2,
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
