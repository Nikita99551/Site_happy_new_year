import { FONT_NUM, FONT_TEXT } from './geometry';

export interface LightsProps {
  count?: number;
  /** Сколько огоньков горят золотым */
  lit?: number;
  /** С какого номера горят красным (только что начисленные) */
  newFrom?: number;
  /** Количество дуг провода */
  swags?: number;
  /** Подписи у вех: {10: '1 500 ₽', 30: 'финиш'} */
  labels?: Record<number, string>;
  /** Подписи под лампочками вместо печатей (открытка на главной) */
  plain?: boolean;
  /** Номер текущего шага: красный ярлык «вы здесь» */
  here?: number;
  /** Подпись «Старт» слева */
  start?: boolean;
  labelColor?: string;
  wire?: string;
  offColor?: string;
  /** Масштаб шрифтов */
  fs?: number;
  /** Масштаб лампочек */
  bulb?: number;
  /** Идёт анимация шагов: последняя зажжённая лампочка «прибывает» */
  moving?: boolean;
}

/** Простая гирлянда-синусоида: окна «чек обрабатывается / зарегистрирован», открытка на главной. */
export function Lights({ count = 30, lit = 0, newFrom = Infinity, swags = 3, labels, plain = false, here, start = false, labelColor = '#fff8e8', wire = '#0b2417', offColor = '#fff8e8', fs = 1, bulb: bs = 1, moving = false }: LightsProps) {
  const W = 1000;
  const H = labels ? (plain ? 110 + 100 * fs : 150) : 90;
  const SW = W / swags;
  const yAt = (x: number) => 10 + 38 * Math.sin(Math.PI * ((x % SW) / SW));
  const wirePath = ['M 0 ' + yAt(0)];
  for (let i = 1; i <= 200; i++) {
    const x = (i * W) / 200;
    wirePath.push(`L ${x.toFixed(1)} ${yAt(x).toFixed(1)}`);
  }
  const per = count / swags;
  const bulbX = (n: number) => {
    const seg = Math.floor((n - 1) / per);
    const k = (n - 1) % per;
    return seg * SW + ((k + 0.5) * (SW - 30)) / (per - 0.5) + 4;
  };

  const items = [];
  const plainLabels = [];
  for (let n = 1; n <= count; n++) {
    const bx = bulbX(n);
    const by = yAt(bx);
    const on = n <= lit;
    const isNew = (n >= newFrom && n <= lit) || (here !== undefined && n === lit && n === here);
    const isMilestone = !!labels && labels[n] !== undefined && !plain;
    const cls = `bulb${on ? ' bulb--on' : ''}${isNew ? ' bulb--new' : ''}${moving && n === lit ? ' bulb--arrive' : ''}${moving && n === lit - 1 ? ' bulb--lit' : ''}`;
    if (isMilestone) {
      items.push(
        <g key={n} className={cls}>
          <circle cx={bx} cy={by + 18} r={n === count ? 26 : 24} fill="#e2b24a" />
          <text x={bx} y={by + 27} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={26 * fs} fill="#173f2a">{n}</text>
          <text x={Math.min(bx, W - 40)} y={by + 68} textAnchor={n === count ? 'end' : 'middle'} fontFamily={FONT_TEXT} fontWeight={800} fontSize={16 * fs} fill={labelColor}>{labels![n]}</text>
        </g>,
      );
      continue;
    }
    items.push(
      <g key={n} className={cls}>
        {on && <ellipse cx={bx} cy={by + 5 + 12 * bs} rx={14 * bs} ry={18 * bs} fill={isNew ? '#e31e24' : '#e2b24a'} opacity={0.28} />}
        <rect x={bx - 4 * bs} y={by - 2} width={8 * bs} height={7 * bs} fill="#b98a2e" />
        <ellipse cx={bx} cy={by + 5 + 12 * bs} rx={8 * bs} ry={12 * bs} fill={isNew ? '#e31e24' : on ? '#e2b24a' : offColor} opacity={on ? undefined : 0.3} />
      </g>,
    );
    if (plain && labels && labels[n]) {
      plainLabels.push(
        <text key={`l${n}`} x={Math.min(bx, W - 4)} y={100 + 10 * fs} textAnchor={n === count ? 'end' : 'middle'} fontFamily={FONT_TEXT} fontWeight={800} fontSize={20 * fs} fill={labelColor}>{labels[n]}</text>,
      );
    }
  }

  let hereMark = null;
  if (here) {
    const hx = bulbX(here);
    const hy = plain ? 72 + 26 * fs : yAt(hx) + 40;
    const hr = plain ? 40 * fs : 32;
    const hr2 = hr * 0.8;
    const pts = [];
    for (let q = 0; q < 28; q++) {
      const a = (q / 28) * Math.PI * 2 - Math.PI / 2;
      const rr = q % 2 ? hr2 : hr;
      pts.push(`${(hx + rr * Math.cos(a)).toFixed(1)} ${(hy + hr + rr * Math.sin(a)).toFixed(1)}`);
    }
    const k = hr / 32;
    hereMark = (
      <g key={here} className={`lights__here${moving ? ' lights__here--pop' : ''}`}>
        <path d={`M ${pts.join(' L ')} Z`} fill="#e31e24" />
        <text x={hx} y={hy + hr - 3 * k} textAnchor="middle" fontFamily={FONT_TEXT} fontWeight={800} fontSize={12 * k} fill="#fff8e8">
          <tspan x={hx}>вы</tspan>
          <tspan x={hx} dy={13 * k}>здесь</tspan>
        </text>
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="lights" aria-hidden="true">
      <path d={wirePath.join(' ')} fill="none" stroke={wire} strokeWidth={2.5 * bs} />
      {items}
      {plainLabels}
      {start && <text x={0} y={68} fontFamily={FONT_TEXT} fontWeight={700} fontSize={16 * fs} fill={labelColor} opacity={0.8}>Старт</text>}
      {hereMark}
    </svg>
  );
}
