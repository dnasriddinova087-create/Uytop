import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Building, AlertTriangle, FileText, CheckCircle,
  XCircle, Search, Eye, Lock, Unlock, ExternalLink
} from 'lucide-react';
import { AdminStats, User, Property, AuditLog } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSkeleton';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'reports' | 'audit'>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('');

  // Rejection Dialog
  const [rejectPropId, setRejectPropId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('Talablarga mos kelmaydi');

  const fetchOverview = async () => {
    try {
      const data = await api.getAdminDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getAdminUsers({
        search: userSearch || undefined,
        role: userRoleFilter || undefined,
      });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const fetchProperties = async () => {
    try {
      const data = await api.getAdminProperties({
        status: propertyStatusFilter || undefined,
      });
      setProperties(data);
    } catch (err) {
      console.error('Failed to load admin properties', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const data = await api.getAuditLogs();
      setAuditLogs(data.items);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchOverview(), fetchUsers(), fetchProperties(), fetchAuditLogs()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleToggleUserBlock = async (targetUser: User) => {
    const newStatus = !targetUser.is_active;
    const confirmMsg = newStatus ? "Foydalanuvchini blokdan chiqarmoqchimisiz?" : "Foydalanuvchini bloklamoqchimisiz?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.updateUserStatus(targetUser.id, { is_active: newStatus });
      fetchUsers();
      fetchOverview();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleToggleBrokerVerify = async (targetUser: User) => {
    try {
      await api.updateUserStatus(targetUser.id, { is_verified: !targetUser.is_verified });
      fetchUsers();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleApproveProperty = async (propId: number) => {
    try {
      await api.moderateProperty(propId, { status: 'active' });
      fetchProperties();
      fetchOverview();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleRejectProperty = async () => {
    if (!rejectPropId) return;
    try {
      await api.moderateProperty(rejectPropId, { status: 'rejected', rejection_reason: rejectReason });
      setRejectPropId(null);
      fetchProperties();
      fetchOverview();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Admin panel yuklanmoqda..." />;

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '5rem' }}>
      {/* Admin Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A291E 0%, #164E3A 100%)',
        color: '#FFFFFF',
        borderRadius: '20px',
        padding: '2.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={32} color="#10B981" />
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }} id="admin-panel-title">
            UyTop Boshqaruv Markazi (Admin Panel)
          </h1>
        </div>
        <p style={{ color: '#D1D5DB', marginTop: '6px', fontSize: '0.95rem' }}>
          Platforma statistikasi, foydalanuvchilar nazorati, e'lonlar moderatsiyasi va audit jurnali.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid #E5E7EB', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'overview' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'overview' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          id="tab-admin-overview"
        >
          Umumiy ko'rsatkichlar
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('users'); fetchUsers(); }}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'users' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'users' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          id="tab-admin-users"
        >
          Foydalanuvchilar ({users.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('properties'); fetchProperties(); }}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'properties' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'properties' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          id="tab-admin-properties"
        >
          E'lonlar moderatsiyasi ({properties.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('audit'); fetchAuditLogs(); }}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'audit' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'audit' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          id="tab-admin-audit"
        >
          Audit jurnali
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}>
            <div className="stat-card">
              <div className="stat-label">Jami foydalanuvchilar</div>
              <div className="stat-value">{stats.total_users}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Faol mijozlar</div>
              <div className="stat-value" style={{ color: '#059669' }}>{stats.active_clients}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Faol maklerlar</div>
              <div className="stat-value" style={{ color: '#2563EB' }}>{stats.active_brokers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Bloklanganlar</div>
              <div className="stat-value" style={{ color: '#DC2626' }}>{stats.blocked_users}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Jami uylar</div>
              <div className="stat-value">{stats.total_properties}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Faol e'lonlar</div>
              <div className="stat-value" style={{ color: '#059669' }}>{stats.active_properties}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ijaraga berilganlar</div>
              <div className="stat-value" style={{ color: '#D97706' }}>{stats.rented_properties}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Shikoyatlar</div>
              <div className="stat-value" style={{ color: '#DC2626' }}>{stats.total_reports}</div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Ism, telefon yoki email bo'yicha qidirish..."
                className="form-input"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <select
              className="form-input"
              style={{ width: '180px' }}
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
            >
              <option value="">Barcha rollar</option>
              <option value="mijoz">Mijozlar</option>
              <option value="makler">Maklerlar</option>
              <option value="admin">Adminlar</option>
            </select>
            <button type="button" onClick={fetchUsers} className="btn btn-primary">
              <Search size={16} /> Izlash
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Foydalanuvchi</th>
                  <th>Telefon</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 700 }}>{u.first_name} {u.last_name}</td>
                    <td>{u.phone}</td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <span className="badge badge-rent-type" style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.is_active ? (
                        <span className="badge badge-active">Faol</span>
                      ) : (
                        <span className="badge badge-rented">Bloklangan</span>
                      )}
                      {u.role === 'makler' && u.is_verified && (
                        <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF', marginLeft: '4px' }}>
                          ✓ Tasdiqlangan
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleUserBlock(u)}
                          className="btn btn-outline"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            color: u.is_active ? '#DC2626' : '#059669',
                            borderColor: u.is_active ? '#FECACA' : '#A7F3D0',
                          }}
                        >
                          {u.is_active ? <><Lock size={12} /> Bloklash</> : <><Unlock size={12} /> Ochish</>}
                        </button>

                        {u.role === 'makler' && (
                          <button
                            type="button"
                            onClick={() => handleToggleBrokerVerify(u)}
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            {u.is_verified ? "Tasdiqni bekor qilish" : "Tasdiqlash"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Properties Moderation Tab */}
      {activeTab === 'properties' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Holat bo'yicha filter:</label>
            <select
              className="form-input"
              style={{ width: '200px' }}
              value={propertyStatusFilter}
              onChange={(e) => setPropertyStatusFilter(e.target.value)}
            >
              <option value="">Barchasi</option>
              <option value="active">Faol (Active)</option>
              <option value="pending">Kutilmoqda (Pending)</option>
              <option value="rented">Ijaraga berilgan (Rented)</option>
              <option value="hidden">Yashirilgan (Hidden)</option>
              <option value="rejected">Rad etilgan (Rejected)</option>
            </select>
            <button type="button" onClick={fetchProperties} className="btn btn-primary">
              Yangilash
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sarlavha</th>
                  <th>Muallif</th>
                  <th>Hudud</th>
                  <th>Narx</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>
                      <a href={`/properties/${p.id}`} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: '#0F382A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {p.title} <ExternalLink size={12} color="#9CA3AF" />
                      </a>
                    </td>
                    <td>{p.owner?.first_name} {p.owner?.last_name}</td>
                    <td>{p.region}, {p.city_district}</td>
                    <td style={{ fontWeight: 700 }}>{new Intl.NumberFormat('uz-UZ').format(p.price)} {p.currency}</td>
                    <td>
                      <span className={`badge ${p.status === 'active' ? 'badge-active' : p.status === 'rented' ? 'badge-rented' : 'badge-pending'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {p.status !== 'active' && (
                          <button
                            type="button"
                            onClick={() => handleApproveProperty(p.id)}
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}
                          >
                            Tasdiqlash
                          </button>
                        )}
                        {p.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setRejectPropId(p.id)}
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }}
                          >
                            Rad etish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '1.25rem' }}>
            Tizim audit jurnali (Audit Logs)
          </h3>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vaqt</th>
                  <th>Amal (Action)</th>
                  <th>Ob'ekt turi</th>
                  <th>ID</th>
                  <th>Foydalanuvchi</th>
                  <th>Tafsilotlar</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      {new Date(log.created_at).toLocaleString('uz-UZ')}
                    </td>
                    <td style={{ fontWeight: 700, color: '#0F382A' }}>{log.action}</td>
                    <td>{log.entity_type}</td>
                    <td>#{log.entity_id || '-'}</td>
                    <td>{log.user ? `${log.user.first_name} (${log.user.phone})` : 'Tizim'}</td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectPropId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem',
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#DC2626', marginBottom: '1rem' }}>
              E'lonni rad etish
            </h3>
            <div className="form-group">
              <label className="form-label">Rad etish sababini tanlang yoki yozing:</label>
              <textarea
                className="form-input"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setRejectPropId(null)} className="btn btn-outline">
                Bekor qilish
              </button>
              <button type="button" onClick={handleRejectProperty} className="btn btn-danger">
                Rad etishni tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
