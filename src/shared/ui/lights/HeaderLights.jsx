import { useRef } from 'react';
import { useElementWidth } from '@/shared/lib/hooks';

const COLORS = ['#e2b24a', '#e31e24', '#fff8e8'];

/** Гирлянда в шапке главной: длинные дуги на всю ширину, цвета по кругу. Ширина берётся из контейнера. */
export function HeaderLights({ className }) {
  const ref = useRef(null);
  const width = useElementWidth(ref);
  const W = Math.max(600, width || 1440);
  const H = 96;
  const swag = W / Math.max(1, Math.round(W / 720));
  const yAt = (x) => 14 + 44 * Math.sin(Math.PI * ((x % swag) / swag));
  const wire = ['M 0 ' + yAt(0)];
  for (let i = 1; i <= W / 10; i++) wire.push(`L ${i * 10} ${yAt(i * 10).toFixed(1)}`);
  const bulbs = [];
  for (let x = 36, i = 0; x < W; x += 60, i++) {
    const y = yAt(x);
    const col = COLORS[i % 3];
    bulbs.push(
      <g key={x} className="bulb bulb--on">
        <ellipse cx={x} cy={y + 15} rx={13} ry={16} fill={col === '#fff8e8' ? '#e2b24a' : col} opacity={0.28} />
        <rect x={x - 4} y={y - 1} width={8} height={7} fill="#b98a2e" />
        <ellipse cx={x} cy={y + 15} rx={7} ry={10} fill={col} />
      </g>,
    );
  }
  return (
    <div ref={ref} className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="lights" aria-hidden="true">
        <path d={wire.join(' ')} fill="none" stroke="#0b2417" strokeWidth={2.5} />
        {bulbs}
      </svg>
    </div>
  );
}
