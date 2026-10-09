import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, PlusCircle, MessageSquare, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UyTopHouseIcon } from './UyTopHouseIcon';

export const MobileBottomNav: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const getProfileLink = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'makler') return '/broker';
    return '/client';
  };

  const getAddLink = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'makler' || user?.role === 'admin') return '/broker/add-property';
    return '/client';
  };

  const isHomeActive = location.pathname === '/';
  const isCatalogActive = location.pathname === '/catalog';
  const isChatActive = location.pathname === '/chat';
  const isProfileActive =
    location.pathname === '/client' ||
    location.pathname === '/broker' ||
    location.pathname === '/admin' ||
    location.pathname === '/login' ||
    location.pathname === '/register';
  const isAddActive = location.pathname === '/broker/add-property';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobil pastki menyu" id="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {/* Home */}
        <Link
          to="/"
          className={`mobile-bottom-tab ${isHomeActive ? 'active' : ''}`}
          id="mob-tab-home"
        >
          <div className="mobile-tab-icon">
            <UyTopHouseIcon size={22} color={isHomeActive ? '#10B981' : '#6B7280'} />
          </div>
          <span className="mobile-tab-label">Asosiy</span>
        </Link>

        {/* Catalog */}
        <Link
          to="/catalog"
          className={`mobile-bottom-tab ${isCatalogActive ? 'active' : ''}`}
          id="mob-tab-catalog"
        >
          <div className="mobile-tab-icon">
            <Compass size={22} color={isCatalogActive ? '#10B981' : '#6B7280'} />
          </div>
          <span className="mobile-tab-label">Katalog</span>
        </Link>

        {/* Add Property / Center Action */}
        <Link
          to={getAddLink()}
          className={`mobile-bottom-tab mobile-tab-center ${isAddActive ? 'active' : ''}`}
          id="mob-tab-add"
        >
          <div className="mobile-tab-center-icon">
            <PlusCircle size={26} color="#FFFFFF" />
          </div>
          <span className="mobile-tab-label">E'lon berish</span>
        </Link>

        {/* Chat */}
        <Link
          to={isAuthenticated ? '/chat' : '/login'}
          className={`mobile-bottom-tab ${isChatActive ? 'active' : ''}`}
          id="mob-tab-chat"
        >
          <div className="mobile-tab-icon">
            <MessageSquare size={22} color={isChatActive ? '#10B981' : '#6B7280'} />
          </div>
          <span className="mobile-tab-label">Xabarlar</span>
        </Link>

        {/* Profile / Admin */}
        <Link
          to={getProfileLink()}
          className={`mobile-bottom-tab ${isProfileActive ? 'active' : ''}`}
          id="mob-tab-profile"
        >
          <div className="mobile-tab-icon">
            {isAuthenticated && user?.role === 'admin' ? (
              <Shield size={22} color={isProfileActive ? '#10B981' : '#6B7280'} />
            ) : (
              <User size={22} color={isProfileActive ? '#10B981' : '#6B7280'} />
            )}
          </div>
          <span className="mobile-tab-label">
            {isAuthenticated && user?.role === 'admin' ? 'Admin' : isAuthenticated ? 'Kabinet' : 'Kirish'}
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
