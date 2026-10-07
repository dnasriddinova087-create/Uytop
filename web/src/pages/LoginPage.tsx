import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff, Lock, Phone } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        maxWidth: '440px',
        width: '100%',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.6rem', fontWeight: 800, color: '#0F382A' }}>
            <Home size={30} color="#0F382A" />
            <span>Uy<span style={{ color: '#10B981' }}>Top</span></span>
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginTop: '1rem' }}>
            Kabinetga kirish
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Platformadan to'liq foydalanish uchun hisobingizga kiring
          </p>
        </div>

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
              Telefon raqami yoki Email:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="login-identifier"
                className="form-input"
                placeholder="+998901234567 yoki email"
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
                placeholder="Parolingizni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '48px', marginTop: '0.5rem', fontSize: '1rem' }}
            disabled={loading}
            id="btn-login-submit"
          >
            {loading ? 'Kirilmoqda...' : 'Tizimga kirish'}
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
