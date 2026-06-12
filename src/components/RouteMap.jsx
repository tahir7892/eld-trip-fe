import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MARKER_COLORS = {
  current: '#2563EB',
  pickup: '#10B981',
  dropoff: '#EF4444',
  fuel: '#F59E0B',
  rest: '#8B5CF6',
  rest_break: '#6366F1',
  cycle_restart: '#0EA5E9',
};

const MARKER_LABELS = {
  current: 'Current Location',
  pickup: 'Pickup',
  dropoff: 'Dropoff',
  fuel: 'Fuel Stop',
  rest: '10-Hour Rest',
  rest_break: '30-Min Break',
  cycle_restart: '34-Hr Restart',
};

function createIcon(color, size = 14) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(11,31,58,.35)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function RouteMap({ route, markers }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !route?.coordinates?.length) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, { scrollWheelZoom: true });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const polyline = L.polyline(route.coordinates, {
      color: '#2563EB',
      weight: 5,
      opacity: 0.85,
    }).addTo(map);

    const addMarker = (lat, lng, color, popup, size = 14) => {
      L.marker([lat, lng], { icon: createIcon(color, size) })
        .addTo(map)
        .bindPopup(popup);
    };

    if (markers?.current) {
      addMarker(
        markers.current.lat,
        markers.current.lng,
        MARKER_COLORS.current,
        `<strong>${MARKER_LABELS.current}</strong><br>${markers.current.label}`,
        16
      );
    }
    if (markers?.pickup) {
      addMarker(
        markers.pickup.lat,
        markers.pickup.lng,
        MARKER_COLORS.pickup,
        `<strong>${MARKER_LABELS.pickup}</strong><br>${markers.pickup.label}`,
        16
      );
    }
    if (markers?.dropoff) {
      addMarker(
        markers.dropoff.lat,
        markers.dropoff.lng,
        MARKER_COLORS.dropoff,
        `<strong>${MARKER_LABELS.dropoff}</strong><br>${markers.dropoff.label}`,
        16
      );
    }

    markers?.stops?.forEach((stop) => {
      const color = MARKER_COLORS[stop.type] || '#64748B';
      const label = MARKER_LABELS[stop.type] || stop.type;
      addMarker(
        stop.lat,
        stop.lng,
        color,
        `<strong>${label}</strong><br>${stop.location}<br><em>${stop.label}</em>`
      );
    });

    map.fitBounds(polyline.getBounds(), { padding: [48, 48] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [route, markers]);

  if (!route?.coordinates?.length) return null;

  return (
    <section className="card map-section fade-in">
      <div className="section-head compact">
        <div className="section-head-text">
          <span className="section-tag">Route</span>
          <h2>Route Map</h2>
        </div>
      </div>
      <div ref={mapRef} className="map-container" />
      <div className="map-legend">
        {['current', 'pickup', 'dropoff', 'fuel', 'rest_break', 'rest'].map((key) => (
          <span key={key}>
            <i style={{ background: MARKER_COLORS[key] }} />
            {MARKER_LABELS[key]}
          </span>
        ))}
      </div>
      {route.legs && (
        <div className="route-legs">
          {route.legs.map((leg, i) => (
            <div key={i} className="route-leg">
              <span className="leg-num">{i + 1}</span>
              <div>
                <strong>{leg.from}</strong>
                <span className="leg-arrow"> → </span>
                <strong>{leg.to}</strong>
                <span className="leg-meta">{leg.distance_miles} mi · {leg.duration_hours} hrs driving</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
