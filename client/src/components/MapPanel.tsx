import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { OrgFilter } from '../types';

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}
import { organizations } from '../data/organizations';

// Fix broken default marker icons in Vite builds
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom div icons: highlighted = Freedom Trail Red, dimmed = gray
const highlightedIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #FB4D42;
    border: 2.5px solid #fff;
    box-shadow: 0 0 0 1.5px #FB4D42, 0 2px 6px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dimmedIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #58585B;
    border: 2px solid #fff;
    opacity: 0.4;
  "></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const MAP_FILTERS = ['electronics', 'appliances', 'clothing'] as const;

interface MapPanelProps {
  mapQuery: string;
  setMapQuery: (q: string) => void;
  mapFilter: OrgFilter | null;
  setMapFilter: (f: OrgFilter | null) => void;
}

const BOSTON_CENTER: [number, number] = [42.3393, -71.0927];

export default function MapPanel({ mapQuery, setMapQuery, mapFilter, setMapFilter }: MapPanelProps) {
  const hasSearch = mapQuery.trim() !== '' || mapFilter !== null;
  const lower = mapQuery.toLowerCase();

  const activeOrgIds = hasSearch
    ? organizations
        .filter(org => {
          const matchesQuery = !mapQuery.trim() || (
            org.name.toLowerCase().includes(lower) ||
            org.description.toLowerCase().includes(lower) ||
            org.category.toLowerCase().includes(lower) ||
            org.tags.some(t => t.toLowerCase().includes(lower))
          );
          const matchesFilter = !mapFilter || org.tags.some(t => t.toLowerCase() === mapFilter);
          return matchesQuery && matchesFilter;
        })
        .map(org => org.id)
    : organizations.map(org => org.id);

  return (
    <div className="map-panel">
      <MapContainer
        center={BOSTON_CENTER}
        zoom={12}
        className="leaflet-map"
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <InvalidateSize />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {organizations.map(org => {
          const isHighlighted = activeOrgIds.includes(org.id);
          return (
            <Marker
              key={org.id}
              position={[org.lat, org.lng]}
              icon={isHighlighted ? highlightedIcon : dimmedIcon}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong style={{ fontSize: '0.85rem', color: '#091F2F' }}>{org.name}</strong>
                  <br />
                  <span style={{ fontSize: '0.75rem', color: '#58585B' }}>{org.address}</span>
                  <br />
                  <span style={{
                    display: 'inline-block',
                    marginTop: 4,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: '#1871BD',
                    color: '#fff',
                    padding: '1px 7px',
                    borderRadius: 10,
                  }}>{org.category}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="map-search-wrap">
        <div className="search-input-area">
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, category, or item…"
            value={mapQuery}
            onChange={e => setMapQuery(e.target.value)}
          />
          <div className="search-filters">
            {MAP_FILTERS.map(filter => (
              <button
                key={filter}
                className={`search-filter-btn${mapFilter === filter ? ' search-filter-btn--active' : ''}`}
                onClick={() => setMapFilter(mapFilter === filter ? null : filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
