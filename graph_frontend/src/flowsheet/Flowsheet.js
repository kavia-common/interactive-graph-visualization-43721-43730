import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import './Flowsheet.css';

/**
 * Simple inline SVG "icons" so this CRA template can render the same visual
 * cues without relying on external alias imports from the provided code.
 */
function IconDot({ color = '#E53935', size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
      <circle cx="5" cy="5" r="3.2" fill={color} />
    </svg>
  );
}

function IconCross({ color = '#1E88E5', size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
      <path
        d="M2 2 L8 8 M8 2 L2 8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Generates labels like the screenshot: blank first slot + HHMM ticks.
 */
function generateTimeLabels(startHHMM, count, intervalMinutes) {
  const startHours = parseInt(startHHMM.slice(0, 2), 10);
  const startMins = parseInt(startHHMM.slice(2, 4), 10);
  const start = new Date();
  start.setHours(startHours, startMins, 0, 0);

  const labels = [''];
  for (let i = 0; i < count; i += 1) {
    const t = new Date(start.getTime() + i * intervalMinutes * 60000);
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    labels.push(`${hh}${mm}`);
  }
  return labels;
}

/**
 * Hardcoded sample data chosen to visually resemble the provided image:
 * - Two lines (red + blue)
 * - Frequent points across the time axis
 * - Up/down variability
 * - Markers: red dot + blue "x"
 */
function getHardcodedSeriesData() {
  // 27 points on the x-axis including the initial empty label.
  // Use null for first index so data begins after the first empty column.
  const red = [
    null, 110, 128, 98, 132, 118, 104, 126, 115, 137, 121, 109, 133, 120, 97,
    129, 112, 140, 123, 106, 131, 117, 101, 127, 113, 136, 119,
  ];

  const blue = [
    null, 74, 88, 62, 92, 80, 70, 86, 78, 96, 83, 73, 90, 82, 60, 89, 76, 98,
    85, 69, 91, 79, 64, 87, 75, 95, 81,
  ];

  return { red, blue };
}

/**
 * Synchronize one scrollable element's horizontal scroll with the other.
 */
function syncScrollLeft(sourceEl, targetEl) {
  if (!sourceEl || !targetEl) return;
  targetEl.scrollLeft = sourceEl.scrollLeft;
}

/**
 * Scroll an element to the rightmost end.
 */
function scrollToRight(el) {
  if (!el) return;
  el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
}

// PUBLIC_INTERFACE
export default function Flowsheet() {
  /** Flowsheet chart that matches the provided reference image (hardcoded data). */

  // Match the reference sizing (40px/time column).
  const COL_WIDTH = 40;

  // Keep existing data and order (older->newer left-to-right), but start viewport at the right edge.
  const timeLabels = useMemo(() => generateTimeLabels('0730', 26, 30), []);
  const { red, blue } = useMemo(() => getHardcodedSeriesData(), []);

  // Ensure the inner content is always wider than the viewport to make horizontal overflow available.
  // (At minimum: 1 extra column width beyond the number of labels).
  const scrollContentWidth = useMemo(
    () => Math.max((timeLabels?.length || 0) * COL_WIDTH, 12 * COL_WIDTH),
    [timeLabels]
  );

  // Two horizontally scrollable containers that must remain synchronized.
  const timeLabelsRef = useRef(null);
  const chartContainerRef = useRef(null);

  // Guard to avoid re-scrolling user after initial render.
  const didInitialScrollRef = useRef(false);

  // Used to trigger scroll-to-right after ECharts completes rendering.
  const [chartRenderTick, setChartRenderTick] = useState(0);

  const option = useMemo(
    () => ({
      animation: false,
      grid: {
        left: 28,
        right: 8,
        top: 10,
        bottom: 28,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: timeLabels,
        boundaryGap: false,
        axisLabel: {
          show: true,
          color: '#6b7280',
          fontSize: 10,
          margin: 12,
        },
        axisLine: {
          show: true,
          lineStyle: { color: '#c9c9c9', width: 1 },
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          lineStyle: { color: '#c9c9c9', width: 1 },
        },
        splitLine: {
          show: true,
          lineStyle: { color: 'rgba(0,0,0,0.18)', width: 1, type: 'solid' },
        },
      },
      yAxis: {
        type: 'value',
        min: 40,
        max: 160,
        interval: 20,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: 'rgba(0,0,0,0.18)', width: 1, type: 'solid' },
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: { color: '#9ca3af', type: 'dashed' },
        },
        backgroundColor: 'rgba(17,24,39,0.9)',
        textStyle: { color: '#fff', fontSize: 12 },
      },
      series: [
        {
          name: 'Red series',
          type: 'line',
          data: red,
          connectNulls: false,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 7,
          itemStyle: { color: '#E53935', borderColor: '#E53935' },
          lineStyle: { color: '#E53935', width: 2.2 },
          z: 3,
        },
        {
          name: 'Blue series',
          type: 'line',
          data: blue,
          connectNulls: false,
          showSymbol: true,
          symbol: 'path://M-4,-4 L4,4 M4,-4 L-4,4',
          symbolSize: 10,
          itemStyle: { color: '#1E88E5' },
          lineStyle: { color: '#1E88E5', width: 2.2 },
          z: 3,
        },
      ],
    }),
    [blue, red, timeLabels]
  );

  const handleTimeLabelsScroll = () => {
    syncScrollLeft(timeLabelsRef.current, chartContainerRef.current);
  };

  const handleChartScroll = () => {
    syncScrollLeft(chartContainerRef.current, timeLabelsRef.current);
  };

  /**
   * Initial auto-scroll to the rightmost edge so the latest data is visible first.
   * Uses rAF + small setTimeout for robustness because ECharts can finalize canvas size slightly later.
   */
  useEffect(() => {
    if (didInitialScrollRef.current) return;
    if (!timeLabelsRef.current || !chartContainerRef.current) return;
    if (!timeLabels || timeLabels.length === 0) return;

    const doSyncRight = () => {
      const t = timeLabelsRef.current;
      const c = chartContainerRef.current;
      scrollToRight(t);
      scrollToRight(c);
    };

    // First pass: next paint after DOM nodes exist.
    requestAnimationFrame(() => {
      doSyncRight();

      // Second pass: after ECharts/canvas has had a moment to measure and lay out.
      setTimeout(() => {
        doSyncRight();
        didInitialScrollRef.current = true;
      }, 200);
    });
  }, [timeLabels, chartRenderTick]);

  return (
    <div className="flowsheet-page">
      <div className="flowsheet-card">
        <div className="flowsheet-main">
          <aside className="flowsheet-legend" aria-label="Legend">
            <div className="flowsheet-legend-title">Symbols</div>

            <div className="flowsheet-legend-row">
              <span className="flowsheet-legend-icon" aria-hidden="true">
                <IconDot color="#E53935" />
              </span>
              <span className="flowsheet-legend-text">Series A</span>
            </div>

            <div className="flowsheet-legend-row">
              <span className="flowsheet-legend-icon" aria-hidden="true">
                <IconCross color="#1E88E5" />
              </span>
              <span className="flowsheet-legend-text">Series B</span>
            </div>

            <div className="flowsheet-legend-note">
              <div className="flowsheet-legend-note-main">
                Hardcoded sample data
              </div>
              <div className="flowsheet-legend-note-sub">
                Layout/styles tuned to match the reference image.
              </div>
            </div>
          </aside>

          <section className="flowsheet-chart" aria-label="Flowsheet chart">
            <div className="flowsheet-chart-frame">
              {/* Time labels row (scrollable) */}
              <div
                ref={timeLabelsRef}
                onScroll={handleTimeLabelsScroll}
                className="flowsheet-xscroll"
                aria-label="Time labels"
              >
                <div
                  style={{
                    width: scrollContentWidth,
                    whiteSpace: 'nowrap',
                    paddingBottom: 6,
                  }}
                >
                  {timeLabels.map((t, idx) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${t}-${idx}`}
                      style={{
                        display: 'inline-block',
                        width: COL_WIDTH,
                        minWidth: COL_WIDTH,
                        maxWidth: COL_WIDTH,
                        textAlign: 'left',
                        paddingLeft: 2,
                        fontSize: 10,
                        color: '#6b7280',
                        userSelect: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chart scroller (scrollable) */}
              <div
                ref={chartContainerRef}
                onScroll={handleChartScroll}
                className="flowsheet-xscroll"
                aria-label="Chart scroller"
              >
                <div style={{ width: scrollContentWidth }}>
                  <ReactECharts
                    option={option}
                    style={{ height: 180, width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    lazyUpdate
                    onEvents={{
                      // When ECharts reports finished, trigger our "layout is ready" tick.
                      finished: () => setChartRenderTick((v) => v + 1),
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
