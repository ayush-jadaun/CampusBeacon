import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

interface QuickStatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  gradientColors: string[];
  subtext?: string;
}

export default function QuickStatCard({ icon, label, value, gradientColors, subtext }: QuickStatCardProps) {
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={COLORS.white} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtext && <Text style={styles.subtext}>{subtext}</Text>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.lg,
    borderRadius: 16,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SIZES.xs,
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SIZES.xs,
  },
});
