import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  PlusCircle,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Compass,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../services/api';
import { UyTopHouseIcon } from './UyTopHouseIcon';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo with exact reference green house icon */}
        <Link to="/" className="brand-logo" id="header-brand-logo">
          <UyTopHouseIcon size={28} color="#10B981" />
          <span>
            Uy<span style={{ color: '#10B981' }}>Top</span>
          </span>
          <span className="brand-badge">O'zbekiston</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} id="nav-home">
                Bosh sahifa
              </Link>
            </li>
            <li>
              <Link to="/catalog" className={`nav-link ${location.pathname === '/catalog' && !location.search.includes('view=map') ? 'active' : ''}`} id="nav-catalog">
                Uylar katalogi
              </Link>
            </li>
            <li>
              <Link to="/catalog?view=map" className={`nav-link ${location.search.includes('view=map') ? 'active' : ''}`} id="nav-map">
                Xarita
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/favorites" className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`} id="nav-favorites">
                  <Heart size={18} />
                  <span>Sevimlilar</span>
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <Link to="/chat" className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`} id="nav-chat">
                  <MessageSquare size={18} />
                  <span>Xabarlar</span>
                </Link>
              </li>
            )}
            {/* Direct Admin Panel shortcut */}
            <li>
              <Link
                to={isAuthenticated && user?.role === 'admin' ? '/admin' : '/login?role=admin'}
                className="nav-link admin-pill-link"
                id="nav-admin-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  color: user?.role === 'admin' ? '#10B981' : '#0F382A',
                }}
              >
                <Shield size={16} color="#10B981" />
                <span>Admin Panel</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Desktop User Actions */}
        <div className="nav-actions desktop-actions">
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {(user.role === 'makler' || user.role === 'admin') && (
                <Link to="/broker/add-property" className="btn btn-accent btn-sm-responsive" id="btn-add-property-nav">
                  <PlusCircle size={18} />
                  <span>+ Yangi uy qo'shish</span>
                </Link>
              )}

              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="btn btn-primary"
                  id="btn-admin-nav"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #0A291E 0%, #10B981 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                  }}
                >
                  {user.avatar_url ? (
                    <img
                      src={getFullImageUrl(user.avatar_url)}
                      alt="Admin"
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Shield size={18} color="#FFFFFF" />
                  )}
                  <span>Nasriddinova Dilfuza (Admin)</span>
                </Link>
              ) : user.role === 'makler' ? (
                <Link to="/broker" className="btn btn-outline" id="btn-broker-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {user.avatar_url ? (
                    <img
                      src={getFullImageUrl(user.avatar_url)}
                      alt="Makler"
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={18} />
                  )}
                  <span>Makler ({user.first_name})</span>
                </Link>
              ) : (
                <Link to="/client" className="btn btn-outline" id="btn-client-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {user.avatar_url ? (
                    <img
                      src={getFullImageUrl(user.avatar_url)}
                      alt="Client"
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={18} />
                  )}
                  <span>Kabinet ({user.first_name})</span>
                </Link>
              )}

              <button onClick={handleLogout} className="btn btn-ghost" title="Tizimdan chiqish" id="btn-logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <Link
                to="/login?role=admin"
                className="btn btn-accent"
                id="btn-admin-guest"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0F382A',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                }}
              >
                <Shield size={16} color="#10B981" />
                <span>Admin Panel</span>
              </Link>
              <Link to="/login" className="btn btn-outline" id="btn-login-nav">
                Kirish
              </Link>
              <Link to="/register" className="btn btn-primary" id="btn-register-nav">
                Ro'yxatdan o'tish
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
          id="btn-mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X size={26} color="#0F382A" /> : <Menu size={26} color="#0F382A" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`} id="mobile-nav-drawer">
        <div className="mobile-drawer-header">
          <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
            <UyTopHouseIcon size={26} color="#10B981" />
            <span>
              Uy<span style={{ color: '#10B981' }}>Top</span>
            </span>
            <span className="brand-badge">O'zbekiston</span>
          </Link>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Yopish"
          >
            <X size={22} />
          </button>
        </div>

        {/* User Card in Mobile Drawer */}
        <div className="mobile-drawer-user-section">
          {isAuthenticated && user ? (
            <div className="mobile-user-card">
              <div className="mobile-user-avatar">
                {user.avatar_url ? (
                  <img src={getFullImageUrl(user.avatar_url)} alt={user.first_name} />
                ) : user.role === 'admin' ? (
                  <Shield size={22} color="#FFFFFF" />
                ) : (
                  user.first_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="mobile-user-info">
                <div className="mobile-user-name">
                  {user.first_name} {user.last_name}
                </div>
                <div className="mobile-user-phone">{user.phone}</div>
                <span className="mobile-role-pill">
                  {user.role === 'admin' ? '🛡️ Administrator' : user.role === 'makler' ? '🏢 Makler' : '👤 Mijoz'}
                </span>
              </div>
            </div>
          ) : (
            <div className="mobile-guest-card">
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                Xush kelibsiz! Platformadan to'liq foydalanish uchun tizimga kiring:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  style={{ textAlign: 'center', padding: '0.6rem' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kirish
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ textAlign: 'center', padding: '0.6rem' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Links */}
        <div className="mobile-drawer-links">
          <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-link-icon-wrap">
              <UyTopHouseIcon size={20} color="#10B981" />
            </div>
            <span>Bosh sahifa</span>
            <ChevronRight size={18} className="chevron" />
          </Link>

          <Link to="/catalog" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-link-icon-wrap">
              <Compass size={20} color="#10B981" />
            </div>
            <span>Uylar katalogi</span>
            <ChevronRight size={18} className="chevron" />
          </Link>

          <Link to="/catalog?view=map" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-link-icon-wrap">
              <MapPin size={20} color="#10B981" />
            </div>
            <span>Xarita bo'yicha qidiruv</span>
            <ChevronRight size={18} className="chevron" />
          </Link>

          {isAuthenticated && (
            <Link to="/favorites" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <div className="mobile-link-icon-wrap">
                <Heart size={20} color="#DC2626" />
              </div>
              <span>Sevimlilar ro'yxati</span>
              <ChevronRight size={18} className="chevron" />
            </Link>
          )}

          {isAuthenticated && (
            <Link to="/chat" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <div className="mobile-link-icon-wrap">
                <MessageSquare size={20} color="#7C3AED" />
              </div>
              <span>Xabarlar va suhbatlar</span>
              <ChevronRight size={18} className="chevron" />
            </Link>
          )}

          {/* Admin Panel Direct Link */}
          <Link
            to={isAuthenticated && user?.role === 'admin' ? '/admin' : '/login?role=admin'}
            className="mobile-link mobile-link-admin"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="mobile-link-icon-wrap" style={{ background: '#ECFDF5' }}>
              <Shield size={20} color="#10B981" />
            </div>
            <div>
              <span style={{ fontWeight: 700, color: '#065F46' }}>Admin Panel</span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#059669' }}>
                Nasriddinova Dilfuza
              </span>
            </div>
            <ChevronRight size={18} className="chevron" />
          </Link>

          {/* Add property for broker/admin */}
          {isAuthenticated && user && (user.role === 'makler' || user.role === 'admin') && (
            <Link
              to="/broker/add-property"
              className="mobile-link"
              style={{ background: '#ECFDF5', borderRadius: '12px', marginTop: '0.5rem' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-link-icon-wrap" style={{ background: '#10B981', color: '#FFFFFF' }}>
                <PlusCircle size={20} color="#FFFFFF" />
              </div>
              <span style={{ fontWeight: 700, color: '#065F46' }}>+ Yangi uy qo'shish</span>
              <ChevronRight size={18} className="chevron" />
            </Link>
          )}

          {/* User profile dashboards */}
          {isAuthenticated && user && (
            <Link
              to={user.role === 'admin' ? '/admin' : user.role === 'makler' ? '/broker' : '/client'}
              className="mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-link-icon-wrap">
                <User size={20} color="#0F382A" />
              </div>
              <span>Shaxsiy kabinet</span>
              <ChevronRight size={18} className="chevron" />
            </Link>
          )}
        </div>

        {/* Mobile Drawer Footer */}
        {isAuthenticated && (
          <div className="mobile-drawer-footer">
            <button type="button" onClick={handleLogout} className="mobile-logout-btn">
              <LogOut size={18} />
              <span>Hisobdan chiqish</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
