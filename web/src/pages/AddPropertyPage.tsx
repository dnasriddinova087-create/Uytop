import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Building, Sparkles, Check, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { LocationItem, AmenityState } from '../types';
import { ALL_AMENITIES } from '../components/AmenityBadge';
import { InteractiveMap } from '../components/InteractiveMap';
import { useAuth } from '../context/AuthContext';

export const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [rentType, setRentType] = useState('monthly');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('UZS');
  const [deposit, setDeposit] = useState('0');
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [utilitiesDetails, setUtilitiesDetails] = useState('');

  // Location
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [region, setRegion] = useState('Toshkent shahri');
  const [cityDistrict, setCityDistrict] = useState('');
  const [mahalla, setMahalla] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(41.2995);
  const [longitude, setLongitude] = useState(69.2401);

  // Specs
  const [rooms, setRooms] = useState('2');
  const [areaSqm, setAreaSqm] = useState('60');
  const [floor, setFloor] = useState('3');
  const [totalFloors, setTotalFloors] = useState('9');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+998');
  const [showPhone, setShowPhone] = useState(true);

  // 30 Amenities (defaults to 'unknown')
  const [amenities, setAmenities] = useState<Record<string, AmenityState>>(() => {
    const initial: Record<string, AmenityState> = {};
    ALL_AMENITIES.forEach((a) => {
      initial[a.key] = 'unknown';
    });
    return initial;
  });
  const [customAmenities, setCustomAmenities] = useState('');

  // Images
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getLocations().then((locs) => {
      setLocations(locs);
      if (locs.length > 0 && !cityDistrict) {
        const found = locs.find((l) => l.region === 'Toshkent shahri');
        if (found && found.districts.length > 0) {
          setCityDistrict(found.districts[0]);
        }
      }
    }).catch(console.error);
  }, []);

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    const loc = locations.find((l) => l.region === newRegion);
    if (loc) {
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      setCityDistrict(loc.districts[0] || '');
    }
  };

  const handleAmenityToggle = (key: string, state: AmenityState) => {
    setAmenities((prev) => ({ ...prev, [key]: state }));
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('E\'lon sarlavhasini kiriting');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Ijara narxini to\'g\'ri kiriting');
      return;
    }
    if (!address.trim()) {
      setError('Aniq manzilni kiriting');
      return;
    }

    setLoading(true);
    try {
      const propertyPayload = {
        title: title.trim(),
        description: description.trim() || null,
        property_type: propertyType,
        rent_type: rentType,
        price: Number(price),
        currency,
        deposit: Number(deposit) || 0,
        utilities_included: utilitiesIncluded,
        utilities_details: utilitiesDetails.trim() || null,
        region,
        city_district: cityDistrict,
        mahalla: mahalla.trim() || null,
        address: address.trim(),
        latitude,
        longitude,
        rooms: Number(rooms),
        area_sqm: Number(areaSqm),
        floor: Number(floor) || null,
        total_floors: Number(totalFloors) || null,
        contact_phone: contactPhone.trim(),
        show_phone: showPhone,
        amenities: {
          ...amenities,
          custom_amenities: customAmenities.trim() || null,
        },
      };

      const created = await api.createProperty(propertyPayload);

      // Upload photos if any
      if (selectedFiles.length > 0) {
        await api.uploadImages(created.id, selectedFiles);
      }

      navigate(`/properties/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'E\'lon yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const currentDistricts = locations.find((l) => l.region === region)?.districts || [];

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '5rem', maxWidth: '960px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F382A' }} id="add-property-title">
          Yangi uy e'lonini qo'shish
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
          Uyingiz haqidagi barcha ma'lumotlarni to'ldiring. To'liq va sifatli ma'lumotlar ko'proq mijozlarni jalb qiladi.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#DC2626',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} id="add-property-form">
        {/* Step 1: Basic Information */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={20} color="#10B981" /> 1. Asosiy ma'lumotlar va narx
          </h2>

          <div className="form-group">
            <label className="form-label" htmlFor="prop-title">E'lon sarlavhasi:</label>
            <input
              type="text"
              id="prop-title"
              className="form-input"
              placeholder="Masalan: Chilonzor 9-mavzeda yangi ta'mirlangan 3 xonali kvartira"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Uy turi:</label>
              <select className="form-input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                <option value="apartment">Kvartira</option>
                <option value="house">Hovli uy</option>
                <option value="room">Xona</option>
                <option value="studio">Studio</option>
                <option value="commercial">Tijorat binosi</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ijara turi:</label>
              <select className="form-input" value={rentType} onChange={(e) => setRentType(e.target.value)}>
                <option value="monthly">Oylik</option>
                <option value="daily">Kunlik</option>
                <option value="weekly">Haftalik</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Narx ({currency}):</label>
              <input
                type="number"
                className="form-input"
                placeholder="Masalan: 5000000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Depozit ({currency}):</label>
              <input
                type="number"
                className="form-input"
                placeholder="0 agar yo'q bo'lsa"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '1rem 0' }}>
            <input
              type="checkbox"
              id="utilities-inc"
              checked={utilitiesIncluded}
              onChange={(e) => setUtilitiesIncluded(e.target.checked)}
            />
            <label htmlFor="utilities-inc" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
              Kommunal xizmatlar ijara narxiga kiritilgan
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif (izoh):</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Uy haqida to'liqroq yozing: qaysi transport vositalari yaqin, qo'shnilar, qulayliklar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Step 2: Location & Map Picker */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#10B981" /> 2. Joylashuv va xarita koordinatalari
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Viloyat:</label>
              <select className="form-input" value={region} onChange={(e) => handleRegionChange(e.target.value)}>
                {locations.map((l) => (
                  <option key={l.region} value={l.region}>{l.region}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tuman / Shahar:</label>
              <select className="form-input" value={cityDistrict} onChange={(e) => setCityDistrict(e.target.value)}>
                {currentDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mahalla:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Masalan: Bo'ston MFY"
                value={mahalla}
                onChange={(e) => setMahalla(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Aniq ko'cha va uy raqami:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masalan: Navoiy ko'chasi, 24-uy"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Xaritada aniq joylashuvni belgilang (xaritani bosing):
            </label>
            <div style={{ height: '350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
              <InteractiveMap
                center={[latitude, longitude]}
                zoom={13}
                height="100%"
                isPicker={true}
                selectedLocation={[latitude, longitude]}
                onLocationSelect={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '6px' }}>
              Kenglik (Lat): {latitude.toFixed(5)}, Uzunlik (Lng): {longitude.toFixed(5)}
            </div>
          </div>
        </div>

        {/* Step 3: Layout & Contact Specs */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '1.5rem' }}>
            3. Xonalar va bino ko'rsatkichlari
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Xonalar soni:</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maydoni (m²):</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qavat:</label>
              <input
                type="number"
                className="form-input"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Binodagi jami qavatlar:</label>
              <input
                type="number"
                className="form-input"
                value={totalFloors}
                onChange={(e) => setTotalFloors(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Aloqa telefoni:</label>
            <input
              type="tel"
              className="form-input"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Step 4: 30 Tri-State Amenities */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '0.5rem' }}>
            4. Sharoitlar va qulayliklar (30 ta sharoit)
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Har bir qulaylik uchun holatni belgilang: <strong>Mavjud</strong>, <strong>Mavjud emas</strong> yoki <strong>Ma'lumot yo'q</strong>.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {ALL_AMENITIES.map((meta) => {
              const currentVal = amenities[meta.key] || 'unknown';
              return (
                <div
                  key={meta.key}
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    background: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
                    <span>{meta.name}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleAmenityToggle(meta.key, 'available')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: currentVal === 'available' ? '#10B981' : '#E5E7EB',
                        background: currentVal === 'available' ? '#ECFDF5' : '#FFFFFF',
                        color: currentVal === 'available' ? '#065F46' : '#6B7280',
                        fontWeight: 700,
                      }}
                    >
                      Bor
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAmenityToggle(meta.key, 'unavailable')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: currentVal === 'unavailable' ? '#EF4444' : '#E5E7EB',
                        background: currentVal === 'unavailable' ? '#FEF2F2' : '#FFFFFF',
                        color: currentVal === 'unavailable' ? '#991B1B' : '#6B7280',
                        fontWeight: 700,
                      }}
                    >
                      Yo'q
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAmenityToggle(meta.key, 'unknown')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: currentVal === 'unknown' ? '#9CA3AF' : '#E5E7EB',
                        background: currentVal === 'unknown' ? '#E5E7EB' : '#FFFFFF',
                        color: '#4B5563',
                        fontWeight: 600,
                      }}
                    >
                      ?
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Boshqa qulayliklar (erkin matn):</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masalan: Yozgi basseyn, jakuzi, video-domofon..."
              value={customAmenities}
              onChange={(e) => setCustomAmenities(e.target.value)}
            />
          </div>
        </div>

        {/* Step 5: Photo Uploads */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '2rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={20} color="#10B981" /> 5. Rasmlar yuklash
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            JPEG, PNG yoki WebP formatida kamida 1 ta rasm yuklang (maksimal hajmi 10MB).
          </p>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem',
              border: '2px dashed #D1D5DB',
              borderRadius: '16px',
              cursor: 'pointer',
              background: '#F9FAFB',
              transition: 'all 0.2s',
            }}
          >
            <Upload size={36} color="#059669" />
            <div style={{ fontWeight: 700, color: '#0F382A', marginTop: '0.75rem' }}>
              Rasmlarni tanlash uchun bosing
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '4px' }}>
              Telefonda galereyadan yoki kompyuterdan tanlang
            </div>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFilesChange}
              style={{ display: 'none' }}
              id="file-upload-input"
            />
          </label>

          {/* Previews */}
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: '100px', height: '80px', borderRadius: '10px', overflow: 'hidden' }}>
                  <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-outline"
            style={{ padding: '0.85rem 1.75rem' }}
          >
            Bekor qilish
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem' }}
            disabled={loading}
            id="btn-submit-add-property"
          >
            {loading ? 'Saqlanmoqda...' : 'E\'lonni chop etish'}
          </button>
        </div>
      </form>
    </div>
  );
};
