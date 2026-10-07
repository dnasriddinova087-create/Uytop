import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Property } from '../types';
import { mobileApi } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';

interface CatalogScreenProps {
  initialRegion?: string;
  onSelectProperty: (property: Property) => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  initialRegion = '',
  onSelectProperty,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState(initialRegion);
  const [rentType, setRentType] = useState('');
  const [rooms, setRooms] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page_size: 30, sort_by: sortBy };
      if (region) params.region = region;
      if (rentType) params.rent_type = rentType;
      if (rooms) params.rooms = rooms;

      const res = await mobileApi.getProperties(params);
      let items = res.items;

      if (search.trim()) {
        const q = search.toLowerCase();
        items = items.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.address.toLowerCase().includes(q) ||
            p.city_district.toLowerCase().includes(q)
        );
      }

      setProperties(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [region, rentType, rooms, sortBy]);

  const handleSearchSubmit = () => {
    fetchProperties();
  };

  const regions = [
    'Barchasi',
    'Toshkent shahri',
    'Samarqand viloyati',
    'Buxoro viloyati',
    'Farg\'ona viloyati',
    'Andijon viloyati',
  ];

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Qidirish (Chilonzor, Registon, 3 xona)..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchIconBtn} onPress={handleSearchSubmit}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Region Bar */}
      <View style={{ height: 42, marginBottom: 6 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
          {regions.map((reg) => {
            const isAll = reg === 'Barchasi';
            const isActive = isAll ? region === '' : region === reg;
            return (
              <TouchableOpacity
                key={reg}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setRegion(isAll ? '' : reg)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{reg}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sort & Room Quick Filters */}
      <View style={styles.quickFilterRow}>
        <TouchableOpacity
          style={[styles.smallChip, sortBy === 'newest' && styles.smallChipActive]}
          onPress={() => setSortBy('newest')}
        >
          <Text style={[styles.smallChipText, sortBy === 'newest' && styles.smallChipTextActive]}>
            Eng yangi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallChip, sortBy === 'cheapest' && styles.smallChipActive]}
          onPress={() => setSortBy('cheapest')}
        >
          <Text style={[styles.smallChipText, sortBy === 'cheapest' && styles.smallChipTextActive]}>
            Eng arzon
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallChip, rentType === 'monthly' && styles.smallChipActive]}
          onPress={() => setRentType(rentType === 'monthly' ? '' : 'monthly')}
        >
          <Text style={[styles.smallChipText, rentType === 'monthly' && styles.smallChipTextActive]}>
            Oylik
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallChip, rentType === 'daily' && styles.smallChipActive]}
          onPress={() => setRentType(rentType === 'daily' ? '' : 'daily')}
        >
          <Text style={[styles.smallChipText, rentType === 'daily' && styles.smallChipTextActive]}>
            Kunlik
          </Text>
        </TouchableOpacity>
      </View>

      {/* Property List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.resultsCount}>Topilgan e'lonlar: {properties.length} ta</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0F382A" style={{ marginVertical: 30 }} />
        ) : properties.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
            <Text style={styles.emptyTitle}>Hech qanday e'lon topilmadi</Text>
            <Text style={styles.emptyDesc}>Filtr parametrlarini o'zgartirib ko'ring.</Text>
          </View>
        ) : (
          properties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onPress={() => onSelectProperty(prop)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: '#111827',
  },
  searchIconBtn: {
    padding: 6,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    height: 34,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#0F382A',
    borderColor: '#0F382A',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  quickFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 12,
  },
  smallChip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  smallChipActive: {
    backgroundColor: '#10B981',
  },
  smallChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  smallChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  resultsCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});
