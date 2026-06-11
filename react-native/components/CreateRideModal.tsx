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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createRide } from '@/store/slices/ridesSlice';
import type { CreateRideData } from '@/services/rides.service';

interface CreateRideModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateRideModal({ visible, onClose }: CreateRideModalProps) {
  const dispatch = useAppDispatch();
  const isCreating = useAppSelector((state) => state.rides.isCreating);

  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setPickupLocation('');
    setDropLocation('');
    setDepartureDate('');
    setDepartureTime('');
    setTotalSeats('');
    setEstimatedCost('');
    setPhoneNumber('');
    setDescription('');
  };

  const handleClose = () => {
    if (isCreating) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!pickupLocation.trim() || !dropLocation.trim()) {
      Alert.alert('Missing Fields', 'Pickup and drop locations are required.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(departureDate.trim())) {
      Alert.alert('Invalid Date', 'Enter the departure date as YYYY-MM-DD.');
      return;
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(departureTime.trim())) {
      Alert.alert('Invalid Time', 'Enter the departure time as HH:MM (24-hour).');
      return;
    }

    const departure = new Date(`${departureDate.trim()}T${departureTime.trim()}:00`);
    if (Number.isNaN(departure.getTime())) {
      Alert.alert('Invalid Date', 'The departure date and time is not valid.');
      return;
    }

    if (departure.getTime() <= Date.now()) {
      Alert.alert('Invalid Date', 'Departure must be in the future.');
      return;
    }

    const seats = parseInt(totalSeats.trim(), 10);
    if (!Number.isInteger(seats) || seats < 1) {
      Alert.alert('Invalid Seats', 'Total seats must be a number of at least 1.');
      return;
    }

    let cost: number | undefined;
    if (estimatedCost.trim()) {
      cost = Number(estimatedCost.trim());
      if (Number.isNaN(cost) || cost < 0) {
        Alert.alert('Invalid Cost', 'Estimated cost must be a non-negative number.');
        return;
      }
    }

    const data: CreateRideData = {
      pickupLocation: pickupLocation.trim(),
      dropLocation: dropLocation.trim(),
      departureDateTime: departure.toISOString(),
      totalSeats: seats,
      ...(cost !== undefined && { estimatedCost: cost }),
      ...(phoneNumber.trim() && { phoneNumber: phoneNumber.trim() }),
      ...(description.trim() && { description: description.trim() }),
    };

    const result = await dispatch(createRide(data));
    if (createRide.fulfilled.match(result)) {
      resetForm();
      onClose();
    } else {
      Alert.alert('Error', (result.payload as string) || 'Failed to create ride.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Offer a Ride</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}
          >
            <Text style={styles.inputLabel}>Pickup Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Campus Main Gate"
              value={pickupLocation}
              onChangeText={setPickupLocation}
              placeholderTextColor={COLORS.textLight}
            />

            <Text style={styles.inputLabel}>Drop Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Railway Station"
              value={dropLocation}
              onChangeText={setDropLocation}
              placeholderTextColor={COLORS.textLight}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.inputLabel}>Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-06-15"
                  value={departureDate}
                  onChangeText={setDepartureDate}
                  keyboardType="numbers-and-punctuation"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.inputLabel}>Time (HH:MM) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="14:30"
                  value={departureTime}
                  onChangeText={setDepartureTime}
                  keyboardType="numbers-and-punctuation"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.inputLabel}>Total Seats *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  value={totalSeats}
                  onChangeText={setTotalSeats}
                  keyboardType="number-pad"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.inputLabel}>Est. Cost (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  value={estimatedCost}
                  onChangeText={setEstimatedCost}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 9876543210"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.textLight}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Any extra details for riders"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textLight}
            />

            <TouchableOpacity
              style={[styles.submitButton, isCreating && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isCreating}
              activeOpacity={0.8}
            >
              {isCreating ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Create Ride</Text>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...SHADOWS.large,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  sheetTitle: {
    fontSize: 18,
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
    padding: SIZES.xl,
    paddingBottom: SIZES.xxxl,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  input: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  rowItem: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SIZES.lg,
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
