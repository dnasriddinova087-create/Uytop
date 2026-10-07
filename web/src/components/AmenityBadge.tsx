import React from 'react';
import { AmenityState } from '../types';

export interface AmenityMeta {
  key: string;
  name: string;
  icon: string;
}

export const ALL_AMENITIES: AmenityMeta[] = [
  { key: 'wifi', name: 'Wi-Fi', icon: '📶' },
  { key: 'washing_machine', name: 'Kir yuvish mashinasi', icon: '🧺' },
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
  { key: 'heating', name: 'Isitish tizimi', icon: '🌡' },
  { key: 'ventilation', name: 'Shamollatish', icon: '🌬' },
  { key: 'balcony', name: 'Balkon', icon: '🪟' },
  { key: 'elevator', name: 'Lift', icon: '🛗' },
  { key: 'parking', name: 'Avtoturargoh', icon: '🚗' },
  { key: 'security_access', name: 'Xavfsiz kirish', icon: '🔐' },
  { key: 'cctv', name: 'Videokuzatuv', icon: '🎥' },
  { key: 'cleaning_service', name: 'Tozalash xizmati', icon: '🧹' },
  { key: 'linens_towels', name: 'Choyshab va sochiqlar', icon: '🧺' },
  { key: 'kitchen_utensils', name: 'Oshxona jihozlari', icon: '🍽' },
  { key: 'pets_allowed', name: 'Uy hayvoni ruxsat etilgan', icon: '🐈' },
  { key: 'smoking_allowed', name: 'Chekish mumkin', icon: '🚭' },
  { key: 'family_friendly', name: 'Oilalar uchun qulay', icon: '👨‍👩‍👧' },
  { key: 'students_allowed', name: 'Talabalar uchun qulay', icon: '🎓' },
  { key: 'women_only', name: 'Faqat ayollar uchun', icon: '👩' },
  { key: 'men_only', name: 'Faqat erkaklar uchun', icon: '👨' },
  { key: 'accessibility', name: 'Nogironligi bo\'lganlar uchun', icon: '♿' },
];

interface AmenityBadgeProps {
  amenityKey: string;
  status: AmenityState;
  showUnknown?: boolean;
}

export const AmenityBadge: React.FC<AmenityBadgeProps> = ({
  amenityKey,
  status,
  showUnknown = true,
}) => {
  const meta = ALL_AMENITIES.find((a) => a.key === amenityKey) || {
    key: amenityKey,
    name: amenityKey,
    icon: '✨',
  };

  if (status === 'unknown' && !showUnknown) {
    return null;
  }

  let statusText = 'Mavjud';
  let className = 'amenity-chip amenity-available';

  if (status === 'unavailable') {
    statusText = 'Mavjud emas';
    className = 'amenity-chip amenity-unavailable';
  } else if (status === 'unknown') {
    statusText = "Ma'lumot yo'q";
    className = 'amenity-chip amenity-unknown';
  }

  return (
    <div className={className} title={`${meta.name}: ${statusText}`}>
      <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
      <span>{meta.name}</span>
      <span style={{ fontSize: '0.75rem', opacity: 0.85, marginLeft: '4px' }}>
        ({statusText})
      </span>
    </div>
  );
};
