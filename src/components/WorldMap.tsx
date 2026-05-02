import { useEffect, useRef } from 'react';
import { COUNTRIES_GEOJSON } from '../lib/geoData';

// Leaflet is loaded via CDN to avoid SSR/bundler complexity with its CSS
declare const L: any; // eslint-disable-line @typescript-eslint/no-explicit-any

interface WorldMapProps {
  onCountryClick: (countryName: string) => void;
}

export function WorldMap({ onCountryClick }: WorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapContainerRef.current || leafletMapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 2,
      }).setView([20, 0], 2);

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      ).addTo(map);

      L.geoJSON(COUNTRIES_GEOJSON, {
        style: {
          fillColor: '#3b82f6',
          weight: 1,
          color: '#e2e8f0',
          fillOpacity: 0.05,
          cursor: 'pointer',
        },
        onEachFeature: (feature: any, layer: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          layer.on({
            mouseover: (e: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
              e.target.setStyle({ fillOpacity: 0.2, color: '#3b82f6' }),
            mouseout: (e: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
              e.target.setStyle({ fillOpacity: 0.05, color: '#e2e8f0' }),
            click: (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              L.DomEvent.stopPropagation(e);
              onCountryClick(feature.properties.name);
            },
          });
        },
      }).addTo(map);

      leafletMapRef.current = map;
    };

    if (typeof L !== 'undefined') {
      initMap();
      return;
    }

    // Inject Leaflet JS if not already present
    if (!document.querySelector('#leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [onCountryClick]);

  return <div ref={mapContainerRef} className="flex-1 relative" />;
}
