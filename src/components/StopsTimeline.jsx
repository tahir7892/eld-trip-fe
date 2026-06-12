import { useState } from 'react';
import {
  Package,
  Flag,
  Fuel,
  Moon,
  Coffee,
  RotateCcw,
  Truck,
  Circle,
} from 'lucide-react';

const STOP_CONFIG = {
  pickup: { label: 'Pickup', color: '#2563EB', Icon: Package },
  dropoff: { label: 'Dropoff', color: '#0B1F3A', Icon: Flag },
  fuel: { label: 'Fuel', color: '#12355B', Icon: Fuel },
  rest: { label: '10-Hr Rest', color: '#64748B', Icon: Moon },
  rest_break: { label: '30-Min Break', color: '#2563EB', Icon: Coffee },
  cycle_restart: { label: '34-Hr Restart', color: '#12355B', Icon: RotateCcw },
  driving: { label: 'Driving', color: '#2563EB', Icon: Truck },
};

const DUTY_COLORS = {
  driving: '#2563EB',
  on_duty_not_driving: '#12355B',
  off_duty: '#94A3B8',
  sleeper_berth: '#64748B',
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'driving', label: 'Driving' },
  { id: 'pickup', label: 'Pickup' },
  { id: 'dropoff', label: 'Dropoff' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'rest_break', label: 'Breaks' },
  { id: 'rest', label: 'Rest' },
];

function formatTime(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function StopsTimeline({ stops }) {
  const [filter, setFilter] = useState('all');

  if (!stops?.length) return null;

  const filtered = filter === 'all'
    ? stops
    : stops.filter((s) => s.type === filter || (filter === 'rest' && s.type === 'cycle_restart'));

  return (
    <section className="card stops-section fade-in">
      <div className="section-head compact">
        <div className="section-head-text">
          <span className="section-tag">Schedule</span>
          <h2>Stops &amp; Timeline</h2>
        </div>
        <span className="stop-count">{stops.length} events</span>
      </div>

      <div className="timeline-filters" role="tablist" aria-label="Filter stops">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`filter-chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="timeline">
        {filtered.length === 0 ? (
          <p className="timeline-empty">No events match this filter.</p>
        ) : (
          filtered.map((stop, index) => {
            const cfg = STOP_CONFIG[stop.type] || { label: stop.type, color: '#64748B', Icon: Circle };
            const StopIcon = cfg.Icon;
            const dutyColor = DUTY_COLORS[stop.duty_status] || '#64748B';
            return (
              <div key={`${stop.time}-${index}`} className="timeline-item">
                <div className="timeline-rail">
                  <div
                    className="timeline-dot"
                    style={{ background: cfg.color, boxShadow: `0 0 0 3px ${cfg.color}22` }}
                  >
                    <StopIcon size={14} strokeWidth={2.5} color="white" />
                  </div>
                  {index < filtered.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-card">
                  <div className="timeline-card-header">
                    <strong style={{ color: cfg.color }}>{cfg.label}</strong>
                    <time>{formatTime(stop.time)}</time>
                  </div>
                  <p className="timeline-location">{stop.location}</p>
                  <div className="timeline-tags">
                    <span
                      className="duty-tag"
                      style={{
                        background: `${dutyColor}12`,
                        color: dutyColor,
                        borderColor: `${dutyColor}35`,
                      }}
                    >
                      {stop.duty_status.replace(/_/g, ' ')}
                    </span>
                    <span className="duration-tag">{stop.duration_minutes} min</span>
                  </div>
                  {stop.note && <p className="timeline-note">{stop.note}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
