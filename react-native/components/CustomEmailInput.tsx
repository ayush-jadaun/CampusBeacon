import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface CustomEmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export default function CustomEmailInput({ value, onChangeText, error }: CustomEmailInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Validate username portion (before @mnnit.ac.in)
  const validateUsername = (text: string): boolean => {
    const regex = /^[a-zA-Z0-9_.]*$/;
    return regex.test(text);
  };

  const handleTextChange = (text: string) => {
    // Only allow valid characters
    if (validateUsername(text) || text === '') {
      onChangeText(text);
    }
  };

  const fullEmail = value ? `${value}@mnnit.ac.in` : '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email Address</Text>

      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          placeholder="john.2022ca045"
          placeholderTextColor={COLORS.textLight}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Text style={styles.domain}>@mnnit.ac.in</Text>
      </View>

      {value && (
        <Text style={styles.preview}>Email: {fullEmail}</Text>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Text style={styles.hint}>
        Enter your MNNIT registration (e.g., john.2022ca045)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    backgroundColor: COLORS.white,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingVertical: SIZES.lg,
    fontSize: 16,
    color: COLORS.text,
  },
  domain: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
  preview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: SIZES.sm,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
  },
});
