import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import CustomEmailInput from '../../components/CustomEmailInput';
import { COLORS, SIZES } from '../../constants/theme';
import authService from '../../services/auth.service';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailUsername: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: '',
    };

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Validate email username
    if (!formData.emailUsername.trim()) {
      newErrors.email = 'Email username is required';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.emailUsername)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Validate terms
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const fullEmail = `${formData.emailUsername}@mnnit.ac.in`;
      const response = await authService.signup({
        email: fullEmail,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (response.success) {
        Alert.alert(
          'Success!',
          'Account created successfully! Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      } else {
        Alert.alert('Signup Failed', response.message || 'An error occurred');
      }
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { googleAuthService } = require('../../services/google-auth.service');
      const result = await googleAuthService.signInWithGoogle();

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Authentication Cancelled', result.message || 'Google Sign-In was cancelled');
      }
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CampusBeacon with your MNNIT email</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                value={formData.firstName}
                onChangeText={(text) => updateFormData('firstName', text)}
                placeholder="Enter your first name"
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="words"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                value={formData.lastName}
                onChangeText={(text) => updateFormData('lastName', text)}
                placeholder="Enter your last name"
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="words"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Email Input */}
            <CustomEmailInput
              value={formData.emailUsername}
              onChangeText={(text) => updateFormData('emailUsername', text)}
              error={errors.email}
            />

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[
                styles.passwordContainer,
                errors.password && styles.inputError,
              ]}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  placeholder="Create a password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[
                styles.passwordContainer,
                errors.confirmPassword && styles.inputError,
              ]}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  placeholder="Confirm your password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Checkbox
                value={agreeToTerms}
                onValueChange={setAgreeToTerms}
                color={agreeToTerms ? COLORS.primary : COLORS.border}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms & Conditions</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
            {errors.terms && (
              <Text style={styles.errorText}>{errors.terms}</Text>
            )}

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={24} color={COLORS.error} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.xl,
  },
  header: {
    marginTop: SIZES.xl,
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.lg,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: SIZES.lg,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: SIZES.sm,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: SIZES.sm,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.lg,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SIZES.md,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xl,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SIZES.lg,
    color: COLORS.textLight,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginBottom: SIZES.xl,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SIZES.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.md,
    marginBottom: SIZES.xxxl,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
