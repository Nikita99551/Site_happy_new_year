import { FONT_NUM } from '@/shared/ui/lights/geometry';

const G = '#173f2a';
const GD = '#0f2d1e';
const CR = '#fff8e8';
const RD = '#e31e24';
const RDD = '#b3121a';
const GO = '#e2b24a';
const SH = '#e6dbc2';

/** Бант на углу приза: подчёркивает, что это подарок */
function Bow({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L-6 16 L-1 13 L2 18 Z" fill={RDD} />
      <path d="M0 0 L7 15 L2 13 L1 18 Z" fill={RDD} />
      <ellipse cx={-8} cy={-3} rx={9} ry={5.5} transform="rotate(-25 -8 -3)" fill={RD} />
      <ellipse cx={8} cy={-3} rx={9} ry={5.5} transform="rotate(25 8 -3)" fill={RD} />
      <circle cx={0} cy={0} r={4} fill={RDD} />
    </g>
  );
}

const ART = {
  washer: (
    <>
      <rect x={40} y={34} width={80} height={104} rx={8} fill={CR} />
      <rect x={106} y={34} width={14} height={104} rx={6} fill={SH} />
      <rect x={40} y={34} width={80} height={20} rx={8} fill={SH} />
      <rect x={50} y={41} width={22} height={6} rx={3} fill={G} />
      <circle cx={104} cy={44} r={5} fill={RD} />
      <circle cx={90} cy={44} r={3} fill={GO} />
      <circle cx={78} cy={96} r={29} fill="#cfd9d1" />
      <circle cx={78} cy={96} r={29} fill="none" stroke={G} strokeWidth={5} />
      <circle cx={78} cy={96} r={20} fill="#9fc0c8" />
      <path d="M58 100 q5 -5 10 0 t10 0 t10 0 t10 0 L98 104 a20 20 0 0 1 -40 0 Z" fill="#6f9fac" />
      <path d="M64 86 a16 16 0 0 1 10 -8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      <rect x={46} y={136} width={10} height={5} rx={1} fill={G} />
      <rect x={104} y={136} width={10} height={5} rx={1} fill={G} />
      <Bow x={113} y={36} />
    </>
  ),
  tv: (
    <>
      <rect x={20} y={38} width={120} height={78} rx={7} fill={G} />
      <rect x={27} y={45} width={106} height={64} rx={3} fill="#2f6b4a" />
      <path d="M78 104 Q108 90 133 98 L133 109 L78 109 Z" fill="#f1e6cf" />
      <path d="M27 96 Q58 82 98 102 L98 109 L27 109 Z" fill={CR} />
      <path d="M96 99 l8 -22 l8 22 Z" fill={GD} />
      <path d="M98 92 l6 -16 l6 16 Z" fill={G} />
      <path d="M50 60 l2.5 6 l6.5 .5 l-5 4 l1.6 6.3 l-5.6 -3.4 l-5.6 3.4 l1.6 -6.3 l-5 -4 l6.5 -.5 Z" fill={GO} />
      <circle cx={80} cy={58} r={1.8} fill={CR} /><circle cx={118} cy={56} r={1.8} fill={CR} /><circle cx={70} cy={74} r={1.5} fill={CR} /><circle cx={124} cy={70} r={1.5} fill={CR} />
      <rect x={27} y={45} width={106} height={64} rx={3} fill="none" stroke={GD} strokeWidth={2} />
      <rect x={72} y={116} width={16} height={12} fill={GD} />
      <rect x={52} y={127} width={56} height={7} rx={3.5} fill={G} />
      <Bow x={30} y={40} />
    </>
  ),
  fridge: (
    <>
      <rect x={46} y={20} width={68} height={122} rx={10} fill={CR} />
      <rect x={100} y={20} width={14} height={122} rx={7} fill={SH} />
      <line x1={46} y1={64} x2={114} y2={64} stroke={SH} strokeWidth={4} />
      <rect x={53} y={36} width={6} height={18} rx={3} fill={G} />
      <rect x={53} y={74} width={6} height={30} rx={3} fill={G} />
      <path d="M88 82 c-4 -6 -12 -2 -8 4 l8 8 l8 -8 c4 -6 -4 -10 -8 -4 Z" fill={RD} />
      <path d="M88 34 l2 5 l5.5 .4 l-4.2 3.4 l1.4 5.4 l-4.7 -3 l-4.7 3 l1.4 -5.4 l-4.2 -3.4 l5.5 -.4 Z" fill={GO} />
      <rect x={70} y={104} width={20} height={14} rx={2} fill="#fff" transform="rotate(-6 80 111)" />
      <rect x={52} y={140} width={10} height={4} fill={G} /><rect x={98} y={140} width={10} height={4} fill={G} />
      <Bow x={100} y={22} />
    </>
  ),
  phone: (
    <>
      <rect x={52} y={18} width={56} height={118} rx={13} fill={G} />
      <rect x={57} y={23} width={46} height={108} rx={9} fill="#2f6b4a" />
      <rect x={71} y={28} width={18} height={5} rx={2.5} fill={GD} />
      <text x={80} y={56} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={15} fill={CR}>12:00</text>
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
        <rect key={`${r}${c}`} x={62 + c * 13} y={68 + r * 14} width={10} height={10} rx={3} fill={[GO, RD, CR][(r + c) % 3]} />
      )))}
      <rect x={70} y={124} width={20} height={3} rx={1.5} fill={CR} opacity={0.7} />
      <Bow x={102} y={22} />
    </>
  ),
  console: (
    <>
      <path d="M38 70 Q38 56 54 56 L106 56 Q122 56 122 70 L132 110 Q135 126 120 127 Q109 128 103 114 L97 104 L63 104 L57 114 Q51 128 40 127 Q25 126 28 110 Z" fill={G} />
      <path d="M50 66 L110 66" stroke="#2f6b4a" strokeWidth={3} strokeLinecap="round" />
      <rect x={45} y={76} width={22} height={7} rx={2} fill={CR} />
      <rect x={52.5} y={68.5} width={7} height={22} rx={2} fill={CR} />
      <circle cx={104} cy={72} r={4.5} fill={GO} />
      <circle cx={113} cy={80} r={4.5} fill={RD} />
      <circle cx={95} cy={80} r={4.5} fill={CR} />
      <circle cx={104} cy={88} r={4.5} fill="#8fb3a0" />
      <circle cx={68} cy={96} r={7} fill={GD} /><circle cx={92} cy={96} r={7} fill={GD} />
      <circle cx={68} cy={96} r={3} fill="#2f6b4a" /><circle cx={92} cy={96} r={3} fill="#2f6b4a" />
      <Bow x={80} y={58} />
    </>
  ),
  vacuum: (
    <>
      <line x1={96} y1={70} x2={56} y2={120} stroke="#8c978f" strokeWidth={11} strokeLinecap="round" />
      <line x1={96} y1={70} x2={56} y2={120} stroke="#c3cbc6" strokeWidth={4} strokeLinecap="round" />
      <rect x={22} y={114} width={68} height={22} rx={11} fill={G} />
      <rect x={31} y={122} width={50} height={5} rx={2.5} fill={GO} />
      <circle cx={32} cy={137} r={4} fill={GD} /><circle cx={80} cy={137} r={4} fill={GD} />
      <path d="M114 22 q22 0 20 28 q-1 12 -14 14" fill="none" stroke={G} strokeWidth={9} strokeLinecap="round" />
      <rect x={82} y={16} width={36} height={60} rx={15} fill={RD} />
      <rect x={87} y={28} width={26} height={32} rx={9} fill="#cfd9d1" />
      <line x1={92} y1={38} x2={108} y2={38} stroke="#9aa5a0" strokeWidth={2.5} />
      <line x1={92} y1={45} x2={108} y2={45} stroke="#9aa5a0" strokeWidth={2.5} />
      <line x1={92} y1={52} x2={108} y2={52} stroke="#9aa5a0" strokeWidth={2.5} />
      <circle cx={100} cy={70} r={8} fill={RDD} />
      <Bow x={52} y={116} />
    </>
  ),
};

/** Рисунок приза вместо фотографии победителя: ретро-открытка, лучи и снежинки на фоне */
export function PrizeArt({ kind, label }) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const b = a + Math.PI / 24;
    return `M80 84 L${(80 + 130 * Math.cos(a)).toFixed(1)} ${(84 + 130 * Math.sin(a)).toFixed(1)} L${(80 + 130 * Math.cos(b)).toFixed(1)} ${(84 + 130 * Math.sin(b)).toFixed(1)} Z`;
  });
  return (
    <svg viewBox="0 0 160 160" role="img" aria-label={label}>
      <rect width={160} height={160} fill="#f3ead7" />
      {rays.map((d) => <path key={d} d={d} fill={GO} opacity={0.16} />)}
      <circle cx={18} cy={20} r={2} fill="#fff" /><circle cx={140} cy={26} r={2.5} fill="#fff" /><circle cx={24} cy={128} r={2} fill="#fff" /><circle cx={142} cy={118} r={1.8} fill="#fff" />
      <ellipse cx={80} cy={144} rx={50} ry={6} fill={G} opacity={0.14} />
      {ART[kind]}
    </svg>
  );
}
