import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Heart, MessageSquare, PlusCircle, User, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../services/api';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand-logo" id="header-brand-logo">
          <Home size={28} color="#0F382A" strokeWidth={2.5} />
          <span>Uy<span style={{ color: '#10B981' }}>Top</span></span>
          <span className="brand-badge">O'zbekiston</span>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/" className="nav-link" id="nav-home">Bosh sahifa</Link>
            </li>
            <li>
              <Link to="/catalog" className="nav-link" id="nav-catalog">Uylar katalogi</Link>
            </li>
            <li>
              <Link to="/catalog?view=map" className="nav-link" id="nav-map">Xarita</Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/favorites" className="nav-link" id="nav-favorites">
                  <Heart size={18} /> Sevimlilar
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <Link to="/chat" className="nav-link" id="nav-chat">
                  <MessageSquare size={18} /> Xabarlar
                </Link>
              </li>
            )}
            {/* Always accessible Admin Portal Link */}
            <li>
              <Link
                to={isAuthenticated && user?.role === 'admin' ? '/admin' : '/login?role=admin'}
                className="nav-link"
                id="nav-admin-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
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

        <div className="nav-actions">
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Makler "+ Yangi uy qo'shish" button */}
              {(user.role === 'makler' || user.role === 'admin') && (
                <Link to="/broker/add-property" className="btn btn-accent" id="btn-add-property-nav">
                  <PlusCircle size={18} />
                  <span>+ Yangi uy qo'shish</span>
                </Link>
              )}

              {/* Role-based dashboard button */}
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
                    <img src={getFullImageUrl(user.avatar_url)} alt="Admin" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <Shield size={18} color="#FFFFFF" />
                  )}
                  <span>Nasriddinova Dilfuza (Admin)</span>
                </Link>
              ) : user.role === 'makler' ? (
                <Link to="/broker" className="btn btn-outline" id="btn-broker-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {user.avatar_url ? (
                    <img src={getFullImageUrl(user.avatar_url)} alt="Makler" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={18} />
                  )}
                  <span>Makler ({user.first_name})</span>
                </Link>
              ) : (
                <Link to="/client" className="btn btn-outline" id="btn-client-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {user.avatar_url ? (
                    <img src={getFullImageUrl(user.avatar_url)} alt="Client" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={18} />
                  )}
                  <span>Kabinet ({user.first_name})</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                title="Tizimdan chiqish"
                id="btn-logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              {/* Direct Admin Login access for quick management */}
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
      </div>
    </header>
  );
};
