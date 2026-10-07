export type UserRole = 'admin' | 'makler' | 'mijoz';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string | null;
  created_at: string;
}

export interface PropertyImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  order_index: number;
}

export type AmenityState = 'available' | 'unavailable' | 'unknown';

export interface PropertyAmenities {
  washing_machine: AmenityState;
  wifi: AmenityState;
  air_conditioning: AmenityState;
  refrigerator: AmenityState;
  tv: AmenityState;
  furniture: AmenityState;
  kitchen: AmenityState;
  shower: AmenityState;
  bath: AmenityState;
  hot_water: AmenityState;
  cold_water: AmenityState;
  gas: AmenityState;
  electricity: AmenityState;
  heating: AmenityState;
  ventilation: AmenityState;
  balcony: AmenityState;
  elevator: AmenityState;
  parking: AmenityState;
  security_access: AmenityState;
  cctv: AmenityState;
  cleaning_service: AmenityState;
  linens_towels: AmenityState;
  kitchen_utensils: AmenityState;
  pets_allowed: AmenityState;
  smoking_allowed: AmenityState;
  family_friendly: AmenityState;
  students_allowed: AmenityState;
  women_only: AmenityState;
  men_only: AmenityState;
  accessibility: AmenityState;
  custom_amenities?: string | null;
}

export type PropertyStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'reserved'
  | 'rented'
  | 'hidden'
  | 'rejected'
  | 'archived';

export interface Property {
  id: number;
  owner_id: number;
  owner?: User | null;
  title: string;
  description?: string | null;
  property_type: string;
  rent_type: string;
  price: number;
  currency: string;
  deposit: number;
  utilities_included: boolean;
  utilities_details?: string | null;
  region: string;
  city_district: string;
  mahalla?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  rooms: number;
  area_sqm: number;
  floor?: number | null;
  total_floors?: number | null;
  contact_phone?: string | null;
  show_phone: boolean;
  status: PropertyStatus;
  rejection_reason?: string | null;
  views_count: number;
  images: PropertyImage[];
  amenity?: PropertyAmenities | null;
  is_favorited?: boolean;
  distance_km?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyListResponse {
  items: Property[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  client_id: number;
  broker_id: number;
  property_id?: number | null;
  client?: User | null;
  broker?: User | null;
  property?: Property | null;
  last_message?: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}
