import React, { useState, useRef } from 'react';
import { Camera, User as UserIcon, Phone, Mail, Lock, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { User } from '../types';
import { api, getFullImageUrl } from '../services/api';

interface ProfileSettingsCardProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export const ProfileSettingsCard: React.FC<ProfileSettingsCardProps> = ({ user, onUserUpdated }) => {
  // Profile Info state
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);

  // Avatar upload state
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess(null);
    setInfoError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setInfoError("Ism va familiyani to'liq kiriting");
      return;
    }
    if (!phone.trim()) {
      setInfoError("Telefon raqamini kiriting");
      return;
    }

    setInfoLoading(true);
    try {
      const payload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      };
      // Allow email update for broker and admin, or if client provided
      if (user.role !== 'mijoz') {
        payload.email = email.trim() ? email.trim() : null;
      }

      const updated = await api.updateMe(payload);
      onUserUpdated(updated);
      setInfoSuccess("Ma'lumotlar muvaffaqiyatli yangilandi!");
      setTimeout(() => setInfoSuccess(null), 3500);
    } catch (err: any) {
      setInfoError(err.message || "Ma'lumotlarni saqlashda xatolik yuz berdi");
    } finally {
      setInfoLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setAvatarLoading(true);
    try {
      const updated = await api.uploadAvatar(file);
      onUserUpdated(updated);
    } catch (err: any) {
      setAvatarError(err.message || 'Rasm yuklashda xatolik yuz berdi');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    if (!oldPassword || !newPassword) {
      setPassError("Barcha parollarni kiriting");
      return;
    }
    if (newPassword.length < 6) {
      setPassError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("Yangi parollar bir-biriga mos kelmadi");
      return;
    }

    setPassLoading(true);
    try {
      await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      setPassSuccess("Parol muvaffaqiyatli almashtirildi!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 3500);
    } catch (err: any) {
      setPassError(err.message || "Parolni o'zgartirishda xatolik yuz berdi");
    } finally {
      setPassLoading(false);
    }
  };

  const avatarSrc = user.avatar_url ? getFullImageUrl(user.avatar_url) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      {/* 1. Profile Picture & Personal Details */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid #E5E7EB',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserIcon size={20} color="#10B981" /> Profil ma'lumotlari
        </h3>

        {/* Avatar Upload Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#ECFDF5',
              border: '3px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#0F382A',
            }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt={user.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.first_name ? user.first_name[0] : 'U'
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              title="Profil rasmini yuklash"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: '#0F382A',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              id="btn-upload-avatar"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-file-input"
            />
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>
              {user.first_name} {user.last_name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '2px' }}>
              Rol: <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#10B981' }}>{user.role}</span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="btn btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '6px' }}
            >
              {avatarLoading ? 'Yuklanmoqda...' : 'Rasm tanlash'}
            </button>
          </div>
        </div>

        {avatarError && (
          <div style={{ padding: '0.6rem 0.8rem', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {avatarError}
          </div>
        )}

        {infoSuccess && (
          <div style={{ padding: '0.6rem 0.8rem', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> {infoSuccess}
          </div>
        )}

        {infoError && (
          <div style={{ padding: '0.6rem 0.8rem', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> {infoError}
          </div>
        )}

        <form onSubmit={handleInfoSubmit} id="profile-info-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-first-name">Ism:</label>
              <input
                type="text"
                id="profile-first-name"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-last-name">Familiya:</label>
              <input
                type="text"
                id="profile-last-name"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-phone">Telefon raqami:</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                id="profile-phone"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Phone size={16} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {user.role !== 'mijoz' && (
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email manzili:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="profile-email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@uytop.uz"
                />
                <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', height: '44px' }}
            disabled={infoLoading}
            id="btn-save-profile-info"
          >
            {infoLoading ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
          </button>
        </form>
      </div>

      {/* 2. Change Password Form */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid #E5E7EB',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={20} color="#10B981" /> Parolni o'zgartirish
        </h3>

        {passSuccess && (
          <div style={{ padding: '0.6rem 0.8rem', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> {passSuccess}
          </div>
        )}

        {passError && (
          <div style={{ padding: '0.6rem 0.8rem', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> {passError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} id="change-password-form" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="old-password">Joriy (eski) parol:</label>
              <input
                type="password"
                id="old-password"
                className="form-input"
                placeholder="Amaldagi parolingiz"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-password">Yangi parol (kamida 6 belgi):</label>
              <input
                type="password"
                id="new-password"
                className="form-input"
                placeholder="Yangi kuchli parol"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Yangi parolni tasdiqlash:</label>
              <input
                type="password"
                id="confirm-password"
                className="form-input"
                placeholder="Yangi parolni qayta tering"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: '100%', marginTop: '1rem', height: '44px' }}
            disabled={passLoading}
            id="btn-submit-change-password"
          >
            {passLoading ? 'Yangilanmoqda...' : "Parolni yangilash"}
          </button>
        </form>
      </div>
    </div>
  );
};
