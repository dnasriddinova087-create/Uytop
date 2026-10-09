import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Phone, Shield, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UyTopHouseIcon } from '../components/UyTopHouseIcon';
import { trackUserActivity } from '../services/activityTracker';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const roleParam = searchParams.get('role');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(roleParam === 'admin');

  const [identifier, setIdentifier] = useState(roleParam === 'admin' ? 'admin@uytop.uz' : '');
  const [password, setPassword] = useState(roleParam === 'admin' ? 'dilfuza.4002' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleParam === 'admin') {
      setIsAdminMode(true);
      setIdentifier('admin@uytop.uz');
      setPassword('dilfuza.4002');
    }
  }, [roleParam]);

  const handleSelectAdminTab = () => {
    setIsAdminMode(true);
    setIdentifier('admin@uytop.uz');
    setPassword('dilfuza.4002');
    setError(null);
  };

  const handleSelectUserTab = () => {
    setIsAdminMode(false);
    setIdentifier('');
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError('Telefon raqami/email va parolni kiriting');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ identifier: identifier.trim(), password });
      login(res.access_token, res.refresh_token, res.user);
      trackUserActivity('USER_LOGIN', 'user', res.user.id, { role: res.user.role });

      if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (res.user.role === 'makler') {
        navigate('/broker');
      } else {
        navigate('/client');
      }
    } catch (err: any) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ identifier: 'admin@uytop.uz', password: 'dilfuza.4002' });
      login(res.access_token, res.refresh_token, res.user);
      trackUserActivity('USER_LOGIN', 'user', res.user.id, { role: 'admin' });
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Admin sifatida kirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '24px',
        padding: '2.5rem',
        maxWidth: '460px',
        width: '100%',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.6rem', fontWeight: 800, color: '#0F382A' }}>
            <UyTopHouseIcon size={32} color="#10B981" />
            <span>Uy<span style={{ color: '#10B981' }}>Top</span></span>
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginTop: '0.75rem' }}>
            {isAdminMode ? 'Administrator Kirishi' : 'Kabinetga kirish'}
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {isAdminMode
              ? "Nasriddinova Dilfuza boshqaruv paneliga kirish"
              : "Platformadan to'liq foydalanish uchun hisobingizga kiring"}
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div style={{
          display: 'flex',
          background: '#F3F4F6',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            onClick={handleSelectUserTab}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: !isAdminMode ? '#FFFFFF' : 'transparent',
              color: !isAdminMode ? '#111827' : '#6B7280',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: !isAdminMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Mijoz / Makler
          </button>
          <button
            type="button"
            onClick={handleSelectAdminTab}
            id="tab-select-admin-mode"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: isAdminMode ? '#0F382A' : 'transparent',
              color: isAdminMode ? '#FFFFFF' : '#6B7280',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: isAdminMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Shield size={14} color={isAdminMode ? '#10B981' : '#6B7280'} />
            <span>Admin (Dilfuza)</span>
          </button>
        </div>

        {isAdminMode && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 56, 42, 0.1) 100%)',
            border: '1px solid #A7F3D0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', fontWeight: 700, fontSize: '0.9rem' }}>
              <Shield size={18} color="#059669" />
              <span>Nasriddinova Dilfuza (Admin tizimi)</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '4px' }}>
              Admin panelga kirish paroli: <code>dilfuza.4002</code>
            </p>
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={loading}
              id="btn-quick-admin-login"
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '8px 12px',
                background: '#0F382A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <UserCheck size={16} color="#10B981" />
              <span>1-Klik bilan Admin sifatida kirish</span>
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-identifier">
              {isAdminMode ? 'Admin login (Email yoki Telefon):' : 'Telefon raqami yoki Email:'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="login-identifier"
                className="form-input"
                placeholder={isAdminMode ? "admin@uytop.uz" : "+998901234567 yoki email"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <Phone size={18} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">Parol:</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                className="form-input"
                placeholder={isAdminMode ? "dilfuza.4002" : "Parolingizni kiriting"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '48px', marginTop: '0.5rem', fontSize: '1rem', fontWeight: 700 }}
            disabled={loading}
            id="btn-login-submit"
          >
            {loading ? 'Kirilmoqda...' : isAdminMode ? 'Admin panelga kirish' : 'Tizimga kirish'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#6B7280' }}>
          Akkauntingiz yo'qmi?{' '}
          <Link to="/register" style={{ color: '#10B981', fontWeight: 700 }} id="link-to-register">
            Ro'yxatdan o'tish
          </Link>
        </div>
      </div>
    </div>
  );
};
