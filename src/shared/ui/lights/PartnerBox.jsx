/** Коробка партнёра (крафт с красной лентой) для SVG-гирлянды и ёлки. s — размер, x/y — центр. */
export function PartnerBox({ x, y, s }) {
  return (
    <g transform={`translate(${x - s / 2} ${y - s / 2})`} className="tree__box">
      <rect x={s * 0.08} y={s * 0.36} width={s * 0.84} height={s * 0.6} fill="#c9955a" stroke="#fff8e8" strokeWidth={1.5} />
      <rect x={s * 0.02} y={s * 0.22} width={s * 0.96} height={s * 0.2} fill="#b07b42" stroke="#fff8e8" strokeWidth={1.5} />
      <rect x={s * 0.42} y={s * 0.22} width={s * 0.16} height={s * 0.74} fill="#e31e24" />
      <rect x={s * 0.08} y={s * 0.6} width={s * 0.84} height={s * 0.12} fill="#e31e24" />
      <ellipse cx={s * 0.36} cy={s * 0.12} rx={s * 0.15} ry={s * 0.1} fill="#e31e24" />
      <ellipse cx={s * 0.64} cy={s * 0.12} rx={s * 0.15} ry={s * 0.1} fill="#e31e24" />
    </g>
  );
}
