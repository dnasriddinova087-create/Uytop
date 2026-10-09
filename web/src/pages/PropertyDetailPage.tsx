import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Heart, Share2, Phone, MessageSquare, AlertCircle,
  Building, CheckCircle2, ChevronLeft, ChevronRight, Layers, Maximize2
} from 'lucide-react';
import { Property } from '../types';
import { api, getFullImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AmenityBadge, ALL_AMENITIES } from '../components/AmenityBadge';
import { InteractiveMap } from '../components/InteractiveMap';
import { LoadingSpinner } from '../components/LoadingSkeleton';
import { trackUserActivity } from '../services/activityTracker';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Soxta e\'lon / Mavjud emas');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Chat initiation
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProp = async () => {
      try {
        const data = await api.getProperty(Number(id));
        setProperty(data);
        setIsFav(data.is_favorited || false);
        trackUserActivity('PROPERTY_VIEW', 'property', data.id, {
          title: data.title,
          price: data.price,
          region: data.region,
        });
      } catch (err) {
        console.error('Failed to load property', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProp();
  }, [id]);

  if (loading) return <LoadingSpinner text="Uy ma'lumotlari yuklanmoqda..." />;
  if (!property) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Uy e'loni topilmadi</h2>
        <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images.map((img) => getFullImageUrl(img.image_url))
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'];

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isFav) {
        await api.removeFavorite(property.id);
        setIsFav(false);
      } else {
        await api.addFavorite(property.id);
        setIsFav(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.id === property.owner_id) {
      alert("Bu sizning o'z e'loningiz!");
      return;
    }
    setChatLoading(true);
    try {
      const conv = await api.startConversation(
        property.owner_id,
        property.id,
        `Assalomu alaykum! "${property.title}" e'loningiz bo'yicha bog'lanmoqdaman.`
      );
      navigate(`/chat?conversationId=${conv.id}`);
    } catch (err: any) {
      alert('Suhbatni boshlab bo\'lmadi: ' + err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.createReport(property.id, reportReason, reportDetails);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert('Shikoyat yuborishda xatolik: ' + err.message);
    }
  };

  const formatPrice = (val: number) => new Intl.NumberFormat('uz-UZ').format(val);

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '5rem' }}>
      {/* Breadcrumb / Back Link */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 600, fontSize: '0.9rem' }}>
          <ChevronLeft size={16} /> Katalogga qaytish
        </Link>
      </div>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
            {property.status === 'rented' ? (
              <span className="badge badge-rented">Ijaraga berildi</span>
            ) : (
              <span className="badge badge-active">Faol</span>
            )}
            <span className="badge badge-rent-type">
              {property.rent_type === 'monthly' ? 'Oylik ijara' : property.rent_type === 'daily' ? 'Kunlik ijara' : 'Haftalik ijara'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F382A', lineHeight: 1.25 }} id="property-detail-title">
            {property.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            <MapPin size={18} color="#10B981" />
            <span>{property.region}, {property.city_district}, {property.address}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`btn ${isFav ? 'btn-danger' : 'btn-outline'}`}
            id="btn-detail-fav"
          >
            <Heart size={18} fill={isFav ? '#DC2626' : 'none'} />
            <span>{isFav ? 'Saqlangan' : 'Saqlash'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert("E'lon havolasi nusxalandi!");
            }}
            className="btn btn-outline"
            id="btn-detail-share"
          >
            <Share2 size={18} /> Ulashish
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          position: 'relative',
          height: '480px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#111827',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <img
            src={images[activeImageIndex]}
            alt={property.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  border: activeImageIndex === idx ? '3px solid #10B981' : '3px solid transparent',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  width: '90px',
                  height: '65px',
                  padding: 0,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Details Left, Landlord Sidebar Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div>
          {/* Key Overview Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            padding: '1.5rem',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            marginBottom: '2rem',
          }}>
            <div>
              <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 600 }}>Xonalar soni</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A' }}>{property.rooms} xona</div>
            </div>
            <div>
              <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 600 }}>Umumiy maydoni</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A' }}>{property.area_sqm} m²</div>
            </div>
            <div>
              <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 600 }}>Qavati</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A' }}>
                {property.floor || 1} {property.total_floors ? `/ ${property.total_floors}` : ''}
              </div>
            </div>
            <div>
              <div style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 600 }}>Depozit</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A' }}>
                {property.deposit > 0 ? `${formatPrice(property.deposit)} so'm` : "Yo'q"}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '1.75rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F382A', marginBottom: '1rem' }}>
              Uy haqida batafsil ma'lumot
            </h2>
            <p style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {property.description || "Tavsif kiritilmagan."}
            </p>
            {property.utilities_details && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#F8FBF9', borderRadius: '10px', fontSize: '0.9rem', color: '#065F46' }}>
                💡 <strong>Kommunal xizmatlar:</strong> {property.utilities_details}
              </div>
            )}
          </div>

          {/* Amenities Section (30 tri-state amenities) */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '1.75rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F382A', marginBottom: '0.5rem' }}>
              Uy sharoitlari va qulayliklar
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Yashil: Mavjud | Qizil: Mavjud emas | Kulrang: Ma'lumot kiritilmagan
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              {ALL_AMENITIES.map((meta) => {
                const status = property.amenity ? (property.amenity as any)[meta.key] || 'unknown' : 'unknown';
                return (
                  <AmenityBadge key={meta.key} amenityKey={meta.key} status={status} />
                );
              })}
            </div>

            {property.amenity?.custom_amenities && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F382A', marginBottom: '0.35rem' }}>
                  Boshqa qulayliklar:
                </h4>
                <p style={{ color: '#4B5563', fontSize: '0.9rem' }}>{property.amenity.custom_amenities}</p>
              </div>
            )}
          </div>

          {/* Location Map */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F382A', marginBottom: '1rem' }}>
              Xaritadagi joylashuvi
            </h2>
            <div style={{ height: '360px', borderRadius: '16px', overflow: 'hidden' }}>
              <InteractiveMap
                properties={[property]}
                center={[property.latitude, property.longitude]}
                zoom={14}
                height="100%"
              />
            </div>
            <div style={{ marginTop: '0.75rem', color: '#6B7280', fontSize: '0.85rem' }}>
              📍 {property.region}, {property.city_district}, {property.address}
            </div>
          </div>
        </div>

        {/* Right Column: Price & Landlord Contact Sidebar */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Ijara narxi:</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F382A' }}>
                {formatPrice(property.price)} <span style={{ fontSize: '1rem', fontWeight: 600 }}>{property.currency}</span>
              </div>
              <div style={{ color: '#10B981', fontWeight: 600, fontSize: '0.9rem' }}>
                {property.rent_type === 'monthly' ? 'Har oy uchun to\'lov' : property.rent_type === 'daily' ? 'Kunlik to\'lov' : 'Haftalik to\'lov'}
              </div>
            </div>

            {/* Owner Info Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#ECFDF5',
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                flexShrink: 0,
              }}>
                {property.owner?.avatar_url ? (
                  <img src={getFullImageUrl(property.owner.avatar_url)} alt="owner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  property.owner?.first_name ? property.owner.first_name[0] : 'U'
                )}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>
                  {property.owner?.first_name} {property.owner?.last_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> {property.owner?.role === 'makler' ? 'Tasdiqlangan makler' : 'Uy egasi'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Phone reveal button */}
              {showPhone ? (
                <a
                  href={`tel:${property.contact_phone || property.owner?.phone}`}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '48px', fontSize: '1.05rem' }}
                  id="link-call-broker"
                >
                  <Phone size={18} />
                  <span>{property.contact_phone || property.owner?.phone}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPhone(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '48px', fontSize: '1rem' }}
                  id="btn-show-phone"
                >
                  <Phone size={18} />
                  <span>Telefon raqamini ko'rish</span>
                </button>
              )}

              {/* Chat initiation */}
              <button
                type="button"
                onClick={handleStartChat}
                disabled={chatLoading}
                className="btn btn-accent"
                style={{ width: '100%', height: '48px', fontSize: '1rem' }}
                id="btn-start-chat-detail"
              >
                <MessageSquare size={18} />
                <span>{chatLoading ? 'Boshlanmoqda...' : 'Xabar yozish (Chat)'}</span>
              </button>
            </div>

            {/* Report listing button */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                id="btn-report-listing"
              >
                <AlertCircle size={14} /> E'lon bo'yicha shikoyat yuborish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Complaint Modal */}
      {showReportModal && (
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
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '1rem' }}>
              E'lon haqida shikoyat yuborish
            </h3>
            {reportSuccess ? (
              <div style={{ padding: '1.5rem', background: '#ECFDF5', color: '#065F46', borderRadius: '10px', textAlign: 'center', fontWeight: 700 }}>
                Shikoyatingiz qabul qilindi. Moderatsiya ko'rib chiqadi.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="form-group">
                  <label className="form-label">Sabab:</label>
                  <select
                    className="form-input"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="Soxta e'lon / Mavjud emas">Soxta e'lon / Mavjud emas</option>
                    <option value="Narx noto'g'ri ko'rsatilgan">Narx noto'g'ri ko'rsatilgan</option>
                    <option value="Rasmlar mos kelmaydi">Rasmlar mos kelmaydi</option>
                    <option value="Bog'lanib bo'lmadi">Bog'lanib bo'lmadi</option>
                    <option value="Boshqa sabab">Boshqa sabab</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Qo'shimcha izoh (ixtiyoriy):</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Batafsil ma'lumot yozing..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowReportModal(false)} className="btn btn-outline">
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Yuborish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
