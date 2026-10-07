import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AmenityState } from '../types';

export const ALL_MOBILE_AMENITIES = [
  { key: 'wifi', name: 'Wi-Fi', icon: '📶' },
  { key: 'washing_machine', name: 'Kir yuvish', icon: '🧺' },
  { key: 'air_conditioning', name: 'Konditsioner', icon: '❄️' },
  { key: 'refrigerator', name: 'Muzlatgich', icon: '🧊' },
  { key: 'tv', name: 'Televizor', icon: '📺' },
  { key: 'furniture', name: 'Mebel', icon: '🛏' },
  { key: 'kitchen', name: 'Oshxona', icon: '🍳' },
  { key: 'shower', name: 'Dush', icon: '🚿' },
  { key: 'bath', name: 'Vanna', icon: '🛁' },
  { key: 'hot_water', name: 'Issiq suv', icon: '♨️' },
  { key: 'cold_water', name: 'Sovuq suv', icon: '💧' },
  { key: 'gas', name: 'Gaz', icon: '🔥' },
  { key: 'electricity', name: 'Elektr', icon: '⚡' },
  { key: 'heating', name: 'Isitish', icon: '🌡' },
  { key: 'ventilation', name: 'Shamollatish', icon: '🌬' },
  { key: 'balcony', name: 'Balkon', icon: '🪟' },
  { key: 'elevator', name: 'Lift', icon: '🛗' },
  { key: 'parking', name: 'Avtoturargoh', icon: '🚗' },
  { key: 'security_access', name: 'Xavfsiz kirish', icon: '🔐' },
  { key: 'cctv', name: 'Videokuzatuv', icon: '🎥' },
  { key: 'cleaning_service', name: 'Tozalash', icon: '🧹' },
  { key: 'linens_towels', name: 'Choyshablar', icon: '🧺' },
  { key: 'kitchen_utensils', name: 'Oshxona anjomlari', icon: '🍽' },
  { key: 'pets_allowed', name: 'Uy hayvoni', icon: '🐈' },
  { key: 'smoking_allowed', name: 'Chekish mumkin', icon: '🚭' },
  { key: 'family_friendly', name: 'Oilalar uchun', icon: '👨‍👩‍👧' },
  { key: 'students_allowed', name: 'Talabalar uchun', icon: '🎓' },
  { key: 'women_only', name: 'Ayollar uchun', icon: '👩' },
  { key: 'men_only', name: 'Erkaklar uchun', icon: '👨' },
  { key: 'accessibility', name: 'Nogironlar uchun', icon: '♿' },
];

interface AmenityRowProps {
  amenityKey: string;
  status: AmenityState;
}

export const AmenityRow: React.FC<AmenityRowProps> = ({ amenityKey, status }) => {
  const meta = ALL_MOBILE_AMENITIES.find((a) => a.key === amenityKey) || {
    key: amenityKey,
    name: amenityKey,
    icon: '✨',
  };

  const isAvailable = status === 'available';
  const isUnavailable = status === 'unavailable';

  return (
    <View
      style={[
        styles.chip,
        isAvailable ? styles.chipAvailable : isUnavailable ? styles.chipUnavailable : styles.chipUnknown,
      ]}
    >
      <Text style={styles.icon}>{meta.icon}</Text>
      <Text
        style={[
          styles.name,
          isAvailable ? styles.textAvailable : isUnavailable ? styles.textUnavailable : styles.textUnknown,
        ]}
      >
        {meta.name}
      </Text>
      <Text style={styles.statusLabel}>
        {isAvailable ? '(Bor)' : isUnavailable ? "(Yo'q)" : '(?)'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  chipAvailable: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  chipUnavailable: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    opacity: 0.7,
  },
  chipUnknown: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  icon: {
    fontSize: 14,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
  },
  textAvailable: {
    color: '#065F46',
  },
  textUnavailable: {
    color: '#991B1B',
  },
  textUnknown: {
    color: '#6B7280',
  },
  statusLabel: {
    fontSize: 9,
    color: '#6B7280',
  },
});
