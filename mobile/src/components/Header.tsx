import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  onOpenNetworkConfig?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenNetworkConfig,
  onLogout,
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Text style={styles.brandText}>
          Uy<Text style={styles.brandHighlight}>Top</Text>
        </Text>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>Mobil</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        {onOpenNetworkConfig && (
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenNetworkConfig}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        )}

        {isAuthenticated && user && (
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>
              {user.role === 'makler' ? 'Makler' : user.role === 'admin' ? 'Admin' : 'Mijoz'}
            </Text>
          </View>
        )}

        {isAuthenticated && onLogout && (
          <TouchableOpacity style={styles.iconBtn} onPress={onLogout}>
            <Text style={{ fontSize: 14 }}>🚪</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F382A',
  },
  brandHighlight: {
    color: '#10B981',
  },
  tagBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  userBadge: {
    backgroundColor: '#0F382A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  userBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
