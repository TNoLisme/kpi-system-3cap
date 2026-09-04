import { useMemo } from 'react';

// ============ Gauge Chart ============
interface GaugeChartProps {
  value: number;
  max: number;
  label?: string;
  size?: number;
}

export function GaugeChart({ value, max, label, size = 200 }: GaugeChartProps) {
  const pct = Math.min(1, value / max);
  const angle = -90 + pct * 180;
  const radius = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;

  const color = pct >= 0.9 ? '#16a34a' : pct >= 0.8 ? '#2563eb' : pct >= 0.65 ? '#f59e0b' : '#ef4444';

  const arcPath = useMemo(() => {
    const startAngle = -90;
    const endAngle = startAngle + 180 * pct;
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }, [cx, cy, radius, pct]);

  const bgArcPath = useMemo(() => {
    const start = polarToCartesian(cx, cy, radius, -90);
    const end = polarToCartesian(cx, cy, radius, 90);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;
  }, [cx, cy, radius]);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <path d={bgArcPath} fill="none" stroke="#e2e8f0" strokeWidth={14} strokeLinecap="round" />
        <path d={arcPath} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        <text x={cx} y={cy - 10} textAnchor="middle" className="text-3xl font-bold" fill={color}>
          {value}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="text-xs" fill="#94a3b8">
          / {max} điểm
        </text>
        {label && (
          <text x={cx} y={cy + 28} textAnchor="middle" className="text-sm font-medium" fill="#475569">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ============ Bar Chart ============
interface BarChartProps {
  data: { label: string; value: number; color?: string; highlight?: boolean }[];
  height?: number;
  showValues?: boolean;
  horizontal?: boolean;
}

export function BarChart({ data, height = 200, showValues = true, horizontal = false }: BarChartProps) {
  const maxVal = Math.max(...data.map(d => d.value), 1);

  if (horizontal) {
    return (
      <div className="flex flex-col gap-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-28 text-sm text-neutral-600 truncate flex-shrink-0">{d.label}</div>
            <div className="flex-1 h-7 bg-neutral-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-2"
                style={{ width: `${(d.value / maxVal) * 100}%`, backgroundColor: d.color || (d.highlight ? '#ef4444' : '#3b82f6') }}
              >
                {showValues && <span className="text-xs font-semibold text-white">{d.value}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-around gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1">
          {showValues && <span className="text-xs font-semibold text-neutral-600">{d.value}</span>}
          <div className="w-full rounded-t-lg transition-all duration-700 ease-out relative group" style={{ height: `${(d.value / maxVal) * 100}%`, minHeight: '4px', backgroundColor: d.color || (d.highlight ? '#ef4444' : '#3b82f6') }}>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
              {d.label}: {d.value}
            </div>
          </div>
          <div className="text-xs text-neutral-500 text-center truncate w-full" style={{ maxWidth: '80px' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ============ Pie/Donut Chart ============
interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export function PieChart({ data, size = 180, showLegend = true, centerLabel, centerValue }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;
  const cx = size / 2;
  const cy = size / 2;

  let cumulativeAngle = -90;

  const slices = data.map(d => {
    const angle = (d.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startOuter = polarToCartesian(cx, cy, radius, startAngle);
    const endOuter = polarToCartesian(cx, cy, radius, endAngle);
    const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
    const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      path: `M ${startOuter.x} ${startOuter.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y} L ${startInner.x} ${startInner.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInner.x} ${endInner.y} Z`,
      color: d.color,
      label: d.label,
      value: d.value,
      pct: ((d.value / total) * 100).toFixed(1),
    };
  });

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} className="transition-opacity hover:opacity-80 cursor-pointer" stroke="white" strokeWidth={2}>
              <title>{s.label}: {s.value} ({s.pct}%)</title>
            </path>
          ))}
        </svg>
        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-neutral-900">{centerValue}</span>
            {centerLabel && <span className="text-xs text-neutral-500">{centerLabel}</span>}
          </div>
        )}
      </div>
      {showLegend && (
        <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-neutral-600 flex-1">{s.label}</span>
              <span className="text-sm font-semibold text-neutral-700">{s.value}</span>
              <span className="text-xs text-neutral-400">({s.pct}%)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Radar/Spider Chart ============
interface RadarChartProps {
  axes: { label: string; value: number; max: number }[];
  size?: number;
  color?: string;
}

export function RadarChart({ axes, size = 240, color = '#2563eb' }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const angleStep = 360 / axes.length;

  const points = axes.map((a, i) => {
    const angle = -90 + i * angleStep;
    const r = (a.value / a.max) * radius;
    return polarToCartesian(cx, cy, r, angle);
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((level, li) => {
        const gridPoints = axes.map((a, i) => {
          const angle = -90 + i * angleStep;
          const p = polarToCartesian(cx, cy, radius * level, angle);
          return `${p.x},${p.y}`;
        }).join(' ');
        return <polygon key={li} points={gridPoints} fill="none" stroke="#e2e8f0" strokeWidth={1} />;
      })}
      {axes.map((_, i) => {
        const angle = -90 + i * angleStep;
        const p = polarToCartesian(cx, cy, radius, angle);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth={1} />;
      })}
      <polygon points={polygonPoints} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth={2} />
      ))}
      {axes.map((a, i) => {
        const angle = -90 + i * angleStep;
        const labelP = polarToCartesian(cx, cy, radius + 20, angle);
        return (
          <text key={i} x={labelP.x} y={labelP.y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-neutral-600 font-medium">
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}

// ============ Line Chart ============
interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export function LineChart({ data, height = 200, color = '#2563eb' }: LineChartProps) {
  const width = 500;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value)) * 1.1;
  const minVal = Math.min(...data.map(d => d.value)) * 0.9;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = padding.top + chartH * f;
        const val = Math.round(maxVal - (maxVal - minVal) * f);
        return (
          <g key={f}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-neutral-400">{val}</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#lineGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={color} strokeWidth={2} className="hover:r-6 transition-all" />
          <text x={p.x} y={padding.top + chartH + 18} textAnchor="middle" className="text-[10px] fill-neutral-500">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ============ Heatmap ============
interface HeatmapProps {
  units: { name: string; code: string; progress: number; status: 'on-track' | 'at-risk' | 'delayed' }[];
}

export function Heatmap({ units }: HeatmapProps) {
  const getColor = (status: string, progress: number) => {
    if (status === 'delayed' || progress < 50) return { bg: '#ef4444', text: 'white' };
    if (status === 'at-risk' || progress < 75) return { bg: '#f59e0b', text: 'white' };
    return { bg: '#22c55e', text: 'white' };
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {units.map((u, i) => {
        const c = getColor(u.status, u.progress);
        return (
          <div
            key={i}
            className="rounded-xl p-4 transition-all hover:scale-[1.02] cursor-pointer animate-fade-in"
            style={{ backgroundColor: c.bg, color: c.text }}
          >
            <div className="text-xs font-medium opacity-90 mb-1">{u.code}</div>
            <div className="text-sm font-semibold mb-2 truncate">{u.name}</div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{u.progress}%</span>
              <span className="text-xs opacity-90">
                {u.status === 'on-track' ? 'Đúng tiến độ' : u.status === 'at-risk' ? 'Nguy cơ chậm' : 'Chậm trễ'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ Timeline ============
interface TimelineProps {
  items: { unit: string; submitted: number; approved: number; pending: number; deadline: string; status: 'on-track' | 'at-risk' | 'delayed' }[];
}

export function Timeline({ items }: TimelineProps) {
  const statusColors = {
    'on-track': { dot: 'bg-success-500', bar: 'bg-success-500', label: 'Đúng tiến độ', badge: 'badge-green' },
    'at-risk': { dot: 'bg-warning-500', bar: 'bg-warning-500', label: 'Sát hạn', badge: 'badge-yellow' },
    'delayed': { dot: 'bg-danger-500', bar: 'bg-danger-500', label: 'Chậm trễ', badge: 'badge-red' },
  };

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => {
        const c = statusColors[item.status];
        const pct = item.submitted > 0 ? (item.approved / item.submitted) * 100 : 0;
        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${c.dot} flex-shrink-0 mt-1`} />
              {i < items.length - 1 && <div className="w-0.5 flex-1 bg-neutral-200 mt-1" />}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700">{item.unit}</span>
                <span className={c.badge}>{c.label}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                <span>Đã nộp: {item.submitted}</span>
                <span>Đã duyệt: {item.approved}</span>
                <span>Chờ duyệt: {item.pending}</span>
                <span>Hạn: {item.deadline}</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className={`h-full ${c.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
