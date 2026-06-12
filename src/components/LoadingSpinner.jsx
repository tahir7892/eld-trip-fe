import { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Route,
  Timer,
  ClipboardList,
  Truck,
  Check,
  Loader2,
  Clock,
} from 'lucide-react';

const STEPS = [
  {
    id: 'geocode',
    label: 'Geocoding locations',
    detail: 'Resolving addresses via OpenStreetMap',
    Icon: MapPin,
    delay: 1200,
  },
  {
    id: 'route',
    label: 'Calculating route',
    detail: 'Building driving directions & mileage',
    Icon: Route,
    delay: 2800,
  },
  {
    id: 'hos',
    label: 'Building HOS schedule',
    detail: 'Applying FMCSA hours-of-service rules',
    Icon: Timer,
    delay: 5000,
  },
  {
    id: 'logs',
    label: 'Generating ELD logs',
    detail: 'Creating daily log sheets & duty grids',
    Icon: ClipboardList,
    delay: 7500,
  },
];

const PROGRESS_CAP = 88;
const FINISH_HOLD_MS = 1600;
const STEP_FINISH_INTERVAL_MS = 220;

export default function LoadingSpinner({
  active,
  onFinished,
  message = 'Building your trip plan…',
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(6);
  const [finishing, setFinishing] = useState(false);
  const [detailVisible, setDetailVisible] = useState(true);
  const wasActiveRef = useRef(false);
  const finishTimerRef = useRef(null);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  // Advance steps on a timer while the API is still running.
  useEffect(() => {
    if (!active) return undefined;

    const stepTimers = STEPS.slice(1).map((step, index) =>
      setTimeout(() => {
        setDetailVisible(false);
        setTimeout(() => {
          setActiveStep(index + 1);
          setDetailVisible(true);
        }, 160);
      }, step.delay)
    );

    return () => stepTimers.forEach(clearTimeout);
  }, [active]);

  // Creep progress while waiting; cap below 100% until the API responds.
  useEffect(() => {
    if (!active) return undefined;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_CAP) return prev;
        const stepFloor = 8 + activeStep * 18;
        const next = prev + 0.65;
        return Math.max(next, Math.min(stepFloor, PROGRESS_CAP));
      });
    }, 250);

    return () => clearInterval(progressTimer);
  }, [active, activeStep]);

  // When the API finishes, tick through remaining steps, then hold at 100%.
  useEffect(() => {
    if (active) {
      wasActiveRef.current = true;
      return undefined;
    }

    if (!wasActiveRef.current) return undefined;

    setFinishing(true);
    setDetailVisible(false);

    const stepTimer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= STEPS.length) return prev;
        const next = prev + 1;
        const stepProgress = 88 + (next / STEPS.length) * 12;
        setProgress(next >= STEPS.length ? 100 : Math.min(stepProgress, 99));
        if (next >= STEPS.length) {
          setDetailVisible(true);
        }
        return next;
      });
    }, STEP_FINISH_INTERVAL_MS);

    finishTimerRef.current = setTimeout(() => {
      clearInterval(stepTimer);
      setActiveStep(STEPS.length);
      setProgress(100);
      setDetailVisible(true);
      onFinishedRef.current?.();
    }, FINISH_HOLD_MS);

    return () => {
      clearInterval(stepTimer);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, [active]);

  const allStepsComplete = activeStep >= STEPS.length;

  const displayStep = allStepsComplete
    ? { detail: 'Trip plan ready — loading results…' }
    : finishing
      ? { detail: STEPS[Math.min(activeStep, STEPS.length - 1)].detail }
      : STEPS[activeStep];
  const visibleStepIndex = allStepsComplete
    ? STEPS.length - 1
    : Math.min(activeStep, STEPS.length - 1);

  const displayProgress = allStepsComplete ? 100 : Math.min(100, Math.round(progress));
  const barScale = displayProgress / 100;

  return (
    <div className="loading-overlay" role="dialog" aria-modal="true" aria-labelledby="loading-title">
      <div className="loading-backdrop-glow" aria-hidden="true" />
      <div className={`loading-card${finishing ? ' loading-card--finishing' : ''}`}>
        <div className="loading-card-header">
          <div className="loading-header-glow" aria-hidden="true" />
          <div className="loading-truck-scene" aria-hidden="true">
            <div className="loading-route-track">
              <div className="loading-road-surface">
                <span className="loading-road-edge left" />
                <span className="loading-road-dashes" />
                <span className="loading-road-edge right" />
              </div>
              <span className="loading-route-dot start" />
              <span className="loading-route-dot mid" />
              <span className="loading-route-dot end" />
              <span
                className="loading-truck-icon"
                style={{ left: `${Math.min(progress, 88)}%` }}
              >
                <Truck size={16} strokeWidth={2.5} />
                <span className="loading-truck-shadow" />
              </span>
            </div>
          </div>

          <div className="loading-header-text">
            <div className="loading-header-meta">
              <span className="loading-eyebrow">ELD Trip Engine</span>
              <span className="loading-step-badge">
                {allStepsComplete
                  ? 'All steps complete'
                  : `Step ${visibleStepIndex + 1} of ${STEPS.length}`}
              </span>
            </div>
            <h2 id="loading-title" className="loading-message">
              {allStepsComplete ? 'Trip plan ready!' : finishing ? 'Wrapping up…' : message}
            </h2>
            <p
              className={`loading-submessage${detailVisible ? ' loading-submessage--visible' : ''}`}
            >
              {displayStep.detail}
            </p>
          </div>
        </div>

        <div className="loading-body">
          <div className="loading-progress-wrap">
            <div className="loading-progress-meta">
              <span className="loading-progress-label">Overall progress</span>
              <span className="loading-progress-value">{displayProgress}%</span>
            </div>
            <div
              className="loading-progress-bar"
              role="progressbar"
              aria-valuenow={displayProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="loading-progress-fill"
                style={{ transform: `scaleX(${barScale})` }}
              >
                <span className="loading-progress-glow" />
              </div>
            </div>
          </div>

          <ol className="loading-timeline" aria-label="Processing steps">
            {STEPS.map((step, index) => {
              const allComplete = activeStep >= STEPS.length;
              const status = allComplete || index < activeStep
                ? 'done'
                : index === activeStep
                  ? 'active'
                  : 'pending';
              const StepIcon = step.Icon;
              const isLast = index === STEPS.length - 1;

              return (
                <li
                  key={step.id}
                  className={`loading-timeline-item loading-timeline-item--${status}`}
                >
                  <div className="loading-timeline-rail">
                    <span className="loading-timeline-indicator" aria-hidden="true">
                      {status === 'done' ? (
                        <Check size={13} strokeWidth={3} className="loading-check-pop" />
                      ) : status === 'active' ? (
                        <Loader2 size={13} strokeWidth={2.5} className="icon-spin" />
                      ) : (
                        <StepIcon size={13} strokeWidth={2} />
                      )}
                    </span>
                    {!isLast && (
                      <span
                        className={`loading-timeline-connector${status === 'done' ? ' loading-timeline-connector--filled' : ''}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="loading-timeline-content">
                    <span className="loading-timeline-label">{step.label}</span>
                    {status === 'active' && (
                      <span className="loading-timeline-status">In progress…</span>
                    )}
                    {status === 'done' && (
                      <span className="loading-timeline-status">Complete</span>
                    )}
                    {status === 'pending' && (
                      <span className="loading-timeline-status">Waiting</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="loading-footnote" role="status" aria-live="polite">
            <Clock size={13} strokeWidth={2} aria-hidden="true" />
            {allStepsComplete
              ? 'Opening your route plan and ELD logs…'
              : 'Long routes may take up to a minute — please keep this window open.'}
          </p>
        </div>
      </div>
    </div>
  );
}
