import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Property } from '../types';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';

interface BrokerCabinetScreenProps {
  onOpenAddProperty: () => void;
  onSelectProperty: (property: Property) => void;
}

export const BrokerCabinetScreen: React.FC<BrokerCabinetScreenProps> = ({
  onOpenAddProperty,
  onSelectProperty,
}) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProperties = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await mobileApi.getProperties({ owner_id: user.id, page_size: 50 });
      setProperties(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, [user]);

  const handleMarkRented = async (id: number) => {
    try {
      await mobileApi.markRented(id);
      fetchMyProperties();
    } catch (err: any) {
      Alert.alert('Xatolik', err.message);
    }
  };

  const handleReopen = async (id: number) => {
    try {
      await mobileApi.reopenProperty(id);
      fetchMyProperties();
    } catch (err: any) {
      Alert.alert('Xatolik', err.message);
    }
  };

  const handleClose = async (id: number) => {
    try {
      await mobileApi.closeProperty(id);
      fetchMyProperties();
    } catch (err: any) {
      Alert.alert('Xatolik', err.message);
    }
  };

  const total = properties.length;
  const active = properties.filter((p) => p.status === 'active').length;
  const rented = properties.filter((p) => p.status === 'rented').length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Banner */}
      <View style={styles.topCard}>
        <Text style={styles.name}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={styles.roleTag}>Makler Kabineti</Text>

        <TouchableOpacity style={styles.addBtn} onPress={onOpenAddProperty}>
          <Text style={styles.addBtnText}>+ Yangi uy qo'shish</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{total}</Text>
          <Text style={styles.statLabel}>Jami e'lonlar</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: '#059669' }]}>{active}</Text>
          <Text style={styles.statLabel}>Faol</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: '#DC2626' }]}>{rented}</Text>
          <Text style={styles.statLabel}>Ijarada</Text>
        </View>
      </View>

      {/* Listings List */}
      <Text style={styles.sectionTitle}>Mening e'lonlarim ({total})</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0F382A" style={{ marginVertical: 30 }} />
      ) : properties.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
          <Text style={styles.emptyTitle}>Sizda hali e'lonlar mavjud emas</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={onOpenAddProperty}>
            <Text style={styles.emptyAddBtnText}>+ E'lon qo'shish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        properties.map((prop) => (
          <View key={prop.id} style={styles.listingItem}>
            <PropertyCard property={prop} onPress={() => onSelectProperty(prop)} />

            {/* Action buttons under card */}
            <View style={styles.actionRow}>
              {prop.status !== 'rented' ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rentedBtn]}
                  onPress={() => handleMarkRented(prop.id)}
                >
                  <Text style={styles.rentedBtnText}>Ijaraga berildi</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.reopenBtn]}
                  onPress={() => handleReopen(prop.id)}
                >
                  <Text style={styles.reopenBtnText}>Qayta faollashtirish</Text>
                </TouchableOpacity>
              )}

              {prop.status === 'active' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.hideBtn]}
                  onPress={() => handleClose(prop.id)}
                >
                  <Text style={styles.hideBtnText}>Yashirish</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 50,
    backgroundColor: '#F9FAFB',
  },
  topCard: {
    backgroundColor: '#0F382A',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  roleTag: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F382A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F382A',
    marginBottom: 12,
  },
  listingItem: {
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  rentedBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  rentedBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 11,
  },
  reopenBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  reopenBtnText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 11,
  },
  hideBtn: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  hideBtnText: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 11,
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
    color: '#374151',
    marginBottom: 12,
  },
  emptyAddBtn: {
    backgroundColor: '#0F382A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
