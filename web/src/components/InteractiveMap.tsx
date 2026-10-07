import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property } from '../types';
import { getFullImageUrl } from '../services/api';

// Fix default Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Green Pin for UyTop
const createCustomIcon = (priceText?: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: #0F382A;
        color: #FFFFFF;
        border: 2px solid #10B981;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 4px 6px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 4px;
        transform: translate(-50%, -100%);
      ">
        <span>🏠</span>
        <span>${priceText || 'Uy'}</span>
      </div>
    `,
    iconSize: [40, 25],
    iconAnchor: [20, 25],
  });
};

interface InteractiveMapProps {
  properties?: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  isPicker?: boolean;
  selectedLocation?: [number, number] | null;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties = [],
  center = [41.2995, 69.2401], // Default: Tashkent
  zoom = 12,
  height = '500px',
  isPicker = false,
  selectedLocation = null,
  onLocationSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> UyTop',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map clicks in picker mode
      if (isPicker && onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Update properties markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || isPicker) return;

    markersLayerRef.current.clearLayers();

    properties.forEach((prop) => {
      if (!prop.latitude || !prop.longitude) return;

      const formattedPrice = new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(prop.price);
      const icon = createCustomIcon(formattedPrice);

      const marker = L.marker([prop.latitude, prop.longitude], { icon });

      const thumb = prop.images && prop.images[0] ? getFullImageUrl(prop.images[0].image_url) : '';
      const popupHtml = `
        <div style="font-family: system-ui; width: 200px; padding: 4px;">
          ${thumb ? `<img src="${thumb}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />` : ''}
          <div style="font-size: 13px; font-weight: 700; color: #0F382A; margin-bottom: 2px;">
            ${new Intl.NumberFormat('uz-UZ').format(prop.price)} ${prop.currency}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 4px; line-height: 1.2;">
            ${prop.title}
          </div>
          <div style="font-size: 10px; color: #6B7280; margin-bottom: 8px;">
            📍 ${prop.city_district}
          </div>
          <a href="/properties/${prop.id}" style="
            display: block;
            text-align: center;
            background: #0F382A;
            color: #FFFFFF;
            padding: 5px 8px;
            border-radius: 6px;
            font-size: 11px;
            text-decoration: none;
            font-weight: 600;
          ">Ko'rish</a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current?.addLayer(marker);
    });
  }, [properties, isPicker]);

  // Update picker marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isPicker) return;

    if (selectedLocation) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng(selectedLocation);
      } else {
        const marker = L.marker(selectedLocation, {
          draggable: true,
          icon: createCustomIcon('Tanlandi'),
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          onLocationSelect?.(latlng.lat, latlng.lng);
        });

        pickerMarkerRef.current = marker;
      }
      mapInstanceRef.current.panTo(selectedLocation);
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [selectedLocation, isPicker]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        mapInstanceRef.current?.setView(coords, 14);
        if (isPicker && onLocationSelect) {
          onLocationSelect(coords[0], coords[1]);
        }
      },
      (err) => {
        alert("Geolokatsiyani aniqlab bo'lmadi: " + err.message);
      }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
      <button
        type="button"
        onClick={handleLocateMe}
        className="btn btn-outline"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 1000,
          background: '#FFFFFF',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          fontSize: '0.8rem',
          padding: '6px 12px',
        }}
        id="btn-map-locate-me"
      >
        📍 Mening joylashuvim
      </button>
    </div>
  );
};
