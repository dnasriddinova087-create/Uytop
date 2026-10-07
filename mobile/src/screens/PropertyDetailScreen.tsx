import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Property } from '../types';
import { getFullImageUrl, mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AmenityRow, ALL_MOBILE_AMENITIES } from '../components/AmenityRow';

interface PropertyDetailScreenProps {
  property: Property;
  onBack: () => void;
  onOpenChat: (brokerId: number, propertyId: number) => void;
}

export const PropertyDetailScreen: React.FC<PropertyDetailScreenProps> = ({
  property,
  onBack,
  onOpenChat,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(property.is_favorited || false);
  const [showPhone, setShowPhone] = useState(false);

  const images =
    property.images && property.images.length > 0
      ? property.images.map((i) => getFullImageUrl(i.image_url))
      : [getFullImageUrl(null)];

  const formatPrice = (val: number) => new Intl.NumberFormat('uz-UZ').format(val);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      Alert.alert('Eslatma', 'Sevimlilarga saqlash uchun avval hisobingizga kiring.');
      return;
    }
    try {
      if (isFav) {
        await mobileApi.removeFavorite(property.id);
        setIsFav(false);
      } else {
        await mobileApi.addFavorite(property.id);
        setIsFav(true);
      }
    } catch (err: any) {
      Alert.alert('Xatolik', err.message);
    }
  };

  const handleCallBroker = () => {
    const phone = property.contact_phone || property.owner?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Xatolik', 'Telefon raqam mavjud emas');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Orqaga</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topFavBtn} onPress={handleToggleFavorite}>
          <Text style={{ fontSize: 18 }}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {/* Main Photo Banner */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: images[0] }} style={styles.mainImage} resizeMode="cover" />
          <View style={styles.badgeRow}>
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
                {property.rent_type === 'monthly' ? 'Oylik ijara' : 'Kunlik ijara'}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentWrap}>
          {/* Price */}
          <Text style={styles.price}>
            {formatPrice(property.price)} <Text style={styles.currency}>{property.currency}</Text>
            <Text style={styles.period}>
              {property.rent_type === 'monthly' ? ' / oy' : ' / kun'}
            </Text>
          </Text>

          <Text style={styles.title}>{property.title}</Text>

          <Text style={styles.location}>
            📍 {property.region}, {property.city_district}, {property.address}
          </Text>

          {/* Key Specs */}
          <View style={styles.specsCard}>
            <View style={styles.specBox}>
              <Text style={styles.specValue}>{property.rooms} xona</Text>
              <Text style={styles.specLabel}>Xonalar soni</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specValue}>{property.area_sqm} m²</Text>
              <Text style={styles.specLabel}>Umumiy maydoni</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specValue}>
                {property.floor || 1}{property.total_floors ? `/${property.total_floors}` : ''}
              </Text>
              <Text style={styles.specLabel}>Qavat</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tavsif</Text>
            <Text style={styles.descText}>
              {property.description || "Ushbu uy haqida qo'shimcha tavsif kiritilmagan."}
            </Text>
          </View>

          {/* 30 Amenities Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sharoitlar va qulayliklar</Text>
            <Text style={styles.subLabel}>
              Yashil: Mavjud | Qizil: Mavjud emas | Kulrang: Ma'lumot yo'q
            </Text>

            <View style={styles.amenityWrap}>
              {ALL_MOBILE_AMENITIES.map((meta) => {
                const status = property.amenity
                  ? (property.amenity as any)[meta.key] || 'unknown'
                  : 'unknown';
                return (
                  <AmenityRow key={meta.key} amenityKey={meta.key} status={status} />
                );
              })}
            </View>

            {property.amenity?.custom_amenities && (
              <View style={styles.customAmenityBox}>
                <Text style={styles.customAmenityTitle}>Boshqa qulayliklar:</Text>
                <Text style={styles.customAmenityText}>{property.amenity.custom_amenities}</Text>
              </View>
            )}
          </View>

          {/* Landlord / Broker Card */}
          <View style={styles.ownerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {property.owner?.first_name ? property.owner.first_name[0] : 'U'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>
                {property.owner?.first_name} {property.owner?.last_name}
              </Text>
              <Text style={styles.ownerRole}>
                {property.owner?.role === 'makler' ? '✓ Tasdiqlangan makler' : 'Uy egasi'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomBar}>
        {showPhone ? (
          <TouchableOpacity style={styles.callBtn} onPress={handleCallBroker}>
            <Text style={styles.callBtnText}>
              📞 {property.contact_phone || property.owner?.phone}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.callBtn} onPress={() => setShowPhone(true)}>
            <Text style={styles.callBtnText}>📞 Telefon qilish</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => onOpenChat(property.owner_id, property.id)}
        >
          <Text style={styles.chatBtnText}>💬 Xabar yozish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F382A',
  },
  topFavBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingBottom: 100,
  },
  imageWrap: {
    height: 250,
    backgroundColor: '#111827',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeActive: {
    backgroundColor: '#10B981',
  },
  badgeRented: {
    backgroundColor: '#DC2626',
  },
  badgeType: {
    backgroundColor: 'rgba(15, 56, 42, 0.9)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  contentWrap: {
    padding: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F382A',
    marginBottom: 4,
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
  },
  period: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 24,
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  specsCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 20,
  },
  specBox: {
    flex: 1,
    alignItems: 'center',
  },
  specValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F382A',
  },
  specLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F382A',
    marginBottom: 6,
  },
  descText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  subLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 10,
  },
  amenityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  customAmenityBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  customAmenityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F382A',
    marginBottom: 2,
  },
  customAmenityText: {
    fontSize: 12,
    color: '#4B5563',
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#0F382A',
    fontSize: 18,
    fontWeight: '800',
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  ownerRole: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#0F382A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
