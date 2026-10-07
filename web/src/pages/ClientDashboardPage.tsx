import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, User, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { Property, Conversation } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingSpinner } from '../components/LoadingSkeleton';

export const ClientDashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'chats' | 'profile'>('favorites');

  const [favorites, setFavorites] = useState<Property[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [favs, chats] = await Promise.all([
          api.getFavorites(),
          api.getConversations(),
        ]);
        setFavorites(favs);
        setConversations(chats);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateMe({
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
      });
      updateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '5rem' }}>
      {/* Profile Header */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '20px',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#ECFDF5',
            color: '#0F382A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
          }}>
            {user?.first_name ? user.first_name[0] : 'M'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }} id="client-name-heading">
              {user?.first_name} {user?.last_name}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
              <span>📞 {user?.phone}</span>
              {user?.email && <span>✉️ {user.email}</span>}
              <span className="badge badge-active" style={{ textTransform: 'capitalize' }}>
                {user?.role === 'makler' ? 'Makler' : user?.role === 'admin' ? 'Admin' : 'Mijoz'}
              </span>
            </div>
          </div>
        </div>

        {user?.role === 'makler' && (
          <Link to="/broker" className="btn btn-primary" id="btn-switch-to-broker">
            Makler boshqaruviga o'tish →
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E5E7EB', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'favorites' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'favorites' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          id="tab-client-favorites"
        >
          <Heart size={18} /> Saqlangan uylar ({favorites.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'chats' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'chats' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          id="tab-client-chats"
        >
          <MessageSquare size={18} /> Xabarlarim ({conversations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'profile' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'profile' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          id="tab-client-profile"
        >
          <User size={18} /> Profil sozlamalari
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'favorites' ? (
        favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <Heart size={48} color="#9CA3AF" />
            <h3 style={{ marginTop: '1rem', color: '#111827' }}>Sizda hali saqlangan uylar yo'q</h3>
            <p style={{ color: '#6B7280', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Katalogdan o'zingizga ma'qul uylarni yurakcha tugmasi orqali saqlang.
            </p>
            <Link to="/catalog" className="btn btn-primary">
              Katalogga o'tish
            </Link>
          </div>
        ) : (
          <div className="grid-cards">
            {favorites.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={{ ...prop, is_favorited: true }}
                onFavoriteChange={(propId, isFavNow) => {
                  if (!isFavNow) {
                    setFavorites((prev) => prev.filter((p) => p.id !== propId));
                  }
                }}
              />
            ))}
          </div>
        )
      ) : activeTab === 'chats' ? (
        conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <MessageSquare size={48} color="#9CA3AF" />
            <h3 style={{ marginTop: '1rem', color: '#111827' }}>Suhbatlar mavjud emas</h3>
            <p style={{ color: '#6B7280', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Uy e'lonlari sahifasida "Xabar yozish" tugmasini bosib makler bilan suhbatni boshlashingiz mumkin.
            </p>
            <Link to="/catalog" className="btn btn-primary">
              Uylarni ko'rish
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/chat?conversationId=${conv.id}`}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#ECFDF5',
                    color: '#0F382A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}>
                    {conv.broker?.first_name ? conv.broker.first_name[0] : 'M'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827' }}>
                      {conv.broker?.first_name} {conv.broker?.last_name}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>
                      {conv.last_message?.text || "Suhbat boshlandi"}
                    </div>
                  </div>
                </div>

                {conv.unread_count > 0 && (
                  <span className="badge badge-active">{conv.unread_count} yangi</span>
                )}
              </Link>
            ))}
          </div>
        )
      ) : (
        <div style={{ maxWidth: '480px', background: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '1.25rem' }}>
            Shaxsiy ma'lumotlarni tahrirlash
          </h3>

          {saveSuccess && (
            <div style={{ padding: '0.75rem', background: '#ECFDF5', color: '#065F46', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>
              Ma'lumotlar saqlandi!
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Ism:</label>
              <input
                type="text"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Familiya:</label>
              <input
                type="text"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              O'zgarishlarni saqlash
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
