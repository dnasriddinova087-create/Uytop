import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Header } from './src/components/Header';
import { NetworkConfigModal } from './src/components/NetworkConfigModal';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { CatalogScreen } from './src/screens/CatalogScreen';
import { PropertyDetailScreen } from './src/screens/PropertyDetailScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { BrokerCabinetScreen } from './src/screens/BrokerCabinetScreen';
import { ClientCabinetScreen } from './src/screens/ClientCabinetScreen';
import { AddPropertyScreen } from './src/screens/AddPropertyScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { Property } from './src/types';

type TabType = 'home' | 'catalog' | 'chat' | 'profile';

const MainNavigator: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [chatParams, setChatParams] = useState<{ brokerId?: number; propertyId?: number } | null>(null);

  // Network Settings Modal
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  // Initial catalog region filter
  const [catalogRegion, setCatalogRegion] = useState('');

  const handleOpenProperty = (prop: Property) => {
    setSelectedProperty(prop);
  };

  const handleNavigateToCatalog = (region?: string) => {
    setCatalogRegion(region || '');
    setActiveTab('catalog');
    setSelectedProperty(null);
  };

  const handleOpenChat = (brokerId: number, propertyId: number) => {
    if (!isAuthenticated) {
      setAuthMode('login');
      return;
    }
    setChatParams({ brokerId, propertyId });
    setActiveTab('chat');
    setSelectedProperty(null);
  };

  const renderScreen = () => {
    // If viewing property detail
    if (selectedProperty) {
      return (
        <PropertyDetailScreen
          property={selectedProperty}
          onBack={() => setSelectedProperty(null)}
          onOpenChat={handleOpenChat}
        />
      );
    }

    // If adding a property
    if (showAddProperty) {
      return (
        <AddPropertyScreen
          onBack={() => setShowAddProperty(false)}
          onSuccess={() => {
            setShowAddProperty(false);
            setActiveTab('profile');
          }}
        />
      );
    }

    // If login / register required
    if (authMode === 'login') {
      return (
        <LoginScreen
          onNavigateToRegister={() => setAuthMode('register')}
          onLoginSuccess={() => setAuthMode(null)}
        />
      );
    }
    if (authMode === 'register') {
      return (
        <RegisterScreen
          onNavigateToLogin={() => setAuthMode('login')}
          onRegisterSuccess={() => setAuthMode(null)}
        />
      );
    }

    // Tabs
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onSelectProperty={handleOpenProperty}
            onNavigateToCatalog={handleNavigateToCatalog}
          />
        );
      case 'catalog':
        return (
          <CatalogScreen
            initialRegion={catalogRegion}
            onSelectProperty={handleOpenProperty}
          />
        );
      case 'chat':
        if (!isAuthenticated) {
          return (
            <LoginScreen
              onNavigateToRegister={() => setAuthMode('register')}
              onLoginSuccess={() => setAuthMode(null)}
            />
          );
        }
        return (
          <ChatScreen
            initialBrokerId={chatParams?.brokerId}
            initialPropertyId={chatParams?.propertyId}
            onBack={() => setActiveTab('home')}
          />
        );
      case 'profile':
        if (!isAuthenticated) {
          return (
            <LoginScreen
              onNavigateToRegister={() => setAuthMode('register')}
              onLoginSuccess={() => setAuthMode(null)}
            />
          );
        }
        if (user?.role === 'makler' || user?.role === 'admin') {
          return (
            <BrokerCabinetScreen
              onOpenAddProperty={() => setShowAddProperty(true)}
              onSelectProperty={handleOpenProperty}
            />
          );
        }
        return (
          <ClientCabinetScreen
            onSelectProperty={handleOpenProperty}
            onLogout={logout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      {!selectedProperty && !showAddProperty && !authMode && (
        <Header
          onOpenNetworkConfig={() => setShowNetworkModal(true)}
          onLogout={isAuthenticated ? logout : undefined}
        />
      )}

      {/* Main Screen Body */}
      <View style={styles.screenBody}>{renderScreen()}</View>

      {/* Bottom Tab Bar */}
      {!selectedProperty && !showAddProperty && !authMode && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setSelectedProperty(null);
              setActiveTab('home');
            }}
          >
            <Text style={[styles.navIcon, activeTab === 'home' && styles.navIconActive]}>🏠</Text>
            <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>
              Asosiy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setSelectedProperty(null);
              setCatalogRegion('');
              setActiveTab('catalog');
            }}
          >
            <Text style={[styles.navIcon, activeTab === 'catalog' && styles.navIconActive]}>🔍</Text>
            <Text style={[styles.navLabel, activeTab === 'catalog' && styles.navLabelActive]}>
              Qidiruv
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setSelectedProperty(null);
              setActiveTab('chat');
            }}
          >
            <Text style={[styles.navIcon, activeTab === 'chat' && styles.navIconActive]}>💬</Text>
            <Text style={[styles.navLabel, activeTab === 'chat' && styles.navLabelActive]}>
              Xabarlar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setSelectedProperty(null);
              setActiveTab('profile');
            }}
          >
            <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>👤</Text>
            <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>
              Kabinet
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Network Configuration Modal */}
      <NetworkConfigModal
        visible={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
      />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenBody: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  bottomNav: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#0F382A',
    fontWeight: '800',
  },
});
