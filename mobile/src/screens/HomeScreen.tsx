import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Property } from '../types';
import { mobileApi } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';

interface HomeScreenProps {
  onSelectProperty: (property: Property) => void;
  onNavigateToCatalog: (region?: string) => void;
  onOpenAddProperty?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectProperty,
  onNavigateToCatalog,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRentType, setSelectedRentType] = useState<string>('');

  const fetchProperties = async () => {
    try {
      const params: Record<string, any> = { page_size: 15, sort_by: 'newest' };
      if (selectedRentType) params.rent_type = selectedRentType;
      const res = await mobileApi.getProperties(params);
      setProperties(res.items);
    } catch (err) {
      console.error('Mobile fetch error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedRentType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const regions = [
    'Toshkent shahri',
    'Samarqand viloyati',
    'Buxoro viloyati',
    'Farg\'ona viloyati',
    'Andijon viloyati',
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0F382A']} />}
    >
      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>✨ O'zbekiston №1 Ijara</Text>
        </View>
        <Text style={styles.heroTitle}>Orzuingizdagi uyni toping</Text>
        <Text style={styles.heroSubtitle}>
          Ishonchli xonadonlar, hovlilar va kunlik ijaralar O'zbekiston bo'ylab.
        </Text>

        <TouchableOpacity style={styles.searchBtn} onPress={() => onNavigateToCatalog()}>
          <Text style={styles.searchBtnText}>🔍 Barcha uylarni qidirish</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Regions Scroll */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ommabop hududlar</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll}>
        {regions.map((reg) => (
          <TouchableOpacity
            key={reg}
            style={styles.regionPill}
            onPress={() => onNavigateToCatalog(reg)}
          >
            <Text style={styles.regionText}>📍 {reg}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Rent Type Filter Pills */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, selectedRentType === '' && styles.filterPillActive]}
          onPress={() => setSelectedRentType('')}
        >
          <Text style={[styles.filterText, selectedRentType === '' && styles.filterTextActive]}>
            Barchasi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, selectedRentType === 'monthly' && styles.filterPillActive]}
          onPress={() => setSelectedRentType('monthly')}
        >
          <Text style={[styles.filterText, selectedRentType === 'monthly' && styles.filterTextActive]}>
            Oylik ijara
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, selectedRentType === 'daily' && styles.filterPillActive]}
          onPress={() => setSelectedRentType('daily')}
        >
          <Text style={[styles.filterText, selectedRentType === 'daily' && styles.filterTextActive]}>
            Kunlik ijara
          </Text>
        </TouchableOpacity>
      </View>

      {/* Listings Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>So'nggi qo'shilgan e'lonlar</Text>
        <TouchableOpacity onPress={() => onNavigateToCatalog()}>
          <Text style={styles.seeAllText}>Barchasi →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listWrap}>
        {loading ? (
          <ActivityIndicator size="large" color="#0F382A" style={{ marginVertical: 30 }} />
        ) : properties.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 30, marginBottom: 8 }}>🏠</Text>
            <Text style={styles.emptyTitle}>Hozircha e'lonlar topilmadi</Text>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  heroCard: {
    backgroundColor: '#0F382A',
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  tagBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  tagText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 18,
  },
  searchBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#0F382A',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F382A',
  },
  seeAllText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
  regionScroll: {
    paddingLeft: 16,
    marginBottom: 14,
  },
  regionPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
  },
  regionText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: '#0F382A',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listWrap: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
  },
});
