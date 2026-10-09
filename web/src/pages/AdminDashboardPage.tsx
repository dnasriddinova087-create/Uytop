import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Building, AlertTriangle, FileText, CheckCircle,
  XCircle, Search, Eye, Lock, Unlock, ExternalLink, Edit3, Trash2,
  MessageSquare, Phone, Mail, ArrowUpDown, RefreshCw, UserCheck, X,
  Smartphone, Laptop, Activity
} from 'lucide-react';
import { AdminStats, User, Property, AuditLog, Conversation, Message } from '../types';
import { api, getFullImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSkeleton';
import { ProfileSettingsCard } from '../components/ProfileSettingsCard';

export const AdminDashboardPage: React.FC = () => {
  const { user: currentAdmin, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'brokers' | 'clients' | 'properties' | 'chats' | 'profile' | 'audit'>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [brokers, setBrokers] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Broker filters
  const [brokerSearch, setBrokerSearch] = useState('');
  const [brokerFilterStatus, setBrokerFilterStatus] = useState<'all' | 'verified' | 'unverified' | 'active' | 'blocked'>('all');
  const [brokerSort, setBrokerSort] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest');

  // Client filters
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilterStatus, setClientFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [clientSort, setClientSort] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest');

  // Property filters
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('');

  // Chat inspection state
  const [chatSearch, setChatSearch] = useState('');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [convMessages, setConvMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Property Edit Modal state
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCurrency, setEditCurrency] = useState('UZS');
  const [editPropertyType, setEditPropertyType] = useState('apartment');
  const [editRentType, setEditRentType] = useState('monthly');
  const [editRegion, setEditRegion] = useState('');
  const [editCityDistrict, setEditCityDistrict] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editRooms, setEditRooms] = useState('1');
  const [editAreaSqm, setEditAreaSqm] = useState('');
  const [editStatus, setEditStatus] = useState<any>('active');
  const [editDescription, setEditDescription] = useState('');
  const [savingProp, setSavingProp] = useState(false);

  // Rejection Dialog state
  const [rejectPropId, setRejectPropId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("Talablarga mos kelmaydi");

  const fetchOverview = async () => {
    try {
      const data = await api.getAdminDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    }
  };

  const fetchBrokers = async () => {
    try {
      const data = await api.getAdminUsers({
        role: 'makler',
        search: brokerSearch || undefined,
        sort_by: brokerSort,
      });
      setBrokers(data);
    } catch (err) {
      console.error('Failed to load brokers', err);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await api.getAdminUsers({
        role: 'mijoz',
        search: clientSearch || undefined,
        sort_by: clientSort,
      });
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients', err);
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

  const fetchConversations = async () => {
    try {
      const data = await api.getAdminConversations(chatSearch || undefined);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  // Audit Logs State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);

  const fetchAuditLogs = async (searchParam?: string, actionParam?: string) => {
    setAuditLoading(true);
    try {
      const data = await api.getAuditLogs({
        search: searchParam !== undefined ? searchParam : (auditSearch || undefined),
        action: actionParam !== undefined ? actionParam : (auditActionFilter || undefined),
      });
      setAuditLogs(data.items);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleDeleteAuditLog = async (id: number) => {
    if (!window.confirm("Rostdan ham ushbu foydalanuvchi harakat yozuvini o'chirmoqchimisiz? Bu faqat admin huquqi.")) return;
    setDeletingLogId(id);
    try {
      await api.deleteAuditLog(id);
      setAuditLogs((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setDeletingLogId(null);
    }
  };

  const handleClearAllAuditLogs = async () => {
    if (!window.confirm("Barcha foydalanuvchi harakat jurnallarini butunlay tozalashni tasdiqlaysizmi?")) return;
    setAuditLoading(true);
    try {
      await api.clearAuditLogs();
      setAuditLogs([]);
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchOverview(),
        fetchBrokers(),
        fetchClients(),
        fetchProperties(),
        fetchConversations(),
        fetchAuditLogs(),
      ]);
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    fetchBrokers();
  }, [brokerSort]);

  useEffect(() => {
    fetchClients();
  }, [clientSort]);

  // Open Chat inspection
  const handleOpenConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setLoadingMessages(true);
    try {
      const msgs = await api.getAdminMessages(conv.id);
      setConvMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // User Actions
  const handleToggleUserBlock = async (targetUser: User) => {
    const newStatus = !targetUser.is_active;
    const confirmMsg = newStatus ? "Foydalanuvchini blokdan chiqarmoqchimisiz?" : "Foydalanuvchini bloklamoqchimisiz?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.updateUserStatus(targetUser.id, { is_active: newStatus });
      fetchBrokers();
      fetchClients();
      fetchOverview();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleToggleBrokerVerify = async (targetUser: User) => {
    try {
      await api.updateUserStatus(targetUser.id, { is_verified: !targetUser.is_verified });
      fetchBrokers();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  // Property Actions
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

  const handleDeleteProperty = async (propId: number) => {
    if (!window.confirm("Haqiqatan ham ushbu e'lonni tizimdan butunlay o'chirmoqchimisiz?")) return;
    try {
      await api.adminDeleteProperty(propId);
      fetchProperties();
      fetchOverview();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

  // Open Property Edit Modal
  const handleOpenEditProperty = (prop: Property) => {
    setEditingProp(prop);
    setEditTitle(prop.title);
    setEditPrice(String(prop.price));
    setEditCurrency(prop.currency);
    setEditPropertyType(prop.property_type);
    setEditRentType(prop.rent_type);
    setEditRegion(prop.region);
    setEditCityDistrict(prop.city_district);
    setEditAddress(prop.address);
    setEditRooms(String(prop.rooms));
    setEditAreaSqm(String(prop.area_sqm));
    setEditStatus(prop.status);
    setEditDescription(prop.description || '');
  };

  const handleSaveEditedProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    setSavingProp(true);
    try {
      await api.updateProperty(editingProp.id, {
        title: editTitle.trim(),
        price: Number(editPrice),
        currency: editCurrency,
        property_type: editPropertyType,
        rent_type: editRentType,
        region: editRegion.trim(),
        city_district: editCityDistrict.trim(),
        address: editAddress.trim(),
        rooms: Number(editRooms),
        area_sqm: Number(editAreaSqm),
        status: editStatus,
        description: editDescription.trim() || null,
      });
      setEditingProp(null);
      fetchProperties();
      fetchOverview();
    } catch (err: any) {
      alert("E'lonni saqlashda xatolik: " + err.message);
    } finally {
      setSavingProp(false);
    }
  };

  // Filtered Brokers
  const filteredBrokers = brokers.filter((b) => {
    if (brokerFilterStatus === 'verified' && !b.is_verified) return false;
    if (brokerFilterStatus === 'unverified' && b.is_verified) return false;
    if (brokerFilterStatus === 'active' && !b.is_active) return false;
    if (brokerFilterStatus === 'blocked' && b.is_active) return false;
    return true;
  });

  // Filtered Clients
  const filteredClients = clients.filter((c) => {
    if (clientFilterStatus === 'active' && !c.is_active) return false;
    if (clientFilterStatus === 'blocked' && c.is_active) return false;
    return true;
  });

  // Filtered Properties
  const filteredProperties = properties.filter((p) => {
    if (!propertySearch) return true;
    const s = propertySearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(s) ||
      p.region.toLowerCase().includes(s) ||
      p.city_district.toLowerCase().includes(s) ||
      p.address.toLowerCase().includes(s) ||
      (p.owner && `${p.owner.first_name} ${p.owner.last_name}`.toLowerCase().includes(s))
    );
  });

  if (loading) return <LoadingSpinner text="Admin panel ma'lumotlari yuklanmoqda..." />;

  const adminAvatar = currentAdmin?.avatar_url ? getFullImageUrl(currentAdmin.avatar_url) : null;

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '5rem' }}>
      {/* Admin Header with Dilfuza Nasriddinova identity */}
      <div style={{
        background: 'linear-gradient(135deg, #0A291E 0%, #164E3A 100%)',
        color: '#FFFFFF',
        borderRadius: '24px',
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#10B981',
            border: '3px solid #34D399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#FFFFFF',
          }}>
            {adminAvatar ? (
              <img src={adminAvatar} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              'D'
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={24} color="#10B981" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }} id="admin-panel-title">
                {currentAdmin?.first_name} {currentAdmin?.last_name} (Admin Panel)
              </h1>
            </div>
            <p style={{ color: '#D1D5DB', marginTop: '4px', fontSize: '0.95rem' }}>
              Boshqaruv markazi: Maklerlar va mijozlar nazorati, e'lonlar moderatsiyasi va chatlar monitoringi.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>{stats?.total_users || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#D1D5DB' }}>Foydalanuvchilar</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60A5FA' }}>{stats?.active_brokers || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#D1D5DB' }}>Faol maklerlar</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FBBF24' }}>{stats?.total_properties || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#D1D5DB' }}>Jami e'lonlar</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid #E5E7EB', marginBottom: '2rem' }}>
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
          Umumiy statistika
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('brokers'); fetchBrokers(); }}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'brokers' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'brokers' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          id="tab-admin-brokers"
        >
          Maklerlar ({brokers.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('clients'); fetchClients(); }}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'clients' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'clients' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          id="tab-admin-clients"
        >
          Mijozlar ({clients.length})
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
          E'lonlar va Tahrirlash ({properties.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('chats'); fetchConversations(); }}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'chats' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'chats' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          id="tab-admin-chats"
        >
          Chatlar monitoringi ({conversations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'profile' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'profile' ? '#0F382A' : '#6B7280',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          id="tab-admin-profile"
        >
          Admin profili (Sozlamalar)
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

      {/* 1. Overview Tab */}
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
              <div className="stat-label">Faol maklerlar</div>
              <div className="stat-value" style={{ color: '#2563EB' }}>{stats.active_brokers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Faol mijozlar</div>
              <div className="stat-value" style={{ color: '#059669' }}>{stats.active_clients}</div>
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
              <div className="stat-label">Faol chatlar</div>
              <div className="stat-value" style={{ color: '#10B981' }}>{conversations.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Brokers Tab */}
      {activeTab === 'brokers' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Makler ismi, telefon yoki emaili bo'yicha qidirish..."
                className="form-input"
                value={brokerSearch}
                onChange={(e) => setBrokerSearch(e.target.value)}
              />
              <Search size={18} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <select
              className="form-input"
              style={{ width: '180px' }}
              value={brokerFilterStatus}
              onChange={(e) => setBrokerFilterStatus(e.target.value as any)}
            >
              <option value="all">Barcha maklerlar</option>
              <option value="verified">Faqat tasdiqlangan</option>
              <option value="unverified">Tasdiqlanmagan</option>
              <option value="active">Faol</option>
              <option value="blocked">Bloklangan</option>
            </select>

            <select
              className="form-input"
              style={{ width: '170px' }}
              value={brokerSort}
              onChange={(e) => setBrokerSort(e.target.value as any)}
            >
              <option value="newest">Eng yangi</option>
              <option value="oldest">Eng eski</option>
              <option value="name_asc">Ism (A-Z)</option>
              <option value="name_desc">Ism (Z-A)</option>
            </select>

            <button type="button" onClick={fetchBrokers} className="btn btn-primary">
              Yangilash
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Makler</th>
                  <th>Telefon</th>
                  <th>Email</th>
                  <th>Tasdiq holati</th>
                  <th>Akkaunt</th>
                  <th>Ro'yxatdan o'tgan</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrokers.map((b) => {
                  const bAvatar = b.avatar_url ? getFullImageUrl(b.avatar_url) : null;
                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: '#ECFDF5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#0F382A',
                          }}>
                            {bAvatar ? (
                              <img src={bAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              b.first_name[0]
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{b.first_name} {b.last_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>ID: #{b.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{b.phone}</td>
                      <td>{b.email || '-'}</td>
                      <td>
                        {b.is_verified ? (
                          <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                            ✓ Tasdiqlangan
                          </span>
                        ) : (
                          <span className="badge" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                            Kutilmoqda
                          </span>
                        )}
                      </td>
                      <td>
                        {b.is_active ? (
                          <span className="badge badge-active">Faol</span>
                        ) : (
                          <span className="badge badge-rented">Bloklangan</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                        {new Date(b.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleBrokerVerify(b)}
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            title="Tasdiq holatini o'zgartirish"
                          >
                            {b.is_verified ? "Bekor qilish" : "Tasdiqlash"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleUserBlock(b)}
                            className="btn btn-outline"
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              color: b.is_active ? '#DC2626' : '#059669',
                              borderColor: b.is_active ? '#FECACA' : '#A7F3D0',
                            }}
                          >
                            {b.is_active ? <><Lock size={12} /> Bloklash</> : <><Unlock size={12} /> Ochish</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Clients Tab */}
      {activeTab === 'clients' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Mijoz ismi yoki telefoni bo'yicha qidirish..."
                className="form-input"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
              <Search size={18} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <select
              className="form-input"
              style={{ width: '180px' }}
              value={clientFilterStatus}
              onChange={(e) => setClientFilterStatus(e.target.value as any)}
            >
              <option value="all">Barcha mijozlar</option>
              <option value="active">Faol</option>
              <option value="blocked">Bloklangan</option>
            </select>

            <select
              className="form-input"
              style={{ width: '170px' }}
              value={clientSort}
              onChange={(e) => setClientSort(e.target.value as any)}
            >
              <option value="newest">Eng yangi</option>
              <option value="oldest">Eng eski</option>
              <option value="name_asc">Ism (A-Z)</option>
              <option value="name_desc">Ism (Z-A)</option>
            </select>

            <button type="button" onClick={fetchClients} className="btn btn-primary">
              Yangilash
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Telefon</th>
                  <th>Holat</th>
                  <th>Ro'yxatdan o'tgan</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => {
                  const cAvatar = c.avatar_url ? getFullImageUrl(c.avatar_url) : null;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: '#ECFDF5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#0F382A',
                          }}>
                            {cAvatar ? (
                              <img src={cAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              c.first_name[0]
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{c.first_name} {c.last_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>ID: #{c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{c.phone}</td>
                      <td>
                        {c.is_active ? (
                          <span className="badge badge-active">Faol</span>
                        ) : (
                          <span className="badge badge-rented">Bloklangan</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                        {new Date(c.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleUserBlock(c)}
                          className="btn btn-outline"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            color: c.is_active ? '#DC2626' : '#059669',
                            borderColor: c.is_active ? '#FECACA' : '#A7F3D0',
                          }}
                        >
                          {c.is_active ? <><Lock size={12} /> Bloklash</> : <><Unlock size={12} /> Ochish</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Properties Tab (with Edit and Delete) */}
      {activeTab === 'properties' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <input
                type="text"
                placeholder="E'lon nomi, tuman yoki manzil bo'yicha qidirish..."
                className="form-input"
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
              />
              <Search size={18} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <select
              className="form-input"
              style={{ width: '180px' }}
              value={propertyStatusFilter}
              onChange={(e) => setPropertyStatusFilter(e.target.value)}
            >
              <option value="">Barcha holatlar</option>
              <option value="active">Faol (Active)</option>
              <option value="pending">Kutilmoqda (Pending)</option>
              <option value="rented">Ijaraga berilgan</option>
              <option value="hidden">Yashirilgan</option>
              <option value="rejected">Rad etilgan</option>
              <option value="archived">Arxivlangan</option>
            </select>

            <button type="button" onClick={fetchProperties} className="btn btn-primary">
              Yangilash
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rasm</th>
                  <th>Sarlavha</th>
                  <th>Muallif</th>
                  <th>Hudud</th>
                  <th>Narx</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((p) => {
                  const pThumb = p.images && p.images[0] ? getFullImageUrl(p.images[0].image_url) : null;
                  return (
                    <tr key={p.id}>
                      <td style={{ width: '70px' }}>
                        <div style={{ width: '56px', height: '42px', borderRadius: '6px', overflow: 'hidden', background: '#F3F4F6' }}>
                          {pThumb ? (
                            <img src={pThumb} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ fontSize: '9px', textAlign: 'center', lineHeight: '42px', color: '#9CA3AF' }}>Yo'q</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <a href={`/properties/${p.id}`} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: '#0F382A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {p.title} <ExternalLink size={12} color="#9CA3AF" />
                        </a>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {p.rooms} xona • {p.area_sqm} m² • ID: #{p.id}
                        </div>
                      </td>
                      <td>
                        {p.owner ? `${p.owner.first_name} ${p.owner.last_name}` : 'Makler'}
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{p.contact_phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{p.region}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{p.city_district}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {new Intl.NumberFormat('uz-UZ').format(p.price)} {p.currency}
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'active' ? 'badge-active' : p.status === 'rented' ? 'badge-rented' : 'badge-pending'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditProperty(p)}
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}
                            title="Tahrirlash"
                          >
                            <Edit3 size={13} /> Tahrirlash
                          </button>

                          {/* Approve / Reject */}
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

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteProperty(p.id)}
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#DC2626' }}
                            title="O'chirish"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Chats Monitoring Tab */}
      {activeTab === 'chats' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F382A' }}>
              Platformadagi barcha chatlar va yozishmalar
            </h3>
            <div style={{ width: '280px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Mijoz, makler yoki uy bo'yicha..."
                className="form-input"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
              />
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedConv ? '1fr 1.2fr' : '1fr', gap: '1.5rem' }}>
            {/* Conversation list */}
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mijoz</th>
                    <th>Makler</th>
                    <th>Uy e'loni</th>
                    <th>Oxirgi xabar</th>
                    <th>Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((c) => (
                    <tr
                      key={c.id}
                      style={{ background: selectedConv?.id === c.id ? '#F0FDF4' : 'transparent', cursor: 'pointer' }}
                      onClick={() => handleOpenConversation(c)}
                    >
                      <td>
                        <div style={{ fontWeight: 700 }}>{c.client?.first_name} {c.client?.last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{c.client?.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{c.broker?.first_name} {c.broker?.last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{c.broker?.phone}</div>
                      </td>
                      <td>
                        {c.property ? (
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F382A' }}>
                            {c.property.title}
                          </div>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>Umumiy suhbat</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.last_message?.text || 'Yangi suhbat'}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleOpenConversation(c); }}
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          <MessageSquare size={13} /> Ko'rish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Conversation Inspector */}
            {selectedConv && (
              <div style={{
                background: '#F9FAFB',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: '600px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 800, color: '#0F382A' }}>
                      {selectedConv.client?.first_name} ↔ {selectedConv.broker?.first_name}
                    </h4>
                    {selectedConv.property && (
                      <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>
                        Mavzu: {selectedConv.property.title}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedConv(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '6px' }}>
                  {loadingMessages ? (
                    <LoadingSpinner text="Xabarlar yuklanmoqda..." />
                  ) : convMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9CA3AF', margin: 'auto' }}>
                      Hozircha xabarlar yo'q
                    </div>
                  ) : (
                    convMessages.map((m) => {
                      const isClient = m.sender_id === selectedConv.client_id;
                      return (
                        <div
                          key={m.id}
                          style={{
                            alignSelf: isClient ? 'flex-start' : 'flex-end',
                            background: isClient ? '#FFFFFF' : '#ECFDF5',
                            border: `1px solid ${isClient ? '#E5E7EB' : '#A7F3D0'}`,
                            borderRadius: '14px',
                            padding: '0.75rem 1rem',
                            maxWidth: '80%',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isClient ? '#2563EB' : '#065F46', marginBottom: '2px' }}>
                            {isClient ? `Mijoz (${selectedConv.client?.first_name})` : `Makler (${selectedConv.broker?.first_name})`}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#111827', wordBreak: 'break-word' }}>
                            {m.text}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'right', marginTop: '4px' }}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Admin Profile Tab (Nasriddinova Dilfuza) */}
      {activeTab === 'profile' && currentAdmin && (
        <ProfileSettingsCard user={currentAdmin} onUserUpdated={updateUser} />
      )}

      {/* 7. Audit & User Activity Logs Tab */}
      {activeTab === 'audit' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={24} color="#10B981" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F382A' }}>
                  Foydalanuvchilar harakati va audit monitoringi
                </h3>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '4px' }}>
                Har qanday qurilmadan (mobil, kompyuter) ro'yxatdan o'tgan foydalanuvchilarning barcha harakatlari darhol qayd etiladi va faqat administrator o'chirguncha saqlanadi.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fetchAuditLogs()}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                disabled={auditLoading}
              >
                <RefreshCw size={16} className={auditLoading ? 'spin' : ''} />
                Yangilash
              </button>
              <button
                type="button"
                onClick={handleClearAllAuditLogs}
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                disabled={auditLoading || auditLogs.length === 0}
              >
                <Trash2 size={16} />
                Barchasini tozalash
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#F8FBF9', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Jami yozuvlar</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F382A', marginTop: '4px' }}>{auditLogs.length} ta</div>
            </div>
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#065F46', fontWeight: 600 }}>Mobil qurilmalar faolligi</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {auditLogs.filter((l) => (l.details || '').toLowerCase().includes('mobil') || (l.details || '').toLowerCase().includes('iphone') || (l.details || '').toLowerCase().includes('android')).length} ta
              </div>
            </div>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#1E40AF', fontWeight: 600 }}>Kompyuter / Desktop</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                {auditLogs.filter((l) => (l.details || '').toLowerCase().includes('kompyuter') || (l.details || '').toLowerCase().includes('windows') || (l.details || '').toLowerCase().includes('mac')).length} ta
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Foydalanuvchi, telefon, amal yoki qurilma bo'yicha qidirish..."
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
                value={auditSearch}
                onChange={(e) => {
                  setAuditSearch(e.target.value);
                  fetchAuditLogs(e.target.value, auditActionFilter);
                }}
              />
            </div>

            <select
              className="form-input"
              style={{ width: 'auto', minWidth: '200px', fontSize: '0.9rem' }}
              value={auditActionFilter}
              onChange={(e) => {
                setAuditActionFilter(e.target.value);
                fetchAuditLogs(auditSearch, e.target.value);
              }}
            >
              <option value="">Barcha harakat turlari</option>
              <option value="USER_LOGIN">Tizimga kirish (USER_LOGIN)</option>
              <option value="USER_REGISTER">Ro'yxatdan o'tish (USER_REGISTER)</option>
              <option value="PROPERTY_VIEW">E'lonni ko'rish (PROPERTY_VIEW)</option>
              <option value="FAVORITE_ADD">Sevimlilarga qo'shish (FAVORITE_ADD)</option>
              <option value="FAVORITE_REMOVE">Sevimlilardan o'chirish (FAVORITE_REMOVE)</option>
              <option value="CHAT_MESSAGE_SENT">Xabar yuborish (CHAT_MESSAGE_SENT)</option>
              <option value="CHAT_START">Suhbat boshlash (CHAT_START)</option>
              <option value="PROPERTY_CREATE">Yangi uy qo'shish (PROPERTY_CREATE)</option>
              <option value="ADMIN_UPDATE_USER">Admin o'zgarishi (ADMIN_UPDATE_USER)</option>
            </select>
          </div>

          {/* Table */}
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '130px' }}>Vaqt</th>
                  <th style={{ minWidth: '180px' }}>Foydalanuvchi</th>
                  <th style={{ minWidth: '150px' }}>Harakat (Amal)</th>
                  <th style={{ minWidth: '200px' }}>Qurilma / IP</th>
                  <th>Tafsilotlar</th>
                  <th style={{ textAlign: 'center', minWidth: '90px' }}>Admin amali</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#9CA3AF' }}>
                      Hech qanday harakat qaydnomasi topilmadi.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => {
                    const isMobileDevice =
                      (log.details || '').toLowerCase().includes('mobil') ||
                      (log.details || '').toLowerCase().includes('iphone') ||
                      (log.details || '').toLowerCase().includes('android');

                    let badgeColor = '#0F382A';
                    let badgeBg = '#ECFDF5';
                    if (log.action.includes('LOGIN') || log.action.includes('REGISTER')) {
                      badgeColor = '#059669';
                      badgeBg = '#ECFDF5';
                    } else if (log.action.includes('VIEW')) {
                      badgeColor = '#2563EB';
                      badgeBg = '#EFF6FF';
                    } else if (log.action.includes('FAVORITE')) {
                      badgeColor = '#DC2626';
                      badgeBg = '#FEF2F2';
                    } else if (log.action.includes('CHAT')) {
                      badgeColor = '#7C3AED';
                      badgeBg = '#F5F3FF';
                    } else if (log.action.includes('PROPERTY')) {
                      badgeColor = '#D97706';
                      badgeBg = '#FFFBEB';
                    }

                    return (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.8rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString('uz-UZ')}
                        </td>
                        <td>
                          {log.user ? (
                            <div>
                              <div style={{ fontWeight: 700, color: '#111827' }}>
                                {log.user.first_name} {log.user.last_name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                                {log.user.phone} • <span style={{ textTransform: 'capitalize', color: '#10B981', fontWeight: 600 }}>{log.user.role}</span>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Tizim / Mehmon</span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: badgeColor,
                              backgroundColor: badgeBg,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                            {isMobileDevice ? (
                              <Smartphone size={16} color="#10B981" />
                            ) : (
                              <Laptop size={16} color="#3B82F6" />
                            )}
                            <span style={{ color: '#374151', fontWeight: 500 }}>
                              {log.details && log.details.includes('device')
                                ? (() => {
                                    try {
                                      const p = JSON.parse(log.details);
                                      return p.device || 'Noma\'lum';
                                    } catch {
                                      return log.ip_address || 'Lokal';
                                    }
                                  })()
                                : log.ip_address || '127.0.0.1'}
                            </span>
                          </div>
                          {log.ip_address && (
                            <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '2px' }}>
                              IP: {log.ip_address}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.82rem', maxWidth: '320px', color: '#4B5563' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.details || (log.entity_id ? `Ob'ekt ID: #${log.entity_id}` : '-')}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteAuditLog(log.id)}
                            disabled={deletingLogId === log.id}
                            className="btn btn-danger"
                            title="Yozuvni o'chirish (Faqat admin huquqi)"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                          >
                            <Trash2 size={14} />
                            <span>O'chirish</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Property Modal for Admin */}
      {editingProp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem',
          backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F382A' }}>
                E'lonni tahrirlash (Admin) #{editingProp.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProp(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProperty}>
              <div className="form-group">
                <label className="form-label">Sarlavha:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Narxi:</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Valyuta:</label>
                  <select
                    className="form-input"
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                  >
                    <option value="UZS">UZS (So'm)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Uy turi:</label>
                  <select
                    className="form-input"
                    value={editPropertyType}
                    onChange={(e) => setEditPropertyType(e.target.value)}
                  >
                    <option value="apartment">Kvartira</option>
                    <option value="house">Hovli</option>
                    <option value="room">Xona</option>
                    <option value="studio">Studio</option>
                    <option value="commercial">Tijorat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ijara turi:</label>
                  <select
                    className="form-input"
                    value={editRentType}
                    onChange={(e) => setEditRentType(e.target.value)}
                  >
                    <option value="monthly">Oylik</option>
                    <option value="daily">Kunlik</option>
                    <option value="weekly">Haftalik</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Viloyat:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tuman / Shahar:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editCityDistrict}
                    onChange={(e) => setEditCityDistrict(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Aniq manzil:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Xonalar soni:</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editRooms}
                    onChange={(e) => setEditRooms(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Maydoni (m²):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editAreaSqm}
                    onChange={(e) => setEditAreaSqm(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Holati (Status):</label>
                  <select
                    className="form-input"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="active">Faol (Active)</option>
                    <option value="pending">Kutilmoqda</option>
                    <option value="rented">Ijaraga berilgan</option>
                    <option value="hidden">Yashirilgan</option>
                    <option value="rejected">Rad etilgan</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tavsif (Tafsilotlar):</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingProp(null)}
                  className="btn btn-outline"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingProp}
                >
                  {savingProp ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
                </button>
              </div>
            </form>
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
