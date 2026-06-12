import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { LocalImage } from '@/services/api';
import { CreateLostAndFoundData, LostAndFoundStatus } from '@/services/lostandfound.service';
import { useAppDispatch } from '@/store/hooks';
import { createLostFoundItem } from '@/store/slices/lostFoundSlice';

interface ReportItemModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ReportItemModal({ visible, onClose }: ReportItemModalProps) {
  const dispatch = useAppDispatch();
  const [itemName, setItemName] = useState('');
  const [status, setStatus] = useState<LostAndFoundStatus>('lost');
  const [description, setDescription] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [dateFound, setDateFound] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [image, setImage] = useState<LocalImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setItemName('');
    setStatus('lost');
    setDescription('');
    setLocationFound('');
    setDateFound('');
    setOwnerContact('');
    setImage(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImage({
          uri: asset.uri,
          name: asset.fileName ?? undefined,
          type: asset.mimeType ?? undefined,
        });
      }
    } catch {
      Alert.alert('Error', 'Could not open the image library.');
    }
  };

  const handleSubmit = async () => {
    const name = itemName.trim();
    if (!name) {
      Alert.alert('Missing Information', 'Item name is required.');
      return;
    }

    const date = dateFound.trim();
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Invalid Date', 'Date found must be in YYYY-MM-DD format, or left blank.');
      return;
    }

    const data: CreateLostAndFoundData = { item_name: name, status };
    if (description.trim()) data.description = description.trim();
    if (locationFound.trim()) data.location_found = locationFound.trim();
    if (date) data.date_found = date;
    if (ownerContact.trim()) data.owner_contact = ownerContact.trim();

    setIsSubmitting(true);
    try {
      await dispatch(createLostFoundItem({ data, image })).unwrap();
      resetForm();
      onClose();
    } catch (err) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Failed to report item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Report Item</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                disabled={isSubmitting}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formContent}
            >
              <Text style={styles.label}>
                Status <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.statusRow}>
                {(['lost', 'found'] as LostAndFoundStatus[]).map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusChip, status === s && styles.statusChipActive]}
                    onPress={() => setStatus(s)}
                    activeOpacity={0.7}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        status === s && styles.statusChipTextActive,
                      ]}
                    >
                      {s === 'lost' ? 'Lost' : 'Found'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>
                Item Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Black wallet"
                  placeholderTextColor={COLORS.textLight}
                  value={itemName}
                  onChangeText={setItemName}
                  editable={!isSubmitting}
                />
              </View>

              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputContainer, styles.multilineContainer]}>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Describe the item..."
                  placeholderTextColor={COLORS.textLight}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              </View>

              <Text style={styles.label}>Location Found</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Library, 2nd floor"
                  placeholderTextColor={COLORS.textLight}
                  value={locationFound}
                  onChangeText={setLocationFound}
                  editable={!isSubmitting}
                />
              </View>

              <Text style={styles.label}>Date Found</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (optional)"
                  placeholderTextColor={COLORS.textLight}
                  value={dateFound}
                  onChangeText={setDateFound}
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              </View>

              <Text style={styles.label}>Owner Contact</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone or email (optional)"
                  placeholderTextColor={COLORS.textLight}
                  value={ownerContact}
                  onChangeText={setOwnerContact}
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              </View>

              <Text style={styles.label}>Photo</Text>
              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImage(null)}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                >
                  <Ionicons name="image-outline" size={28} color={COLORS.textLight} />
                  <Text style={styles.imagePickerText}>Add a photo (optional)</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.md,
    maxHeight: '90%',
    ...SHADOWS.large,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SIZES.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContent: {
    paddingBottom: SIZES.xxxl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  required: {
    color: COLORS.error,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  statusChip: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
  },
  statusChipActive: {
    backgroundColor: COLORS.primary,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statusChipTextActive: {
    color: COLORS.white,
  },
  inputContainer: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    marginBottom: SIZES.lg,
  },
  multilineContainer: {
    paddingVertical: SIZES.sm,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    padding: 0,
  },
  multilineInput: {
    minHeight: 80,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    paddingVertical: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  imagePickerText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: SIZES.sm,
  },
  imagePreviewContainer: {
    marginBottom: SIZES.lg,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundDark,
  },
  removeImageButton: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SIZES.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.sm,
    ...SHADOWS.medium,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
