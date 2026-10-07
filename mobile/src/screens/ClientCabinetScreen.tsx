import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Property } from '../types';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';

interface ClientCabinetScreenProps {
  onSelectProperty: (property: Property) => void;
  onLogout: () => void;
}

export const ClientCabinetScreen: React.FC<ClientCabinetScreenProps> = ({
  onSelectProperty,
  onLogout,
}) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await mobileApi.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.first_name ? user.first_name[0] : 'M'}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={styles.phone}>📞 {user?.phone}</Text>
        {user?.email && <Text style={styles.email}>✉️ {user.email}</Text>}

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Tizimdan chiqish</Text>
        </TouchableOpacity>
      </View>

      {/* Saved Properties */}
      <Text style={styles.sectionTitle}>Saqlangan uylar ({favorites.length})</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0F382A" style={{ marginVertical: 30 }} />
      ) : favorites.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>❤️</Text>
          <Text style={styles.emptyTitle}>Sizda hali saqlangan uylar yo'q</Text>
          <Text style={styles.emptyDesc}>Katalogdan uylarni sevimlilarga qo'shishingiz mumkin.</Text>
        </View>
      ) : (
        favorites.map((prop) => (
          <PropertyCard
            key={prop.id}
            property={{ ...prop, is_favorited: true }}
            onPress={() => onSelectProperty(prop)}
          />
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F382A',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  phone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  email: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F382A',
    marginBottom: 12,
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
  },
  emptyDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});
