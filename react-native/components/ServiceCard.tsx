import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

interface ServiceCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string];
  onPress: () => void;
  badge?: number;
}

export default function ServiceCard({ title, icon, gradientColors, onPress, badge }: ServiceCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}

        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={32} color={COLORS.white} />
        </View>

        <Text style={styles.title}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '47%',
    marginBottom: SIZES.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gradient: {
    padding: SIZES.lg,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: SIZES.xs,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xs,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
