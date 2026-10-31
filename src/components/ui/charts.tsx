import React from 'react';

/**
 * Graphiques SVG légers (sans bibliothèque), lisibles sur mobile.
 * Chaque graphique a un titre accessible et un tableau de données caché pour les lecteurs d'écran.
 */
const A11yTable: React.FC<{ caption: string; rows: [string, string | number][] }> = ({ caption, rows }) => (
  <table className="sr-only">
    <caption>{caption}</caption>
    <tbody>
      {rows.map(([k, v]) => (
        <tr key={k}>
          <th scope="row">{k}</th>
          <td>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const BarChart: React.FC<{
  title: string;
  data: { label: string; value: number }[];
  unit?: string;
  height?: number;
}> = ({ title, data, unit = '', height = 120 }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / Math.max(1, data.length);
  return (
    <figure className="w-full">
      <svg viewBox={`0 0 100 ${height / 3}`} className="w-full h-auto" role="img" aria-label={title} preserveAspectRatio="none" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height / 3 - 6);
          return (
            <rect key={i} x={i * w + w * 0.15} width={w * 0.7} y={height / 3 - h} height={Math.max(h, d.value > 0 ? 0.8 : 0)} rx={0.8} className="fill-emerald-600 dark:fill-emerald-500">
              <title>{`${d.label} : ${d.value}${unit}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="flex text-[9px] text-stone-500 dark:text-stone-400 mt-1">
        {data.map((d, i) => (
          <span key={i} style={{ width: `${w}%` }} className="text-center truncate">{d.label}</span>
        ))}
      </div>
      <A11yTable caption={title} rows={data.map((d) => [d.label, `${d.value}${unit}`])} />
    </figure>
  );
};

export const HBars: React.FC<{ title: string; data: { label: string; value: number; max?: number; hint?: string }[]; unit?: string }> = ({ title, data, unit = '' }) => {
  const max = Math.max(1, ...data.map((d) => d.max ?? d.value));
  return (
    <figure className="space-y-2" aria-label={title}>
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-xs text-stone-700 dark:text-stone-300 mb-0.5">
            <span className="truncate">{d.label}</span>
            <span className="font-semibold">{d.value}{unit}{d.hint ? ` · ${d.hint}` : ''}</span>
          </div>
          <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
      <A11yTable caption={title} rows={data.map((d) => [d.label, `${d.value}${unit}`])} />
    </figure>
  );
};

export const LineChart: React.FC<{ title: string; points: { label: string; value: number }[]; min?: number; max?: number; unit?: string }> = ({
  title,
  points,
  min = 0,
  max: maxProp,
  unit = '',
}) => {
  const max = maxProp ?? Math.max(1, ...points.map((p) => p.value));
  const W = 300;
  const H = 110;
  const pad = 8;
  const xy = points.map((p, i) => [
    pad + (points.length <= 1 ? (W - 2 * pad) / 2 : (i / (points.length - 1)) * (W - 2 * pad)),
    H - pad - ((p.value - min) / Math.max(1, max - min)) * (H - 2 * pad),
  ]);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" role="img" aria-label={title}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pad} x2={W - pad} y1={pad + f * (H - 2 * pad)} y2={pad + f * (H - 2 * pad)} className="stroke-stone-200 dark:stroke-stone-800" strokeWidth={1} />
        ))}
        {points.length > 1 && <path d={d} fill="none" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth={2.5} strokeLinejoin="round" />}
        {xy.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} className="fill-amber-500">
            <title>{`${points[i].label} : ${points[i].value}${unit}`}</title>
          </circle>
        ))}
      </svg>
      <A11yTable caption={title} rows={points.map((p) => [p.label, `${p.value}${unit}`])} />
    </figure>
  );
};

export const Donut: React.FC<{ title: string; data: { label: string; value: number; color: string }[]; center?: React.ReactNode }> = ({ title, data, center }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 40;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <figure className="flex items-center gap-4">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" role="img" aria-label={title}>
          <circle cx="50" cy="50" r={R} fill="none" strokeWidth="14" className="stroke-stone-200 dark:stroke-stone-800" />
          {total > 0 &&
            data.map((d) => {
              const len = (d.value / total) * C;
              const el = <circle key={d.label} cx="50" cy="50" r={R} fill="none" stroke={d.color} strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
              offset += len;
              return el;
            })}
        </svg>
        {center && <div className="absolute inset-0 flex items-center justify-center text-center">{center}</div>}
      </div>
      <ul className="text-xs space-y-1">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} aria-hidden="true" />
            <span>{d.label}</span>
            <span className="font-bold">{d.value}</span>
          </li>
        ))}
      </ul>
      <A11yTable caption={title} rows={data.map((d) => [d.label, d.value])} />
    </figure>
  );
};

/** Calendrier d'activité des 5 dernières semaines (lundi → dimanche). */
export const ActivityGrid: React.FC<{ title: string; activeDays: Set<string>; today?: Date }> = ({ title, activeDays, today = new Date() }) => {
  const days: { iso: string; active: boolean; future: boolean }[] = [];
  const start = new Date(today);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 28);
  for (let i = 0; i < 35; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ iso, active: activeDays.has(iso), future: d > today });
  }
  return (
    <figure aria-label={title}>
      <div className="grid grid-cols-7 gap-1 max-w-56">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l, i) => (
          <span key={i} className="text-[9px] text-center text-stone-400">{l}</span>
        ))}
        {days.map((d) => (
          <span
            key={d.iso}
            title={d.iso}
            className={`aspect-square rounded ${d.future ? 'bg-transparent' : d.active ? 'bg-emerald-600' : 'bg-stone-200 dark:bg-stone-800'}`}
          />
        ))}
      </div>
      <figcaption className="sr-only">{`${title} : ${[...activeDays].length} jours actifs`}</figcaption>
    </figure>
  );
};
