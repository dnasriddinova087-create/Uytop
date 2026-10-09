import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, Maximize2, Layers } from 'lucide-react';
import { Property } from '../types';
import { api, getFullImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { trackUserActivity } from '../services/activityTracker';

interface PropertyCardProps {
  property: Property;
  onFavoriteChange?: (propertyId: number, isFavorited: boolean) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavoriteChange }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(property.is_favorited || false);
  const [loadingFav, setLoadingFav] = useState(false);

  const primaryImage =
    property.images && property.images.length > 0
      ? property.images.find((img) => img.is_primary)?.image_url || property.images[0].image_url
      : null;

  const imageUrl = getFullImageUrl(primaryImage);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (loadingFav) return;
    setLoadingFav(true);

    try {
      if (isFav) {
        await api.removeFavorite(property.id);
        setIsFav(false);
        trackUserActivity('FAVORITE_REMOVE', 'property', property.id, { title: property.title });
        onFavoriteChange?.(property.id, false);
      } else {
        await api.addFavorite(property.id);
        setIsFav(true);
        trackUserActivity('FAVORITE_ADD', 'property', property.id, { title: property.title });
        onFavoriteChange?.(property.id, true);
      }
    } catch (err) {
      console.error('Favorite toggle failed', err);
    } finally {
      setLoadingFav(false);
    }
  };

  const rentTypeLabel =
    property.rent_type === 'monthly'
      ? '/ oy'
      : property.rent_type === 'daily'
      ? '/ kun'
      : '/ hafta';

  return (
    <div className="property-card" id={`property-card-${property.id}`}>
      <Link to={`/properties/${property.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="property-thumb-wrap">
          <img
            src={imageUrl}
            alt={property.title}
            className="property-thumb"
            loading="lazy"
          />

          <div className="card-badges">
            {property.status === 'rented' ? (
              <span className="badge badge-rented">Ijaraga berildi</span>
            ) : property.status === 'active' ? (
              <span className="badge badge-active">Faol</span>
            ) : (
              <span className="badge badge-pending">{property.status}</span>
            )}

            <span className="badge badge-rent-type">
              {property.property_type === 'apartment'
                ? 'Kvartira'
                : property.property_type === 'house'
                ? 'Hovli'
                : property.property_type === 'room'
                ? 'Xona'
                : property.property_type === 'studio'
                ? 'Studio'
                : 'Tijorat'}
            </span>
          </div>

          <button
            type="button"
            className={`btn-fav-round ${isFav ? 'active' : ''}`}
            onClick={handleToggleFavorite}
            title={isFav ? "Sevimlilardan o'chirish" : "Sevimlilarga saqlash"}
            id={`btn-fav-${property.id}`}
          >
            <Heart size={18} fill={isFav ? '#DC2626' : 'none'} />
          </button>
        </div>

        <div className="property-content">
          <div className="property-price">
            {formatPrice(property.price)} <span style={{ fontSize: '0.85rem' }}>{property.currency}</span>
            <span className="property-price-period"> {rentTypeLabel}</span>
          </div>

          <h3 className="property-title">{property.title}</h3>

          <div className="property-location">
            <MapPin size={15} color="#10B981" />
            <span>
              {property.region}, {property.city_district}
              {property.mahalla ? ` (${property.mahalla})` : ''}
            </span>
          </div>

          <div className="property-specs">
            <div className="spec-item" title="Xonalar soni">
              <span style={{ fontWeight: 700 }}>{property.rooms}</span> xona
            </div>
            <div className="spec-item" title="Maydoni">
              <Maximize2 size={14} />
              <span>{property.area_sqm} m²</span>
            </div>
            {property.floor && (
              <div className="spec-item" title="Qavati">
                <Layers size={14} />
                <span>
                  {property.floor}
                  {property.total_floors ? `/${property.total_floors}` : ''} qavat
                </span>
              </div>
            )}
            {property.distance_km !== undefined && property.distance_km !== null && (
              <div className="spec-item" style={{ marginLeft: 'auto', color: '#10B981', fontWeight: 600 }}>
                {property.distance_km} km
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};
