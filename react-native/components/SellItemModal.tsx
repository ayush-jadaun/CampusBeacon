import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import marketplaceService, { ItemCondition } from '@/services/marketplace.service';
import { LocalImage } from '@/services/api';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

const ITEM_CONDITIONS: ItemCondition[] = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

interface SellItemModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function SellItemModal({ visible, onClose, onCreated }: SellItemModalProps) {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('Good');
  const [description, setDescription] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [dateBought, setDateBought] = useState('');
  const [image, setImage] = useState<LocalImage | null>(null);
  const [errors, setErrors] = useState<{ itemName?: string; price?: string; dateBought?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setItemName('');
    setPrice('');
    setCondition('Good');
    setDescription('');
    setOwnerContact('');
    setDateBought('');
    setImage(null);
    setErrors({});
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const pickImage = async () => {
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
  };

  const validate = () => {
    const nextErrors: { itemName?: string; price?: string; dateBought?: string } = {};
    if (!itemName.trim()) {
      nextErrors.itemName = 'Item name is required';
    }
    const parsedPrice = Number(price);
    if (!price.trim()) {
      nextErrors.price = 'Price is required';
    } else if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      nextErrors.price = 'Enter a valid price (0 or more)';
    }
    if (dateBought.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dateBought.trim())) {
      nextErrors.dateBought = 'Use YYYY-MM-DD format';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await marketplaceService.create(
        {
          item_name: itemName.trim(),
          price: Math.round(Number(price)),
          item_condition: condition,
          description: description.trim() || undefined,
          owner_contact: ownerContact.trim() || undefined,
          date_bought: dateBought.trim() || undefined,
        },
        image
      );
      resetForm();
      onCreated();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Sell an Item</Text>
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
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                style={[styles.input, errors.itemName ? styles.inputError : null]}
                placeholder="What are you selling?"
                placeholderTextColor={COLORS.textLight}
                value={itemName}
                onChangeText={setItemName}
              />
              {errors.itemName && <Text style={styles.errorText}>{errors.itemName}</Text>}

              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={[styles.input, errors.price ? styles.inputError : null]}
                placeholder="e.g. 500"
                placeholderTextColor={COLORS.textLight}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

              <Text style={styles.label}>Condition *</Text>
              <View style={styles.conditionRow}>
                {ITEM_CONDITIONS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.conditionChip, condition === c && styles.conditionChipActive]}
                    onPress={() => setCondition(c)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.conditionChipText,
                        condition === c && styles.conditionChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about your item..."
                placeholderTextColor={COLORS.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone or email for buyers"
                placeholderTextColor={COLORS.textLight}
                value={ownerContact}
                onChangeText={setOwnerContact}
              />

              <Text style={styles.label}>Date Bought</Text>
              <TextInput
                style={[styles.input, errors.dateBought ? styles.inputError : null]}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor={COLORS.textLight}
                value={dateBought}
                onChangeText={setDateBought}
              />
              {errors.dateBought && <Text style={styles.errorText}>{errors.dateBought}</Text>}

              <Text style={styles.label}>Photo</Text>
              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.7}>
                  <Ionicons name="image-outline" size={28} color={COLORS.textLight} />
                  <Text style={styles.imagePickerText}>Add a photo</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Post Item</Text>
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
    maxHeight: '90%',
    ...SHADOWS.large,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: SIZES.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
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
    paddingHorizontal: SIZES.xl,
    paddingBottom: SIZES.xxxl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
    marginTop: SIZES.lg,
  },
  input: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SIZES.xs,
  },
  textArea: {
    minHeight: 96,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  conditionChip: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
  },
  conditionChipActive: {
    backgroundColor: COLORS.primary,
  },
  conditionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  conditionChipTextActive: {
    color: COLORS.white,
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
    gap: SIZES.sm,
  },
  imagePickerText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
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
    marginTop: SIZES.xxl,
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
