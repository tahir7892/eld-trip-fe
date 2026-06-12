import { useState } from 'react';
import {
  MapPin,
  Package,
  Flag,
  Clock,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';

const DEMO_DATA = {
  current_location: 'New York, NY',
  pickup_location: 'Chicago, IL',
  dropoff_location: 'Dallas, TX',
  current_cycle_used: 20,
};

const FIELDS = [
  {
    name: 'current_location',
    label: 'Current Location',
    placeholder: 'e.g. New York, NY',
    hint: 'Where the driver is now',
    step: 1,
    Icon: MapPin,
  },
  {
    name: 'pickup_location',
    label: 'Pickup Location',
    placeholder: 'e.g. Chicago, IL',
    hint: 'Load pickup point',
    step: 2,
    Icon: Package,
  },
  {
    name: 'dropoff_location',
    label: 'Dropoff Location',
    placeholder: 'e.g. Dallas, TX',
    hint: 'Final delivery point',
    step: 3,
    Icon: Flag,
  },
];

function validateForm(form) {
  const errors = {};
  FIELDS.forEach(({ name, label }) => {
    if (!form[name]?.trim()) errors[name] = `${label} is required.`;
  });
  const cycle = parseFloat(form.current_cycle_used);
  if (Number.isNaN(cycle)) {
    errors.current_cycle_used = 'Enter a valid number.';
  } else if (cycle < 0 || cycle > 70) {
    errors.current_cycle_used = 'Must be between 0 and 70 hours.';
  }
  return errors;
}

export default function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: '20',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleLocationChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      current_location: form.current_location.trim(),
      pickup_location: form.pickup_location.trim(),
      dropoff_location: form.dropoff_location.trim(),
      current_cycle_used: parseFloat(form.current_cycle_used),
    });
  };

  const fillDemo = () => {
    setForm({ ...DEMO_DATA, current_cycle_used: String(DEMO_DATA.current_cycle_used) });
    setErrors({});
  };

  const cyclePercent = Math.min(100, (parseFloat(form.current_cycle_used) || 0) / 70 * 100);

  return (
    <section className="trip-form-section card">
      <div className="section-head">
        <div className="section-head-text">
          <span className="section-tag">Trip Details</span>
          <h2>Enter Trip Information</h2>
          <p>Provide locations and current HOS cycle usage to generate a compliant route and ELD logs.</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={fillDemo} disabled={loading}>
          <Sparkles size={16} strokeWidth={2} />
          Use Demo Data
        </button>
      </div>

      <div className="route-steps" aria-hidden="true">
        {FIELDS.map((field, i) => (
          <div key={field.step} className="route-step">
            <span className="route-step-num">{field.step}</span>
            <span className="route-step-label">{field.label.replace(' Location', '')}</span>
            {i < FIELDS.length - 1 && <span className="route-step-line" />}
          </div>
        ))}
      </div>

      <form className="trip-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid route-fields">
          {FIELDS.map((field) => (
            <label key={field.name} className="input-group">
              <span className="input-label">
                <span className="input-icon-wrap">
                  <field.Icon size={16} strokeWidth={2} />
                </span>
                {field.label}
              </span>
              <LocationAutocomplete
                name={field.name}
                value={form[field.name]}
                onChange={handleLocationChange}
                placeholder={field.placeholder}
                disabled={loading}
                hasError={!!errors[field.name]}
              />
              {errors[field.name] ? (
                <span className="field-error" role="alert">{errors[field.name]}</span>
              ) : (
                <span className="input-hint">{field.hint}</span>
              )}
            </label>
          ))}
        </div>

        <div className="cycle-block">
          <label className="input-group">
            <span className="input-label">
              <span className="input-icon-wrap">
                <Clock size={16} strokeWidth={2} />
              </span>
              Current Cycle Used (hours)
            </span>
            <div className="cycle-input-row">
              <input
                name="current_cycle_used"
                type="number"
                min="0"
                max="70"
                step="0.5"
                value={form.current_cycle_used}
                onChange={handleChange}
                disabled={loading}
                className={errors.current_cycle_used ? 'input-error' : ''}
                aria-invalid={!!errors.current_cycle_used}
              />
              <span className="cycle-max">/ 70 hrs</span>
              <span className="cycle-pct">{Math.round(cyclePercent)}% used</span>
            </div>
            <div className="cycle-bar">
              <div className="cycle-bar-fill" style={{ width: `${cyclePercent}%` }} />
            </div>
            {errors.current_cycle_used ? (
              <span className="field-error" role="alert">{errors.current_cycle_used}</span>
            ) : (
              <span className="input-hint">Hours used in current 70-hour / 8-day cycle</span>
            )}
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} strokeWidth={2.5} className="icon-spin" />
              Calculating Trip…
            </>
          ) : (
            <>
              Calculate Trip
              <ArrowRight size={18} strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>
    </section>
  );
}
