import { useState } from 'react';
import {
  Truck,
  AlertCircle,
  Check,
  Printer,
  ClipboardList,
} from 'lucide-react';
import TripForm from './components/TripForm';
import TripSummary from './components/TripSummary';
import RouteMap from './components/RouteMap';
import StopsTimeline from './components/StopsTimeline';
import DailyLogTabs from './components/DailyLogTabs';
import LoadingSpinner from './components/LoadingSpinner';
import { calculateTrip, getApiErrorMessage } from './api/tripsApi';
import './styles/global.css';

const FEATURES = [
  { text: 'HOS-compliant route scheduling', icon: Check },
  { text: 'Interactive route map with stops', icon: Check },
  { text: 'FMCSA daily log sheet generation', icon: Check },
];

function App() {
  const [tripData, setTripData] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [error, setError] = useState(null);

  const isBusy = apiLoading || showLoadingModal;

  const handleSubmit = async (formData) => {
    setApiLoading(true);
    setShowLoadingModal(true);
    setError(null);
    setTripData(null);
    try {
      const result = await calculateTrip(formData);
      setTripData(result);
    } catch (err) {
      setShowLoadingModal(false);
      setError(getApiErrorMessage(err));
    } finally {
      setApiLoading(false);
    }
  };

  const handleLoadingFinished = () => {
    setShowLoadingModal(false);
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePrint = () => window.print();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-glow" aria-hidden="true" />
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-icon">
              <Truck size={24} strokeWidth={2} />
            </div>
            <div>
              <h1>Truck Trip Planner &amp; ELD Log Generator</h1>
              <p>FMCSA HOS-compliant routing, stops, and daily log sheets</p>
            </div>
          </div>
          <nav className="header-nav" aria-label="App info">
            <span className="nav-pill">70/8 Cycle</span>
            <span className="nav-pill">Property CMV</span>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <TripForm onSubmit={handleSubmit} loading={isBusy} />

        {showLoadingModal && (
          <LoadingSpinner active={apiLoading} onFinished={handleLoadingFinished} />
        )}

        {error && (
          <div className="error-banner fade-in" role="alert">
            <span className="error-icon">
              <AlertCircle size={18} strokeWidth={2.5} />
            </span>
            <div>
              <strong>Could not calculate trip</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!tripData && !isBusy && !error && (
          <div className="empty-state fade-in">
            <div className="empty-state-inner">
              <div className="empty-icon-wrap">
                <ClipboardList size={36} strokeWidth={1.75} />
              </div>
              <h3>Ready to Plan Your Trip</h3>
              <p>Enter trip details above or use demo data to instantly generate a full route plan and ELD logs.</p>
              <ul className="feature-list">
                {FEATURES.map(({ text, icon: Icon }) => (
                  <li key={text}>
                    <span className="feature-check">
                      <Icon size={12} strokeWidth={3} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tripData && !showLoadingModal && (
          <div id="results" className="results fade-in">
            <TripSummary summary={tripData.summary} />

            <div className="results-grid">
              <RouteMap route={tripData.route} markers={tripData.markers} />
              <StopsTimeline stops={tripData.stops} />
            </div>

            <section className="logs-section card">
              <div className="section-head">
                <div className="section-head-text">
                  <span className="section-tag">ELD Output</span>
                  <h2>Daily Log Sheets</h2>
                  <p>
                    {tripData.daily_logs.length} day{tripData.daily_logs.length !== 1 ? 's' : ''}
                    {' · '}FMCSA driver daily log format
                  </p>
                </div>
                <button type="button" className="btn btn-secondary print-btn" onClick={handlePrint}>
                  <Printer size={16} strokeWidth={2} />
                  Print Logs
                </button>
              </div>
              <DailyLogTabs logs={tripData.daily_logs} />
            </section>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Property-carrying CMV driver · 70-hour/8-day cycle · FMCSA Hours of Service</p>
      </footer>
    </div>
  );
}

export default App;
