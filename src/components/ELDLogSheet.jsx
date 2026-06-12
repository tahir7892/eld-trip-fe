import { Calendar, Gauge, Truck, Clock, BedDouble } from 'lucide-react';
import LogGrid from './LogGrid';

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return { month, day, year };
}

export default function ELDLogSheet({ log }) {
  if (!log) return null;
  const { month, day, year } = formatDate(log.date);
  const onDutyTotal = (log.totals?.driving || 0) + (log.totals?.on_duty_not_driving || 0);
  const sleeperHours = log.totals?.sleeper_berth || 0;

  return (
    <div className="eld-log-sheet">
      <div className="eld-day-banner">
        <div className="eld-day-banner-left">
          <span className="eld-day-badge">
            Day {log.day_number} of {log.total_days}
          </span>
          <h4 className="eld-day-title">{log.formatted_date || log.date}</h4>
          {log.day_summary && <p className="eld-day-summary">{log.day_summary}</p>}
        </div>
        <div className="eld-day-stats">
          <span className="eld-stat-chip">
            <Gauge size={14} />
            {log.total_miles} mi
          </span>
          <span className="eld-stat-chip">
            <Truck size={14} />
            {log.totals?.driving?.toFixed(1)}h drive
          </span>
          <span className="eld-stat-chip">
            <Clock size={14} />
            {onDutyTotal.toFixed(1)}h on duty
          </span>
          {sleeperHours > 0 && (
            <span className="eld-stat-chip">
              <BedDouble size={14} />
              {sleeperHours.toFixed(1)}h sleeper
            </span>
          )}
        </div>
      </div>

      <div className="eld-header">
        <h3>Driver&apos;s Daily Log (24 hours)</h3>
        <div className="eld-date">
          <Calendar size={14} />
          <span>Date: </span>
          <span className="date-field">{month}</span> /
          <span className="date-field">{day}</span> /
          <span className="date-field">{year}</span>
        </div>
      </div>

      <div className="eld-info-grid">
        <div className="eld-info-left">
          <div className="eld-field">
            <label>Total Miles Driving Today</label>
            <span>{log.total_miles}</span>
          </div>
          <div className="eld-field">
            <label>Truck / Tractor No.</label>
            <span>{log.truck_number}</span>
          </div>
          <div className="eld-field">
            <label>Trailer No.</label>
            <span>{log.trailer_number}</span>
          </div>
        </div>
        <div className="eld-info-right">
          <div className="eld-field">
            <label>Carrier</label>
            <span>{log.carrier_name}</span>
          </div>
          <div className="eld-field">
            <label>Driver</label>
            <span>{log.driver_name}</span>
          </div>
          <div className="eld-field">
            <label>Shipping Document</label>
            <span>{log.shipping_document}</span>
          </div>
        </div>
      </div>

      <LogGrid segments={log.segments} totals={log.totals} remarks={log.remarks} />

      <div className="eld-recap">
        <table>
          <thead>
            <tr>
              <th>70 Hour / 8 Day</th>
              <th>60 Hour / 7 Day</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A: On duty today — {onDutyTotal.toFixed(2)} hrs</td>
              <td>A: On duty today — {onDutyTotal.toFixed(2)} hrs</td>
            </tr>
            <tr>
              <td>B: Available tomorrow (70 − A): {(70 - onDutyTotal).toFixed(2)} hrs</td>
              <td>B: Available tomorrow (60 − A): {(60 - onDutyTotal).toFixed(2)} hrs</td>
            </tr>
          </tbody>
        </table>
        <p className="recap-note">
          *If you took 34 consecutive hours off duty you have 60/70 hours available.
        </p>
      </div>
    </div>
  );
}
