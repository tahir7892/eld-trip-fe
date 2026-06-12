import { useState } from 'react';
import { FileText } from 'lucide-react';
import ELDLogSheet from './ELDLogSheet';

export default function DailyLogTabs({ logs }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!logs?.length) return null;

  const activeLog = logs[activeIndex];

  return (
    <div className="daily-log-tabs">
      <div className="log-tab-bar" role="tablist" aria-label="Daily log sheets">
        {logs.map((log, i) => (
          <button
            key={log.date}
            type="button"
            role="tab"
            aria-selected={activeIndex === i}
            className={`log-tab ${activeIndex === i ? 'active' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            <FileText size={14} />
            <span>Day {log.day_number}</span>
            <span className="log-tab-date">{log.date.slice(5)}</span>
            <span className="log-tab-miles">{log.total_miles} mi</span>
          </button>
        ))}
      </div>

      <div className="log-tab-panel" role="tabpanel">
        <ELDLogSheet log={activeLog} />
      </div>

      <div className="log-tab-print-all" id="print-area">
        {logs.map((log) => (
          <div key={log.date} className="eld-log-wrapper print-only-log">
            <ELDLogSheet log={log} />
          </div>
        ))}
      </div>
    </div>
  );
}
