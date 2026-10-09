import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Phone, Mail, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UyTopHouseIcon } from '../components/UyTopHouseIcon';
import { trackUserActivity } from '../services/activityTracker';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'mijoz' | 'makler'>('mijoz');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Ism va familiyangizni to\'liq kiriting');
      return;
    }
    if (!phone || phone.length < 9) {
      setError('Telefon raqamini to\'g\'ri kiriting');
      return;
    }
    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi shart');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Kiritilgan parollar bir-biriga mos kelmadi');
      return;
    }
    if (!agreeTerms) {
      setError('Foydalanish shartlariga rozilik bildirish majburiy');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: role === 'makler' && email.trim() ? email.trim() : null,
        role,
        password,
        password_confirm: passwordConfirm,
        agree_terms: agreeTerms,
      };

      const res = await api.register(payload);
      login(res.access_token, res.refresh_token, res.user);
      trackUserActivity('USER_REGISTER', 'user', res.user.id, { role: res.user.role, phone: res.user.phone });

      if (res.user.role === 'makler') {
        navigate('/broker');
      } else {
        navigate('/client');
      }
    } catch (err: any) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '24px',
        padding: '2.5rem',
        maxWidth: '520px',
        width: '100%',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.6rem', fontWeight: 800, color: '#0F382A' }}>
            <UyTopHouseIcon size={32} color="#10B981" />
            <span>Uy<span style={{ color: '#10B981' }}>Top</span></span>
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginTop: '1rem' }}>
            Yangi hisob yaratish
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Uy ijarasi yoki e'lon berish uchun ro'yxatdan o'ting
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

        <form onSubmit={handleSubmit} id="register-form">
          {/* Role Choice */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Qanday maqsadda ro'yxatdan o'tyapsiz?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setRole('mijoz')}
                style={{
                  border: role === 'mijoz' ? '2px solid #0F382A' : '1px solid #E5E7EB',
                  background: role === 'mijoz' ? '#ECFDF5' : '#FFFFFF',
                  color: role === 'mijoz' ? '#0F382A' : '#4B5563',
                  padding: '1rem',
                  borderRadius: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                id="role-select-mijoz"
              >
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>Mijoz</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>Uy izlayapman</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('makler')}
                style={{
                  border: role === 'makler' ? '2px solid #0F382A' : '1px solid #E5E7EB',
                  background: role === 'makler' ? '#ECFDF5' : '#FFFFFF',
                  color: role === 'makler' ? '#0F382A' : '#4B5563',
                  padding: '1rem',
                  borderRadius: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                id="role-select-makler"
              >
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>Makler / Uy egasi</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>E'lon beraman</div>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-firstname">Ism:</label>
              <input
                type="text"
                id="reg-firstname"
                className="form-input"
                placeholder="Ali"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-lastname">Familiya:</label>
              <input
                type="text"
                id="reg-lastname"
                className="form-input"
                placeholder="Valiyev"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Telefon raqami:</label>
            <input
              type="tel"
              id="reg-phone"
              className="form-input"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {role === 'makler' && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email manzili (Makler uchun):</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="reg-email"
                  className="form-input"
                  placeholder="makler@uytop.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Parol (kamida 6 belgi):</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="reg-password"
                className="form-input"
                placeholder="Kuchli parol yarating"
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

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password-confirm">Parolni tasdiqlash:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="reg-password-confirm"
              className="form-input"
              placeholder="Parolni qayta tering"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '1rem 0' }}>
            <input
              type="checkbox"
              id="reg-agree-terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="reg-agree-terms" style={{ fontSize: '0.85rem', color: '#4B5563', cursor: 'pointer' }}>
              UyTop foydalanish shartlari va maxfiylik siyosatiga roziman
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '48px', fontSize: '1rem' }}
            disabled={loading}
            id="btn-register-submit"
          >
            {loading ? 'Yaratilmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#6B7280' }}>
          Allaqachon akkauntingiz bormi?{' '}
          <Link to="/login" style={{ color: '#10B981', fontWeight: 700 }} id="link-to-login">
            Kirish
          </Link>
        </div>
      </div>
    </div>
  );
};
