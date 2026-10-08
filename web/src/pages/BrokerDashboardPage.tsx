import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Building, Eye, EyeOff, Archive, ExternalLink, User as UserIcon, ListChecks } from 'lucide-react';
import { Property } from '../types';
import { api, getFullImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSkeleton';
import { ProfileSettingsCard } from '../components/ProfileSettingsCard';

export const BrokerDashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'profile'>('listings');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProperties = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getProperties({ owner_id: user.id, page_size: 50 });
      setProperties(res.items);
    } catch (err) {
      console.error('Failed to load broker properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, [user]);

  const handleMarkRented = async (id: number) => {
    try {
      await api.markRented(id);
      fetchMyProperties();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleClose = async (id: number) => {
    try {
      await api.closeProperty(id);
      fetchMyProperties();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleReopen = async (id: number) => {
    try {
      await api.reopenProperty(id);
      fetchMyProperties();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleArchive = async (id: number) => {
    if (!window.confirm("Haqiqatan ham bu e'lonni arxivlamoqchimisiz?")) return;
    try {
      await api.archiveProperty(id);
      fetchMyProperties();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  // Metrics
  const totalCount = properties.length;
  const activeCount = properties.filter((p) => p.status === 'active').length;
  const rentedCount = properties.filter((p) => p.status === 'rented').length;
  const totalViews = properties.reduce((acc, p) => acc + p.views_count, 0);

  const avatarSrc = user?.avatar_url ? getFullImageUrl(user.avatar_url) : null;

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '5rem' }}>
      {/* Top Banner & Add Button */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '20px',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#ECFDF5',
            border: '2px solid #10B981',
            color: '#0F382A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 800,
          }}>
            {avatarSrc ? (
              <img src={avatarSrc} alt={user?.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.first_name ? user.first_name[0] : 'M'
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F382A' }} id="broker-dashboard-heading">
              {user?.first_name} {user?.last_name} (Makler Kabineti)
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', marginTop: '2px' }}>
              O'z e'lonlaringizni boshqaring, ko'rishlar statistikasini kuzating va hisobingizni sozlang.
            </p>
          </div>
        </div>

        <Link to="/broker/add-property" className="btn btn-accent" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }} id="btn-add-property-broker-page">
          <PlusCircle size={20} />
          <span>+ Yangi uy qo'shish</span>
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E5E7EB', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'listings' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'listings' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
          id="tab-broker-listings"
        >
          <ListChecks size={18} /> Mening e'lonlarim ({totalCount})
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
            cursor: 'pointer',
          }}
          id="tab-broker-profile"
        >
          <UserIcon size={18} /> Profil sozlamalari
        </button>
      </div>

      {activeTab === 'listings' ? (
        <>
          {/* Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}>
            <div className="stat-card">
              <div className="stat-label">Jami e'lonlar</div>
              <div className="stat-value">{totalCount}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Faol e'lonlar</div>
              <div className="stat-value" style={{ color: '#059669' }}>{activeCount}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Ijaraga berilganlar</div>
              <div className="stat-value" style={{ color: '#DC2626' }}>{rentedCount}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Jami ko'rishlar</div>
              <div className="stat-value" style={{ color: '#2563EB' }}>{totalViews}</div>
            </div>
          </div>

          {/* Listings Table / Management */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F382A', marginBottom: '1.5rem' }}>
              Mening e'lonlarim ro'yxati
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : properties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Building size={48} color="#9CA3AF" />
                <h3 style={{ marginTop: '1rem', color: '#111827' }}>Sizda hali e'lonlar yo'q</h3>
                <p style={{ color: '#6B7280', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                  Birinchi uy e'loningizni qo'shib, ijaraga berishni boshlang.
                </p>
                <Link to="/broker/add-property" className="btn btn-primary">
                  + Yangi uy qo'shish
                </Link>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rasm</th>
                      <th>Sarlavha</th>
                      <th>Hudud</th>
                      <th>Narx</th>
                      <th>Holat</th>
                      <th>Ko'rishlar</th>
                      <th>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => {
                      const thumb = prop.images && prop.images[0] ? getFullImageUrl(prop.images[0].image_url) : null;
                      return (
                        <tr key={prop.id}>
                          <td style={{ width: '80px' }}>
                            <div style={{ width: '60px', height: '45px', borderRadius: '8px', overflow: 'hidden', background: '#F3F4F6' }}>
                              {thumb ? (
                                <img src={thumb} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '10px', color: '#9CA3AF' }}>Rasm yo'q</div>
                              )}
                            </div>
                          </td>

                          <td>
                            <Link to={`/properties/${prop.id}`} style={{ fontWeight: 700, color: '#0F382A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {prop.title} <ExternalLink size={13} color="#9CA3AF" />
                            </Link>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                              {prop.rooms} xona • {prop.area_sqm} m²
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem' }}>{prop.region}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{prop.city_district}</div>
                          </td>

                          <td style={{ fontWeight: 700 }}>
                            {new Intl.NumberFormat('uz-UZ').format(prop.price)} {prop.currency}
                          </td>

                          <td>
                            {prop.status === 'rented' ? (
                              <span className="badge badge-rented">Ijaraga berildi</span>
                            ) : prop.status === 'active' ? (
                              <span className="badge badge-active">Faol</span>
                            ) : prop.status === 'hidden' ? (
                              <span className="badge badge-pending">Yashirilgan</span>
                            ) : (
                              <span className="badge badge-pending">{prop.status}</span>
                            )}
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                              <Eye size={14} color="#6B7280" /> {prop.views_count}
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {/* Rent toggle */}
                              {prop.status !== 'rented' ? (
                                <button
                                  type="button"
                                  onClick={() => handleMarkRented(prop.id)}
                                  className="btn btn-outline"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA' }}
                                  title="Ijaraga berildi deb belgilash"
                                >
                                  Ijaraga berildi
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleReopen(prop.id)}
                                  className="btn btn-outline"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}
                                  title="Qayta faollashtirish"
                                >
                                  Qayta faol
                                </button>
                              )}

                              {/* Hide / Reopen */}
                              {prop.status === 'active' && (
                                <button
                                  type="button"
                                  onClick={() => handleClose(prop.id)}
                                  className="btn btn-ghost"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  title="Vaqtincha yashirish"
                                >
                                  <EyeOff size={14} /> Yashirish
                                </button>
                              )}

                              {/* Archive */}
                              {prop.status !== 'archived' && (
                                <button
                                  type="button"
                                  onClick={() => handleArchive(prop.id)}
                                  className="btn btn-ghost"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#9CA3AF' }}
                                  title="Arxivlash"
                                >
                                  <Archive size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        user && <ProfileSettingsCard user={user} onUserUpdated={updateUser} />
      )}
    </div>
  );
};
