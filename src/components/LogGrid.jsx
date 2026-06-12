const ROWS = [
  { key: 'off_duty', label: 'OFF DUTY' },
  { key: 'sleeper_berth', label: 'SLEEPER BERTH' },
  { key: 'driving', label: 'DRIVING' },
  { key: 'on_duty_not_driving', label: 'ON DUTY (NOT DRIVING)' },
];

const STATUS_TO_ROW = {
  off_duty: 0,
  sleeper_berth: 1,
  driving: 2,
  on_duty_not_driving: 3,
};

const GRID_COLOR = '#1D4ED8';
const GRID_LIGHT = '#93C5FD';
const LINE_COLOR = '#111827';

const LABEL_WIDTH = 108;
const GRID_WIDTH = 720;
const TOTAL_WIDTH = 52;
const ROW_HEIGHT = 34;
const SVG_WIDTH = LABEL_WIDTH + GRID_WIDTH + TOTAL_WIDTH;
const SVG_HEIGHT = ROWS.length * ROW_HEIGHT;

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToX(minutes) {
  return LABEL_WIDTH + (minutes / (24 * 60)) * GRID_WIDTH;
}

function rowCenterY(rowIndex) {
  return rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
}

function buildSortedSegments(segments) {
  return [...(segments || [])]
    .map((seg) => {
      const startMin = timeToMinutes(seg.start);
      let endMin = timeToMinutes(seg.end);
      if (endMin <= startMin) endMin = 24 * 60;
      return { ...seg, startMin, endMin };
    })
    .sort((a, b) => a.startMin - b.startMin);
}

function GridLines() {
  const lines = [];
  for (let row = 0; row < ROWS.length; row += 1) {
    const yBottom = (row + 1) * ROW_HEIGHT;
    lines.push(
      <line
        key={`row-${row}`}
        x1={LABEL_WIDTH}
        y1={yBottom}
        x2={LABEL_WIDTH + GRID_WIDTH}
        y2={yBottom}
        stroke={GRID_COLOR}
        strokeWidth={1.2}
      />
    );

    for (let quarter = 0; quarter <= 96; quarter += 1) {
      const x = LABEL_WIDTH + (quarter / 96) * GRID_WIDTH;
      const isHour = quarter % 4 === 0;
      const isQuarter = quarter % 1 === 0;
      if (!isHour && !isQuarter) continue;
      lines.push(
        <line
          key={`tick-${row}-${quarter}`}
          x1={x}
          y1={row * ROW_HEIGHT}
          x2={x}
          y2={yBottom}
          stroke={isHour ? GRID_COLOR : GRID_LIGHT}
          strokeWidth={isHour ? 0.9 : 0.4}
          strokeDasharray={isHour ? '' : '1,2'}
        />
      );
    }
  }
  return lines;
}

function DutyStatusLine({ segments }) {
  const sorted = buildSortedSegments(segments);
  if (!sorted.length) return null;

  const elements = [];
  let prevRow = null;

  sorted.forEach((seg, index) => {
    const row = STATUS_TO_ROW[seg.status] ?? 0;
    const x1 = minutesToX(seg.startMin);
    const x2 = minutesToX(seg.endMin);
    const y = rowCenterY(row);

    if (index === 0) {
      elements.push(
        <circle
          key={`start-dot-${index}`}
          cx={x1}
          cy={y}
          r={3.5}
          fill="#DC2626"
          stroke={LINE_COLOR}
          strokeWidth={0.6}
        />
      );
    }

    if (prevRow !== null && prevRow !== row) {
      const transitionX = minutesToX(seg.startMin);
      elements.push(
        <line
          key={`vertical-${index}`}
          x1={transitionX}
          y1={rowCenterY(prevRow)}
          x2={transitionX}
          y2={y}
          stroke={LINE_COLOR}
          strokeWidth={2.5}
        />
      );
      elements.push(
        <circle
          key={`dot-${index}`}
          cx={transitionX}
          cy={y}
          r={3.5}
          fill="#DC2626"
          stroke={LINE_COLOR}
          strokeWidth={0.6}
        />
      );
    }

    elements.push(
      <line
        key={`horizontal-${index}`}
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke={LINE_COLOR}
        strokeWidth={3}
        strokeLinecap="square"
      />
    );

    prevRow = row;
  });

  return <g className="duty-status-line">{elements}</g>;
}

export default function LogGrid({ segments, totals, remarks }) {
  const sortedRemarks = [...(remarks || [])].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  return (
    <div className="fmcsa-log-grid">
      <div className="fmcsa-grid-header">
        <div className="fmcsa-label-spacer" style={{ width: LABEL_WIDTH }} />
        <div className="fmcsa-hour-axis" style={{ width: GRID_WIDTH }}>
          <span className="fmcsa-axis-label left">Midnight</span>
          <span className="fmcsa-axis-label center">Noon</span>
          <span className="fmcsa-axis-label right">Midnight</span>
          <div className="fmcsa-hour-numbers">
            {[...Array(11)].map((_, i) => (
              <span key={`am-${i}`}>{i + 1}</span>
            ))}
            <span className="fmcsa-noon">N</span>
            {[...Array(11)].map((_, i) => (
              <span key={`pm-${i}`}>{i + 1}</span>
            ))}
          </div>
        </div>
        <div className="fmcsa-total-head" style={{ width: TOTAL_WIDTH }}>
          Total
        </div>
      </div>

      <svg
        className="fmcsa-grid-svg"
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        role="img"
        aria-label="FMCSA 24-hour driver duty status grid"
      >
        <rect
          x={LABEL_WIDTH}
          y={0}
          width={GRID_WIDTH}
          height={SVG_HEIGHT}
          fill="#F8FAFF"
        />
        <GridLines />

        {ROWS.map((row, rowIndex) => (
          <text
            key={row.key}
            x={4}
            y={rowCenterY(rowIndex) + 4}
            className="fmcsa-row-label"
          >
            {row.label}
          </text>
        ))}

        <DutyStatusLine segments={segments} />

        {ROWS.map((row, rowIndex) => (
          <text
            key={`total-${row.key}`}
            x={LABEL_WIDTH + GRID_WIDTH + TOTAL_WIDTH / 2}
            y={rowCenterY(rowIndex) + 4}
            textAnchor="middle"
            className="fmcsa-total-value"
          >
            {totals?.[row.key]?.toFixed(2) ?? '0.00'}
          </text>
        ))}

        <rect
          x={0}
          y={0}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          fill="none"
          stroke={GRID_COLOR}
          strokeWidth={1.5}
        />
        <line
          x1={LABEL_WIDTH}
          y1={0}
          x2={LABEL_WIDTH}
          y2={SVG_HEIGHT}
          stroke={GRID_COLOR}
          strokeWidth={1.2}
        />
        <line
          x1={LABEL_WIDTH + GRID_WIDTH}
          y1={0}
          x2={LABEL_WIDTH + GRID_WIDTH}
          y2={SVG_HEIGHT}
          stroke={GRID_COLOR}
          strokeWidth={1.2}
        />
      </svg>

      <div className="fmcsa-remarks-block">
        <h4 className="fmcsa-remarks-title">REMARKS</h4>
        <p className="fmcsa-remarks-note">
          Enter name of place you reported and where released from work and when and where each change of duty occurred.
        </p>
        {sortedRemarks.length > 0 ? (
          <div className="fmcsa-remarks-list">
            {sortedRemarks.map((remark, index) => {
              const xPercent = (timeToMinutes(remark.time) / (24 * 60)) * 100;
              return (
                <div key={`${remark.time}-${index}`} className="fmcsa-remark-row">
                  <div className="fmcsa-remark-leader" style={{ paddingLeft: `${xPercent * 0.72}%` }}>
                    <span className="fmcsa-remark-line" aria-hidden="true" />
                  </div>
                  <p className="fmcsa-remark-text">
                    <strong>{remark.time}</strong>
                    {' — '}
                    {remark.location}
                    {remark.note ? `: ${remark.note}` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="fmcsa-remarks-empty">No duty changes recorded for this day.</p>
        )}
      </div>
    </div>
  );
}
