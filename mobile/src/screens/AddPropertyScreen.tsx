import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { mobileApi } from '../services/api';
import { ALL_MOBILE_AMENITIES } from '../components/AmenityRow';
import { AmenityState } from '../types';

interface AddPropertyScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AddPropertyScreen: React.FC<AddPropertyScreenProps> = ({ onBack, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [rentType, setRentType] = useState('monthly');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('0');
  const [region, setRegion] = useState('Toshkent shahri');
  const [cityDistrict, setCityDistrict] = useState('Chilonzor tumani');
  const [address, setAddress] = useState('');
  const [rooms, setRooms] = useState('2');
  const [areaSqm, setAreaSqm] = useState('60');
  const [description, setDescription] = useState('');

  // 30 Amenities state
  const [amenities, setAmenities] = useState<Record<string, AmenityState>>(() => {
    const init: Record<string, AmenityState> = {};
    ALL_MOBILE_AMENITIES.forEach((a) => {
      init[a.key] = 'unknown';
    });
    return init;
  });

  // Selected Images
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((a) => a.uri);
        setImages((prev) => [...prev, ...uris]);
      }
    } catch (err: any) {
      Alert.alert('Xatolik', 'Galereyani ochib bo\'lmadi: ' + err.message);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAmenityToggle = (key: string, state: AmenityState) => {
    setAmenities((prev) => ({ ...prev, [key]: state }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Xatolik', 'E\'lon sarlavhasini kiriting');
      return;
    }
    if (!price || Number(price) <= 0) {
      Alert.alert('Xatolik', 'Ijara narxini to\'g\'ri kiriting');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Xatolik', 'Manzilni kiriting');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        property_type: propertyType,
        rent_type: rentType,
        price: Number(price),
        currency: 'UZS',
        deposit: Number(deposit) || 0,
        utilities_included: false,
        region,
        city_district: cityDistrict,
        address: address.trim(),
        latitude: 41.2995,
        longitude: 69.2401,
        rooms: Number(rooms) || 1,
        area_sqm: Number(areaSqm) || 50,
        show_phone: true,
        amenities,
      };

      const created = await mobileApi.createProperty(payload);

      // Upload selected images
      for (const uri of images) {
        try {
          await mobileApi.uploadPropertyImage(created.id, uri);
        } catch (uploadErr) {
          console.error('Image upload failed', uploadErr);
        }
      }

      Alert.alert('Muvaffaqiyatli', 'E\'lon yaratildi!');
      onSuccess();
    } catch (err: any) {
      Alert.alert('Xatolik', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Orqaga</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yangi uy qo'shish</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Asosiy ma'lumotlar</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E'lon sarlavhasi:</Text>
            <TextInput
              style={styles.input}
              placeholder="Masalan: Chilonzor 2 xonali shinam kvartira"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Narx (UZS):</Text>
              <TextInput
                style={styles.input}
                placeholder="5000000"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Depozit (UZS):</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={deposit}
                onChangeText={setDeposit}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Xonalar soni:</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                keyboardType="numeric"
                value={rooms}
                onChangeText={setRooms}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Maydon (m²):</Text>
              <TextInput
                style={styles.input}
                placeholder="60"
                keyboardType="numeric"
                value={areaSqm}
                onChangeText={setAreaSqm}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Aniq manzil (ko'cha, uy):</Text>
            <TextInput
              style={styles.input}
              placeholder="Muqimiy ko'chasi 45"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tavsif (izoh):</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Uy haqida qo'shimcha ma'lumotlar..."
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* 30 Amenities Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Qulayliklar (30 ta sharoit)</Text>
          <Text style={styles.subLabel}>Bor / Yo'q / ? (ma'lumot yo'q)</Text>

          <View style={styles.amenityList}>
            {ALL_MOBILE_AMENITIES.map((meta) => {
              const current = amenities[meta.key] || 'unknown';
              return (
                <View key={meta.key} style={styles.amenityRow}>
                  <Text style={styles.amenityName}>
                    {meta.icon} {meta.name}
                  </Text>

                  <View style={styles.stateBtnRow}>
                    <TouchableOpacity
                      style={[styles.stateBtn, current === 'available' && styles.stateBtnAvailable]}
                      onPress={() => handleAmenityToggle(meta.key, 'available')}
                    >
                      <Text style={[styles.stateBtnText, current === 'available' && styles.textWhite]}>Bor</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.stateBtn, current === 'unavailable' && styles.stateBtnUnavailable]}
                      onPress={() => handleAmenityToggle(meta.key, 'unavailable')}
                    >
                      <Text style={[styles.stateBtnText, current === 'unavailable' && styles.textWhite]}>Yo'q</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.stateBtn, current === 'unknown' && styles.stateBtnUnknown]}
                      onPress={() => handleAmenityToggle(meta.key, 'unknown')}
                    >
                      <Text style={[styles.stateBtnText, current === 'unknown' && styles.textWhite]}>?</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Photos Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Rasmlar yuklash</Text>

          <TouchableOpacity style={styles.pickImageBtn} onPress={handlePickImage}>
            <Text style={styles.pickImageText}>📸 Galereyadan rasm tanlash</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <ScrollView horizontal style={styles.previewScroll}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.thumbWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <TouchableOpacity style={styles.deleteThumb} onPress={() => handleRemoveImage(idx)}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>E'lonni chop etish</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBar: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    paddingVertical: 6,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F382A',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F382A',
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    backgroundColor: '#F9FAFB',
  },
  amenityList: {
    gap: 8,
  },
  amenityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  amenityName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  stateBtnRow: {
    flexDirection: 'row',
    gap: 4,
  },
  stateBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  stateBtnAvailable: {
    backgroundColor: '#10B981',
  },
  stateBtnUnavailable: {
    backgroundColor: '#DC2626',
  },
  stateBtnUnknown: {
    backgroundColor: '#9CA3AF',
  },
  stateBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  pickImageBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  pickImageText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 13,
  },
  previewScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  thumbWrap: {
    position: 'relative',
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  deleteThumb: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: '#0F382A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
