import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix íconos de Leaflet en bundlers (Vite/CRA)
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import icon1x from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x,
  iconUrl: icon1x,
  shadowUrl: shadow,
});

export default function Mapa({
  events = [],                        
  center = [-33.45, -70.66],         
  zoom = 100,                          
  height = 420,
}) {
  const markers = useMemo(() => {
    return (events || [])
      .filter(e => Array.isArray(e.coords) && e.coords.length === 2)
      .map(e => ({
        id: e.id ?? `${e.name}-${e?.date ?? ''}`,
        name: e.name,
        date: e.date,
        address: e.address,
        url: e.url,
        position: [Number(e.coords[0]), Number(e.coords[1])],
      }));
  }, [events]);

  return (
    <div style={{ width: '100%', height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map(m => (
          <Marker key={m.id} position={m.position}>
            <Popup>
              <strong>{m.name}</strong><br />
              {m.date ? <span>{m.date}<br /></span> : null}
              {m.address ? <span>{m.address}<br /></span> : null}
              {m.url ? (
                <a href={m.url} target="_blank" rel="noreferrer">
                  Ver detalle
                </a>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
