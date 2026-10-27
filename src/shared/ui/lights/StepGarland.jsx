import { useId } from 'react';
import { FONT_NUM, FONT_TEXT, G_BURST, G_SCALLOP, G_STAR, G_WIRE_PATH, wireY } from './geometry';
import { PartnerBox } from './PartnerBox';

/**
 * Гирлянда шагов 1:1 по макету: три дуги по 10 шагов, лампочки 20×28, вехи 10/20 — зубчатый круг, 30 — звезда.
 * Используется на «Моём маршруте» (прогресс) и на «Условиях» (шкала круга).
 */
export function StepGarland({ step, here = false, labels = true, partners = [], wire = '#0b2417', textColor = '#fff8e8', startSolid = false, height, segment, moving = false }) {
  const H = height ?? (labels ? 170 : 150);
  const SW = 1312 / 3;
  const shadowId = useId();
  const bulbs = [];
  const milestones = [];
  const partnerBoxes = [];
  let hereX = 0;
  let hereY = 0;

  for (let n = 1; n <= 30; n++) {
    const s = Math.floor((n - 1) / 10);
    const k = (n - 1) % 10;
    if (segment !== undefined && s !== segment) continue;
    if (k === 9) {
      const mx = (s + 1) * SW;
      if (n === 30) {
        // Центр звезды G_STAR (описанная окружность R = 36): x = sx, y = 36; цифры по центру — базовая линия ≈ 36 + половина высоты цифр
        const sx = 1274.2;
        milestones.push(
          <g key={n} className={`milestone${moving && step === 30 ? ' milestone--pop' : ''}`}>
            <path d={G_STAR} fill="#e2b24a" transform={`translate(${sx - 34.2} 0)`} filter={`url(#${shadowId})`} />
            <text x={sx} y={45} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={24} fill="#173f2a" pointerEvents="none">30</text>
            {labels && <text x={sx} y={97} textAnchor="middle" fontFamily={FONT_TEXT} fontWeight={800} fontSize={17} fill={textColor} pointerEvents="none">финиш</text>}
          </g>,
        );
      } else {
        // Сертификат — розыгрыш, а не подарок каждому: мелкая строка «РОЗЫГРЫШ» над суммой (правка 27.10).
        // Если «вы здесь» висит на соседней лампочке, подпись прячется — их не наложить друг на друга, а текст над гирляндой и так говорит, сколько осталось
        const nearHere = here && Math.abs(step - n) === 1;
        milestones.push(
          <g key={n} className="milestone">
            <path d={G_SCALLOP} fill="#e2b24a" transform={`translate(${mx - 36} -2) scale(0.72)`} filter={`url(#${shadowId})`} />
            <text x={mx} y={46} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={34} fill="#173f2a" pointerEvents="none">{n}</text>
            {labels && !nearHere && (
              <text x={mx} y={93} textAnchor="middle" fontFamily={FONT_TEXT} fontWeight={800} fill={textColor} pointerEvents="none">
                <tspan x={mx} fontSize={12} letterSpacing={1.5} opacity={0.8}>РОЗЫГРЫШ</tspan>
                <tspan x={mx} dy={20} fontSize={17}>сертификата {n === 10 ? '1 500 ₽' : '3 000 ₽'}</tspan>
              </text>
            )}
          </g>,
        );
      }
      continue;
    }
    const x = s * SW + 24.9 + 41.82 * k;
    const y = wireY(x) + 10;
    const on = n <= step;
    const cur = here && n === step;
    if (cur) {
      hereX = x;
      hereY = y + 21;
    }
    bulbs.push(
      <g key={n} className={`bulb${on ? ' bulb--on' : ''}${cur ? ' bulb--new' : ''}${moving && cur ? ' bulb--arrive' : ''}${moving && here && n === step - 1 ? ' bulb--lit' : ''}`}>
        {on && <ellipse cx={x} cy={y + 21} rx={16} ry={20} fill={cur ? '#e31e24' : '#e2b24a'} opacity={0.22} />}
        <rect x={x - 5} y={y} width={10} height={8} fill="#b98a2e" />
        <ellipse cx={x} cy={y + 21} rx={10} ry={14} fill={cur ? '#e31e24' : on ? '#e2b24a' : '#fff8e8'} opacity={on ? undefined : 0.3} />
      </g>,
    );
    if (partners.includes(n)) {
      partnerBoxes.push(
        <g key={`p${n}`}>
          <line x1={x} y1={y + 36} x2={x} y2={y + 54} stroke="#173f2a" strokeWidth={1.5} />
          <PartnerBox x={x} y={y + 72} s={36} />
        </g>,
      );
    }
  }

  return (
    <svg viewBox={segment === undefined ? `0 0 1312 ${H}` : `${segment * SW - 8} 0 ${SW + 50} ${H}`} className="lights" aria-hidden="true" style={segment === undefined ? undefined : { overflow: 'hidden' }}>
      <defs>
        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx={0} dy={4} stdDeviation={4} floodColor="#000" floodOpacity={0.25} />
        </filter>
      </defs>
      <path d={G_WIRE_PATH} fill="none" stroke={wire} strokeWidth={3} strokeLinejoin="round" />
      {bulbs}
      {partnerBoxes}
      {milestones}
      {(segment ?? 0) === 0 && <text x={0} y={77} textAnchor="start" fontFamily={FONT_TEXT} fontWeight={700} fontSize={17} fill={textColor} opacity={startSolid ? undefined : 0.75} pointerEvents="none">Старт</text>}
      {hereX > 0 && (
        <g key={hereX} className={`lights__here${moving ? ' lights__here--pop' : ''}`}>
          <path d={G_BURST} fill="#e31e24" transform={`translate(${hereX - 37} ${hereY + 25})`} filter={`url(#${shadowId})`} />
          <text x={hereX} y={hereY + 61} textAnchor="middle" fontFamily={FONT_TEXT} fontWeight={800} fontSize={14} fill="#fff8e8">
            <tspan x={hereX}>вы</tspan>
            <tspan x={hereX} dy={14}>здесь</tspan>
          </text>
        </g>
      )}
    </svg>
  );
}
