import React from 'react';
import {
  Wifi,
  Shirt,
  Wind,
  Refrigerator,
  Tv,
  Bed,
  Utensils,
  ShowerHead,
  Bath,
  Flame,
  Droplet,
  Zap,
  Thermometer,
  Fan,
  DoorOpen,
  Building2,
  Car,
  KeyRound,
  Camera,
  Sparkles,
  Layers,
  UtensilsCrossed,
  Dog,
  Cigarette,
  Users,
  GraduationCap,
  UserCheck,
  Accessibility,
} from 'lucide-react';
import { AmenityState } from '../types';

export interface AmenityMeta {
  key: string;
  name: string;
  icon: React.ReactNode;
}

export const ALL_AMENITIES: AmenityMeta[] = [
  { key: 'wifi', name: 'Wi-Fi', icon: <Wifi size={17} /> },
  { key: 'washing_machine', name: 'Kir yuvish mashinasi', icon: <Shirt size={17} /> },
  { key: 'air_conditioning', name: 'Konditsioner', icon: <Wind size={17} /> },
  { key: 'refrigerator', name: 'Muzlatgich', icon: <Refrigerator size={17} /> },
  { key: 'tv', name: 'Televizor', icon: <Tv size={17} /> },
  { key: 'furniture', name: 'Mebel', icon: <Bed size={17} /> },
  { key: 'kitchen', name: 'Oshxona', icon: <Utensils size={17} /> },
  { key: 'shower', name: 'Dush', icon: <ShowerHead size={17} /> },
  { key: 'bath', name: 'Vanna', icon: <Bath size={17} /> },
  { key: 'hot_water', name: 'Issiq suv', icon: <Flame size={17} /> },
  { key: 'cold_water', name: 'Sovuq suv', icon: <Droplet size={17} /> },
  { key: 'gas', name: 'Gaz', icon: <Flame size={17} /> },
  { key: 'electricity', name: 'Elektr', icon: <Zap size={17} /> },
  { key: 'heating', name: 'Isitish tizimi', icon: <Thermometer size={17} /> },
  { key: 'ventilation', name: 'Shamollatish', icon: <Fan size={17} /> },
  { key: 'balcony', name: 'Balkon', icon: <DoorOpen size={17} /> },
  { key: 'elevator', name: 'Lift', icon: <Building2 size={17} /> },
  { key: 'parking', name: 'Avtoturargoh', icon: <Car size={17} /> },
  { key: 'security_access', name: 'Xavfsiz kirish', icon: <KeyRound size={17} /> },
  { key: 'cctv', name: 'Videokuzatuv', icon: <Camera size={17} /> },
  { key: 'cleaning_service', name: 'Tozalash xizmati', icon: <Sparkles size={17} /> },
  { key: 'linens_towels', name: 'Choyshab va sochiqlar', icon: <Layers size={17} /> },
  { key: 'kitchen_utensils', name: 'Oshxona jihozlari', icon: <UtensilsCrossed size={17} /> },
  { key: 'pets_allowed', name: 'Uy hayvoni ruxsat etilgan', icon: <Dog size={17} /> },
  { key: 'smoking_allowed', name: 'Chekish mumkin', icon: <Cigarette size={17} /> },
  { key: 'family_friendly', name: 'Oilalar uchun qulay', icon: <Users size={17} /> },
  { key: 'students_allowed', name: 'Talabalar uchun qulay', icon: <GraduationCap size={17} /> },
  { key: 'women_only', name: 'Faqat ayollar uchun', icon: <UserCheck size={17} /> },
  { key: 'men_only', name: 'Faqat erkaklar uchun', icon: <UserCheck size={17} /> },
  { key: 'accessibility', name: "Nogironligi bo'lganlar uchun", icon: <Accessibility size={17} /> },
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
    icon: <Sparkles size={17} />,
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
    <div className={className} title={`${meta.name}: ${statusText}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{meta.icon}</span>
      <span>{meta.name}</span>
      <span style={{ fontSize: '0.75rem', opacity: 0.85, marginLeft: '2px' }}>
        ({statusText})
      </span>
    </div>
  );
};
