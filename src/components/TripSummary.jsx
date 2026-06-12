import {
  Route,
  Truck,
  Timer,
  FileText,
  Battery,
} from 'lucide-react';

const CARDS = [
  { key: 'total_distance_miles', label: 'Total Distance', unit: 'mi', accent: 'accent-1', Icon: Route },
  { key: 'estimated_driving_hours', label: 'Driving Hours', unit: 'hrs', accent: 'accent-2', Icon: Truck },
  { key: 'total_trip_hours', label: 'Total Trip Hours', unit: 'hrs', accent: 'accent-3', Icon: Timer },
  { key: 'number_of_days', label: 'Log Days', unit: '', accent: 'accent-4', Icon: FileText },
  { key: 'remaining_cycle_hours', label: 'Remaining Cycle', unit: 'hrs', accent: 'accent-5', Icon: Battery },
];

export default function TripSummary({ summary }) {
  if (!summary) return null;

  return (
    <section className="summary-section fade-in">
      <div className="section-head compact">
        <div className="section-head-text">
          <span className="section-tag">Results</span>
          <h2>Trip Summary</h2>
        </div>
      </div>
      <div className="summary-grid">
        {CARDS.map((card, i) => (
          <div
            key={card.key}
            className={`summary-card ${card.accent}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="summary-card-top">
              <span className="summary-icon-wrap">
                <card.Icon size={18} strokeWidth={2} />
              </span>
              <span className="summary-label">{card.label}</span>
            </div>
            <div className="summary-value">
              {summary[card.key]}
              {card.unit && <span className="summary-unit">{card.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
