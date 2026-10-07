import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Building, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Property } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/LoadingSkeleton';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [region, setRegion] = useState('');
  const [rentType, setRentType] = useState('');
  const [rooms, setRooms] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.getProperties({ page_size: 8, sort_by: 'newest' });
        setProperties(res.items);
      } catch (err) {
        console.error('Failed to load latest properties', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (rentType) params.append('rent_type', rentType);
    if (rooms) params.append('rooms', rooms);
    if (maxPrice) params.append('price_max', maxPrice);
    navigate(`/catalog?${params.toString()}`);
  };

  const popularRegions = [
    { name: 'Toshkent shahri', count: "120+ e'lon", img: 'https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=600&q=80' },
    { name: 'Samarqand viloyati', count: "45+ e'lon", img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80' },
    { name: 'Buxoro viloyati', count: "30+ e'lon", img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
    { name: 'Farg\'ona viloyati', count: "25+ e'lon", img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34D399',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
            }}>
              <Sparkles size={16} /> O'zbekistonning №1 ijara platformasi
            </div>

            <h1 className="hero-title" id="home-main-heading">
              Orzuingizdagi uyni osongina toping va ijaraga oling
            </h1>
            <p className="hero-subtitle">
              Toshkent, Samarqand, Buxoro va butun O'zbekiston bo'yicha ishonchli xonadonlar, hovlilar va kunlik ijaralar yagona joyda.
            </p>
          </div>

          {/* Quick Search Form */}
          <form className="search-card" onSubmit={handleSearchSubmit} id="hero-search-form">
            <div className="search-field">
              <label htmlFor="search-region">Viloyat / Shahar</label>
              <select
                id="search-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">Barcha hududlar</option>
                <option value="Toshkent shahri">Toshkent shahri</option>
                <option value="Toshkent viloyati">Toshkent viloyati</option>
                <option value="Samarqand viloyati">Samarqand viloyati</option>
                <option value="Buxoro viloyati">Buxoro viloyati</option>
                <option value="Andijon viloyati">Andijon viloyati</option>
                <option value="Farg'ona viloyati">Farg'ona viloyati</option>
                <option value="Namangan viloyati">Namangan viloyati</option>
                <option value="Xorazm viloyati">Xorazm viloyati</option>
                <option value="Qashqadaryo viloyati">Qashqadaryo viloyati</option>
                <option value="Surxondaryo viloyati">Surxondaryo viloyati</option>
                <option value="Navoiy viloyati">Navoiy viloyati</option>
                <option value="Jizzax viloyati">Jizzax viloyati</option>
                <option value="Sirdaryo viloyati">Sirdaryo viloyati</option>
                <option value="Qoraqalpog'iston Respublikasi">Qoraqalpog'iston</option>
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="search-rent-type">Ijara turi</label>
              <select
                id="search-rent-type"
                value={rentType}
                onChange={(e) => setRentType(e.target.value)}
              >
                <option value="">Hammasi</option>
                <option value="monthly">Oylik ijara</option>
                <option value="daily">Kunlik ijara</option>
                <option value="weekly">Haftalik ijara</option>
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="search-rooms">Xonalar soni</label>
              <select
                id="search-rooms"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
              >
                <option value="">Istalgan</option>
                <option value="1">1 xona</option>
                <option value="2">2 xona</option>
                <option value="3">3 xona</option>
                <option value="4">4+ xona</option>
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="search-price">Maks. Narx (so'm)</label>
              <input
                type="number"
                id="search-price"
                placeholder="Masalan: 5 000 000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', marginTop: '1.25rem' }}
                id="btn-hero-search-submit"
              >
                <Search size={18} />
                <span>Qidirish</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Popular Regions */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F382A' }}>
              Ommabop hududlar bo'yicha uylar
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
              O'zingizga kerakli viloyatni tanlang va eng sara takliflarni ko'ring
            </p>
          </div>
          <Link to="/catalog" style={{ color: '#10B981', fontWeight: 700, fontSize: '0.95rem' }}>
            Barcha hududlar →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {popularRegions.map((reg) => (
            <Link
              key={reg.name}
              to={`/catalog?region=${encodeURIComponent(reg.name)}`}
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                height: '180px',
                display: 'block',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <img
                src={reg.img}
                alt={reg.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 41, 30, 0.85) 0%, rgba(0,0,0,0.1) 70%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.25rem',
                  color: '#FFFFFF',
                }}
              >
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{reg.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#A7F3D0', fontWeight: 600 }}>{reg.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Listings */}
      <section className="container" style={{ marginTop: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F382A' }}>
              So'nggi qo'shilgan e'lonlar
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
              Haqiqiy tasdiqlangan maklerlar va uy egalari tomonidan berilgan yangi takliflar
            </p>
          </div>
          <Link to="/catalog" className="btn btn-outline" id="btn-see-all-properties">
            Barcha e'lonlar ({properties.length > 0 ? `${properties.length}+` : ''})
          </Link>
        </div>

        {loading ? (
          <div className="grid-cards">
            {[1, 2, 3, 4].map((n) => (
              <PropertyCardSkeleton key={n} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <Building size={48} color="#9CA3AF" />
            <h3 style={{ marginTop: '1rem', color: '#4B5563' }}>Hozircha e'lonlar mavjud emas</h3>
          </div>
        ) : (
          <div className="grid-cards">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* Why UyTop features */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', marginTop: '6rem', padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0F382A' }}>
              Nima uchun UyTop platformasi?
            </h2>
            <p style={{ color: '#6B7280', marginTop: '0.5rem', fontSize: '1.05rem' }}>
              Biz O'zbekiston uy-ijara bozoridagi noaniqlik va aldovlarni bartaraf etamiz.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', background: '#F8FBF9', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={28} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F382A', marginBottom: '0.5rem' }}>
                Haqiqiy va tekshirilgan e'lonlar
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Har bir e'lon va makler ma'lumotlari admin moderatsiyasidan o'tadi. Soxta va eskirgan e'lonlar filtrlanadi.
              </p>
            </div>

            <div style={{ padding: '2rem', background: '#F8FBF9', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <MapPin size={28} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F382A', marginBottom: '0.5rem' }}>
                Xaritada aniq geolokatsiya
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Uylarning aniq koordinatalarini O'zbekiston xaritasida ko'ring, atrofingizdagi eng yaqin uylarni masofa bo'yicha toping.
              </p>
            </div>

            <div style={{ padding: '2rem', background: '#F8FBF9', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Zap size={28} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F382A', marginBottom: '0.5rem' }}>
                Bevosita va tezkor chat
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Platforma ichidagi xabarlar tizimi orqali uy egasi yoki makler bilan tez va xavfsiz suhbatlashing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA For Landlords / Brokers */}
      <section className="container" style={{ marginTop: '5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0A291E 0%, #164E3A 100%)',
          borderRadius: '24px',
          padding: '4rem 3rem',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          boxShadow: 'var(--shadow-xl)',
        }}>
          <div style={{ maxWidth: '580px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
              Uyingizni tez va ishonchli ijaraga bermoqchimisiz?
            </h2>
            <p style={{ color: '#D1D5DB', fontSize: '1.05rem' }}>
              Makler yoki uy egasi sifatida ro'yxatdan o'ting, rasmlar va qulayliklar bilan bepul e'lon joylashtiring.
            </p>
          </div>
          <div>
            <Link to="/register" className="btn btn-accent" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }} id="btn-cta-post-ad">
              + E'lon joylashtirishni boshlash
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
