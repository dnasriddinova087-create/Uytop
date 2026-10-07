import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Property } from '../types';
import { getFullImageUrl } from '../services/api';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  onFavoritePress?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onFavoritePress,
}) => {
  const primary = property.images && property.images.length > 0 ? property.images[0].image_url : null;
  const imageUrl = getFullImageUrl(primary);

  const formatPrice = (val: number) => new Intl.NumberFormat('uz-UZ').format(val);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        <View style={styles.statusBadgeWrap}>
          {property.status === 'rented' ? (
            <View style={[styles.badge, styles.badgeRented]}>
              <Text style={styles.badgeText}>Ijaraga berildi</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgeActive]}>
              <Text style={styles.badgeText}>Faol</Text>
            </View>
          )}

          <View style={[styles.badge, styles.badgeType]}>
            <Text style={styles.badgeText}>
              {property.property_type === 'apartment' ? 'Kvartira' : property.property_type === 'house' ? 'Hovli' : 'Uy'}
            </Text>
          </View>
        </View>

        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favBtn}
            onPress={onFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 16 }}>{property.is_favorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.price}>
          {formatPrice(property.price)} <Text style={styles.currency}>{property.currency}</Text>
          <Text style={styles.period}>
            {' '}
            {property.rent_type === 'monthly' ? '/ oy' : property.rent_type === 'daily' ? '/ kun' : '/ hafta'}
          </Text>
        </Text>

        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>

        <Text style={styles.location} numberOfLines={1}>
          📍 {property.region}, {property.city_district}
        </Text>

        <View style={styles.specsRow}>
          <Text style={styles.specItem}>🛏 {property.rooms} xona</Text>
          <Text style={styles.specItem}>📐 {property.area_sqm} m²</Text>
          {property.floor && <Text style={styles.specItem}>🏢 {property.floor}-qavat</Text>}
          {property.distance_km !== undefined && property.distance_km !== null && (
            <Text style={[styles.specItem, { color: '#10B981', fontWeight: '700' }]}>
              {property.distance_km} km
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrap: {
    height: 190,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadgeWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#10B981',
  },
  badgeRented: {
    backgroundColor: '#DC2626',
  },
  badgeType: {
    backgroundColor: 'rgba(15, 56, 42, 0.85)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 14,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F382A',
    marginBottom: 4,
  },
  currency: {
    fontSize: 13,
    fontWeight: '600',
  },
  period: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 18,
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  specItem: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
});
