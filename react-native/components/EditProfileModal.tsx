import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '@/hooks/redux';
import { updateProfile } from '@/store/slices/authSlice';
import { User } from '@/services/auth.service';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

interface EditProfileModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
}

export default function EditProfileModal({ visible, user, onClose }: EditProfileModalProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [branch, setBranch] = useState('');
  const [hostel, setHostel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(user?.name ?? '');
      setSemester(user?.semester ?? '');
      setBranch(user?.branch ?? '');
      setHostel(user?.hostel ?? '');
    }
  }, [visible, user]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Invalid Name', 'Name cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        updateProfile({
          name: name.trim(),
          semester: semester.trim(),
          branch: branch.trim(),
          hostel: hostel.trim(),
        })
      ).unwrap();
      onClose();
    } catch (error) {
      Alert.alert(
        'Update Failed',
        typeof error === 'string' ? error : 'Failed to update profile. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        if (!submitting) onClose();
      }}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={submitting}
              activeOpacity={0.7}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={COLORS.textLight}
                editable={!submitting}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Semester</Text>
              <TextInput
                style={styles.input}
                value={semester}
                onChangeText={setSemester}
                placeholder="e.g. 5"
                placeholderTextColor={COLORS.textLight}
                editable={!submitting}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Branch</Text>
              <TextInput
                style={styles.input}
                value={branch}
                onChangeText={setBranch}
                placeholder="e.g. CSE"
                placeholderTextColor={COLORS.textLight}
                editable={!submitting}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Hostel</Text>
              <TextInput
                style={styles.input}
                value={hostel}
                onChangeText={setHostel}
                placeholder="e.g. SVBH"
                placeholderTextColor={COLORS.textLight}
                editable={!submitting}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.xl,
    paddingBottom: SIZES.xxxl,
    maxHeight: '85%',
    ...SHADOWS.large,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: SIZES.xs,
  },
  field: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundDark,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SIZES.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.sm,
    ...SHADOWS.small,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
