import { useId } from 'react';
import { FONT_NUM, FONT_TEXT, G_BURST, G_SCALLOP, G_STAR } from './geometry';
import { PartnerBox } from './PartnerBox';

// Ряд рисуется под ширину телефона (~330 px): 1 единица ≈ 1,1 px
const W = 300;
const X0 = 16;
const DX = 27;
const MX = 266;
const wireY = (x) => 8 + 30 * Math.sin((Math.PI * x) / W);

/**
 * Один ряд гирлянды из 10 шагов для телефона (правка 24.10): крупные лампочки, веха 10/20/30 и место под «вы здесь».
 * Используется тремя рядами на «Моём маршруте», в открытке на главной и на «Условиях».
 */
export function StepRow({ row, step, here = false, labels = true, partners = [], wire = '#0b2417', textColor = '#fff8e8', moving = false }) {
  const shadowId = useId();
  const first = row * 10 + 1;
  const milestone = first + 9;
  const hasHere = here && step >= first && step < milestone;
  const hasBoxes = partners.some((p) => p >= first && p < milestone);
  // Подпись сертификата в три строки — ряду с вехой 10/20 нужно чуть больше высоты
  const H = hasHere || hasBoxes ? 146 : labels && milestone !== 30 ? 126 : 100;
  const wirePath = Array.from({ length: 31 }, (_, i) => {
    const x = (i * W) / 30;
    return `${i ? 'L' : 'M'} ${x.toFixed(1)} ${wireY(x).toFixed(1)}`;
  }).join(' ');

  const bulbs = [];
  const boxes = [];
  let hx = 0;
  let hy = 0;
  for (let i = 0; i < 9; i++) {
    const n = first + i;
    const x = X0 + i * DX;
    const y = wireY(x);
    const on = n <= step;
    const cur = here && n === step;
    if (cur) {
      hx = x;
      hy = y + 34;
    }
    bulbs.push(
      <g key={n} className={`bulb${on ? ' bulb--on' : ''}${cur ? ' bulb--new' : ''}${moving && cur ? ' bulb--arrive' : ''}${moving && here && n === step - 1 ? ' bulb--lit' : ''}`}>
        {on && <ellipse cx={x} cy={y + 20} rx={14} ry={17} fill={cur ? '#e31e24' : '#e2b24a'} opacity={0.25} />}
        <rect x={x - 4.5} y={y - 1} width={9} height={7} rx={1.5} fill="#b98a2e" />
        <ellipse cx={x} cy={y + 19} rx={9.5} ry={12.5} fill={cur ? '#e31e24' : on ? '#e2b24a' : '#fff8e8'} opacity={on ? undefined : 0.35} />
      </g>,
    );
    if (partners.includes(n)) boxes.push(<PartnerBox key={`p${n}`} x={x} y={y + 52} s={24} />);
  }

  const my = 42;
  // «вы здесь» на двух последних лампочках ряда закрыл бы подпись вехи — тогда её не показываем (над гирляндой и так написано, сколько осталось)
  const labelHidden = hasHere && step >= milestone - 2;
  const done = step >= milestone;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="lights lights--row" aria-hidden="true">
      <defs>
        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx={0} dy={3} stdDeviation={3} floodColor="#000" floodOpacity={0.25} />
        </filter>
      </defs>
      <path d={wirePath} fill="none" stroke={wire} strokeWidth={2.5} strokeLinejoin="round" />
      {bulbs}
      {boxes}
      <g className={`milestone${moving && step === milestone ? ' milestone--pop' : ''}`}>
        {milestone === 30 ? (
          <>
            <path d={G_STAR} fill={done ? '#e2b24a' : '#f1d58a'} transform={`translate(${MX - 34.2 * 0.95} ${my - 36 * 0.95}) scale(0.95)`} filter={`url(#${shadowId})`} />
            <text x={MX} y={my + 9} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={22} fill="#173f2a">30</text>
          </>
        ) : (
          <>
            <path d={G_SCALLOP} fill="#e2b24a" transform={`translate(${MX - 29} ${my - 29}) scale(0.58)`} filter={`url(#${shadowId})`} />
            <text x={MX} y={my + 10} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={28} fill="#173f2a">{milestone}</text>
          </>
        )}
        {labels && milestone === 30 && <text x={MX} y={my + 50} textAnchor="middle" fontFamily={FONT_TEXT} fontWeight={800} fontSize={15} fill={textColor}>финиш</text>}
        {/* Сертификат — розыгрыш, а не подарок каждому (правка 27.10): три узкие строки по правому краю, чтобы не вылезать за ряд */}
        {labels && milestone !== 30 && !labelHidden && (
          <text x={W - 2} y={my + 46} textAnchor="end" fontFamily={FONT_TEXT} fontWeight={800} fill={textColor}>
            <tspan x={W - 2} fontSize={11} letterSpacing={1.2} opacity={0.8}>РОЗЫГРЫШ</tspan>
            <tspan x={W - 2} dy={16} fontSize={13}>сертификата</tspan>
            <tspan x={W - 2} dy={17} fontSize={15}>{milestone === 10 ? '1 500 ₽' : '3 000 ₽'}</tspan>
          </text>
        )}
      </g>
      {row === 0 && !(hx > 0 && hx < 60) && <text x={X0 - 10} y={78} fontFamily={FONT_TEXT} fontWeight={700} fontSize={13} fill={textColor}>Старт</text>}
      {hx > 0 && (
        <g key={hx} className={`lights__here${moving ? ' lights__here--pop' : ''}`}>
          <path d={G_BURST} fill="#e31e24" transform={`translate(${hx - 30} ${hy + 6}) scale(0.81)`} filter={`url(#${shadowId})`} />
          <text x={hx} y={hy + 33} textAnchor="middle" fontFamily={FONT_TEXT} fontWeight={800} fontSize={12} fill="#fff8e8">
            <tspan x={hx}>вы</tspan>
            <tspan x={hx} dy={13}>здесь</tspan>
          </text>
        </g>
      )}
    </svg>
  );
}
