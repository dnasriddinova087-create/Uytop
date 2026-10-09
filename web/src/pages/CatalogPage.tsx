import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Map, Grid, RefreshCw, X, Search, Wifi, Shirt, Wind, Building2, Users } from 'lucide-react';
import { Property, LocationItem } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { PropertyCardSkeleton } from '../components/LoadingSkeleton';
import { trackUserActivity } from '../services/activityTracker';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [cityDistrict, setCityDistrict] = useState(searchParams.get('city_district') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
  const [rentType, setRentType] = useState(searchParams.get('rent_type') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('price_min') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') || '');
  const [rooms, setRooms] = useState(searchParams.get('rooms') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');

  // Amenity filters
  const [wifi, setWifi] = useState(searchParams.get('wifi') || '');
  const [washingMachine, setWashingMachine] = useState(searchParams.get('washing_machine') || '');
  const [airConditioning, setAirConditioning] = useState(searchParams.get('air_conditioning') || '');
  const [elevator, setElevator] = useState(searchParams.get('elevator') || '');
  const [familyFriendly, setFamilyFriendly] = useState(searchParams.get('family_friendly') || '');

  // View mode: 'grid' or 'map'
  const [viewMode, setViewMode] = useState<'grid' | 'map'>((searchParams.get('view') as any) || 'grid');

  // Properties & locations data
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Fetch available locations for select dropdowns
  useEffect(() => {
    api.getLocations().then(setLocations).catch(console.error);
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: 1,
        page_size: 30,
        sort_by: sortBy,
      };

      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (region) params.region = region;
      if (cityDistrict) params.city_district = cityDistrict;
      if (propertyType) params.property_type = propertyType;
      if (rentType) params.rent_type = rentType;
      if (priceMin) params.price_min = priceMin;
      if (priceMax) params.price_max = priceMax;
      if (rooms) params.rooms = rooms;

      if (wifi) params.wifi = wifi;
      if (washingMachine) params.washing_machine = washingMachine;
      if (airConditioning) params.air_conditioning = airConditioning;
      if (elevator) params.elevator = elevator;
      if (familyFriendly) params.family_friendly = familyFriendly;

      const res = await api.getProperties(params);
      setProperties(res.items);
      setTotal(res.total);
      if (searchQuery || region || propertyType || rentType || rooms) {
        trackUserActivity('CATALOG_SEARCH', 'catalog', undefined, {
          q: searchQuery || undefined,
          region: region || undefined,
          type: propertyType || undefined,
          rent: rentType || undefined,
          rooms: rooms || undefined,
        });
      }
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchQuery, region, cityDistrict, propertyType, rentType, priceMin, priceMax, rooms, sortBy, wifi, washingMachine, airConditioning, elevator, familyFriendly]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setRegion('');
    setCityDistrict('');
    setPropertyType('');
    setRentType('');
    setPriceMin('');
    setPriceMax('');
    setRooms('');
    setSortBy('newest');
    setWifi('');
    setWashingMachine('');
    setAirConditioning('');
    setElevator('');
    setFamilyFriendly('');
    setSearchParams({});
  };

  const selectedRegionDistricts = locations.find((l) => l.region === region)?.districts || [];

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      {/* Page Title & View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F382A' }} id="catalog-heading">
            Uylar katalogi
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
            {loading ? 'Qidirilmoqda...' : `${total} ta mos keluvchi ijara taklifi topildi`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '3px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{
                background: viewMode === 'grid' ? '#0F382A' : 'none',
                color: viewMode === 'grid' ? '#FFFFFF' : '#4B5563',
                padding: '6px 14px',
                fontSize: '0.85rem',
              }}
              onClick={() => setViewMode('grid')}
              id="view-toggle-grid"
            >
              <Grid size={16} /> Grid
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{
                background: viewMode === 'map' ? '#0F382A' : 'none',
                color: viewMode === 'map' ? '#FFFFFF' : '#4B5563',
                padding: '6px 14px',
                fontSize: '0.85rem',
              }}
              onClick={() => setViewMode('map')}
              id="view-toggle-map"
            >
              <Map size={16} /> Xarita
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleClearFilters}
            title="Filtrlarni tozalash"
            id="btn-clear-filters"
          >
            <RefreshCw size={16} /> Tozalash
          </button>
        </div>
      </div>

      {/* Universal Search Bar */}
      <div style={{
        marginBottom: '1.5rem',
        position: 'relative',
        boxShadow: 'var(--shadow-sm)',
        borderRadius: '16px',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        padding: '6px 16px',
      }}>
        <Search size={22} color="#10B981" style={{ marginRight: '12px', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Hudud, shahar, tuman, mahalla yoki manzil bo'yicha qidirish (masalan: Chilonzor, Yunusobod, Samarqand...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            height: '44px',
            fontSize: '1rem',
            background: 'transparent',
            color: '#111827',
          }}
          id="catalog-search-query-input"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}
            title="Qidiruvni tozalash"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Primary Filter Bar */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
      }}>
        {/* Region */}
        <div className="search-field">
          <label>Viloyat</label>
          <select value={region} onChange={(e) => { setRegion(e.target.value); setCityDistrict(''); }} id="filter-region">
            <option value="">Barcha viloyatlar</option>
            {locations.map((loc) => (
              <option key={loc.region} value={loc.region}>{loc.region}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="search-field">
          <label>Tuman / Shahar</label>
          <select
            value={cityDistrict}
            onChange={(e) => setCityDistrict(e.target.value)}
            disabled={!region}
            id="filter-district"
          >
            <option value="">Barcha tumanlar</option>
            {selectedRegionDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Rent Type */}
        <div className="search-field">
          <label>Ijara turi</label>
          <select value={rentType} onChange={(e) => setRentType(e.target.value)} id="filter-rent-type">
            <option value="">Barchasi</option>
            <option value="monthly">Oylik</option>
            <option value="daily">Kunlik</option>
            <option value="weekly">Haftalik</option>
          </select>
        </div>

        {/* Property Type */}
        <div className="search-field">
          <label>Uy turi</label>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} id="filter-property-type">
            <option value="">Barchasi</option>
            <option value="apartment">Kvartira</option>
            <option value="house">Hovli</option>
            <option value="room">Xona</option>
            <option value="studio">Studio</option>
            <option value="commercial">Tijorat binosi</option>
          </select>
        </div>

        {/* Rooms */}
        <div className="search-field">
          <label>Xonalar</label>
          <select value={rooms} onChange={(e) => setRooms(e.target.value)} id="filter-rooms">
            <option value="">Istalgan</option>
            <option value="1">1 xona</option>
            <option value="2">2 xona</option>
            <option value="3">3 xona</option>
            <option value="4">4+ xona</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="search-field">
          <label>Saralash</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} id="filter-sort-by">
            <option value="newest">Eng yangi</option>
            <option value="cheapest">Eng arzon</option>
            <option value="expensive">Eng qimmat</option>
            <option value="views">Eng ko'p ko'rilgan</option>
          </select>
        </div>
      </div>

      {/* Amenity Badges Quick Checkbox Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap',
        marginBottom: '2rem',
        padding: '0.85rem 1.25rem',
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E5E7EB',
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4B5563' }}>Qulayliklar:</span>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={wifi === 'available'}
            onChange={(e) => setWifi(e.target.checked ? 'available' : '')}
            id="checkbox-wifi"
          />
          <Wifi size={16} color="#10B981" /> Wi-Fi
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={washingMachine === 'available'}
            onChange={(e) => setWashingMachine(e.target.checked ? 'available' : '')}
            id="checkbox-washing-machine"
          />
          <Shirt size={16} color="#10B981" /> Kir yuvish mashinasi
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={airConditioning === 'available'}
            onChange={(e) => setAirConditioning(e.target.checked ? 'available' : '')}
            id="checkbox-ac"
          />
          <Wind size={16} color="#10B981" /> Konditsioner
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={elevator === 'available'}
            onChange={(e) => setElevator(e.target.checked ? 'available' : '')}
            id="checkbox-elevator"
          />
          <Building2 size={16} color="#10B981" /> Lift
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={familyFriendly === 'available'}
            onChange={(e) => setFamilyFriendly(e.target.checked ? 'available' : '')}
            id="checkbox-family"
          />
          <Users size={16} color="#10B981" /> Oilalar uchun
        </label>
      </div>

      {/* Main Content: Map or Grid */}
      {viewMode === 'map' ? (
        <div style={{ height: '650px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: 'var(--shadow-lg)' }}>
          <InteractiveMap properties={properties} height="100%" />
        </div>
      ) : loading ? (
        <div className="grid-cards">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <PropertyCardSkeleton key={n} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
        }}>
          <Search size={48} color="#9CA3AF" />
          <h3 style={{ marginTop: '1rem', color: '#111827', fontSize: '1.25rem' }}>
            Mos keluvchi e'lonlar topilmadi
          </h3>
          <p style={{ color: '#6B7280', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Qidiruv mezonlarini o'zgartirib ko'ring yoki filtrlarni tozalang.
          </p>
          <button type="button" onClick={handleClearFilters} className="btn btn-primary">
            Filtrlarni tozalash
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  );
};
