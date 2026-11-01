export const IconClose = (p) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden="true" {...p}><path d="M2 2l14 14M16 2L2 16" /></svg>
);
export const IconPin = ({ stroke = '#e31e24', ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.4} width={22} height={22} style={{ flex: 'none' }} aria-hidden="true" {...p}><path d="M12 22s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" /><circle cx={12} cy={10} r={2.6} /></svg>
);
export const IconUser = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" {...p}><circle cx={12} cy={8} r={4} /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
);
export const IconSearch = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#4e5f54" strokeWidth={2.5} width={22} height={22} style={{ flex: 'none' }} aria-hidden="true" {...p}><circle cx={10.5} cy={10.5} r={7} /><path d="M16 16l5 5" /></svg>
);
export const IconClock = (p) => (
  <svg viewBox="0 0 60 60" fill="none" stroke="#173f2a" strokeWidth={5} strokeLinecap="round" aria-hidden="true" {...p}><circle cx={30} cy={30} r={24} /><path d="M30 14v16l10 6" /></svg>
);
export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconArrowLeft = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" {...p}><path d="M15 5l-7 7 7 7" /></svg>
);
export const IconArrowRight = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" {...p}><path d="M9 5l7 7-7 7" /></svg>
);
/** Коробка партнёра для HTML-разметки (условия: «5 товаров = 1 шаг») */
export const IconBox = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><rect x={2} y={9} width={20} height={13} fill="#c9955a" stroke="#fff8e8" strokeWidth={1} /><rect x={1} y={5} width={22} height={5} fill="#b07b42" stroke="#fff8e8" strokeWidth={1} /><rect x={10} y={5} width={4} height={17} fill="#e31e24" /><rect x={2} y={14} width={20} height={3} fill="#e31e24" /><ellipse cx={9} cy={3} rx={3} ry={2} fill="#e31e24" /><ellipse cx={15} cy={3} rx={3} ry={2} fill="#e31e24" /></svg>
);
/** Подарок (легенда ёлки) */
export const IconGift = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><rect x={2} y={9} width={20} height={13} fill="#e31e24" /><rect x={1} y={6} width={22} height={4} fill="#b3121a" /><rect x={10} y={6} width={4} height={16} fill="#e2b24a" /></svg>
);
/** Коробка партнёра (легенда ёлки и шкала условий) */
export const IconCrate = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><rect x={2} y={9} width={20} height={13} fill="#c9955a" /><rect x={1} y={5} width={22} height={5} fill="#b07b42" /><rect x={10} y={5} width={4} height={17} fill="#e31e24" /></svg>
);
/* Купон промокода доставки «Торнадо» (правка 27.10): белый купон с вырезами, красный корешок со снежинкой, «%» — сразу видно скидку.
   Рисунок 32×22; CouponShapes — без обёртки, чтобы ставить и в отдельный значок, и внутрь ёлки */
const CouponShapes = () => (
  <>
    <path d="M2 0H30a2 2 0 0 1 2 2V8a3 3 0 0 0 0 6V20a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V14a3 3 0 0 0 0-6V2a2 2 0 0 1 2-2Z" fill="#fff8e8" stroke="#e31e24" strokeWidth={1.2} />
    <path d="M2 0H11V22H2a2 2 0 0 1-2-2V14a3 3 0 0 0 0-6V2a2 2 0 0 1 2-2Z" fill="#e31e24" />
    <line x1={11} y1={1.5} x2={11} y2={20.5} stroke="#fff8e8" strokeWidth={1} strokeDasharray="1.6 1.4" />
    <g stroke="#fff8e8" strokeWidth={1.1} strokeLinecap="round">
      <line x1={5.5} y1={7.6} x2={5.5} y2={14.4} /><line x1={2.6} y1={9.3} x2={8.4} y2={12.7} /><line x1={2.6} y1={12.7} x2={8.4} y2={9.3} />
    </g>
    <text x={21.5} y={15.6} textAnchor="middle" fontFamily="'Fira Sans Extra Condensed', 'Arial Narrow', sans-serif" fontWeight={900} fontSize={13} fill="#e31e24">%</text>
  </>
);
/** Купон промокода (легенда ёлки, «Условия», блок промокодов) */
export const IconCoupon = (p) => (
  <svg viewBox="-1 -1 34 24" aria-hidden="true" {...p}><CouponShapes /></svg>
);
/** Купон внутри другого SVG (ёлка): центр в x, y, ширина s, наклон rot */
export const CouponMark = ({ x, y, s, rot = -14 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s / 32}) translate(-16 -11)`} pointerEvents="none"><CouponShapes /></g>
);
export const IconStar = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><polygon points="12,2 14.9,8.6 22,9.3 16.6,14.1 18.2,21 12,17.3 5.8,21 7.4,14.1 2,9.3 9.1,8.6" fill="#e2b24a" /></svg>
);
/** Сертификат Аникс (вехи 10 и 20 на шкале условий, правка 01.11): зелёная карточка с золотой рамкой и красной лентой, как настоящий. Рисунок 32×22 */
export const IconCert = (p) => (
  <svg viewBox="0 0 32 22" aria-hidden="true" {...p}>
    <rect width={32} height={22} rx={2.5} fill="#1d4a31" />
    <rect x={2.4} y={2.4} width={27.2} height={17.2} rx={1.2} fill="none" stroke="#e2b24a" strokeWidth={0.8} />
    <rect x={5.5} y={5.6} width={11} height={1.8} rx={0.6} fill="#e2b24a" />
    <rect x={5.5} y={10} width={13} height={4.6} rx={1} fill="#fff8e8" />
    <polygon points="25.5,4.6 26.3,6.4 28.2,6.6 26.8,7.9 27.2,9.8 25.5,8.8 23.8,9.8 24.2,7.9 22.8,6.6 24.7,6.4" fill="#e2b24a" />
    <path d="M21 22 L32 11.5 V16 L25.6 22 Z" fill="#e31e24" />
  </svg>
);
/** Билет на розыгрыш (финиш 30-го шага): золотой билет с вырезами и красной звездой. Рисунок 32×22 */
export const IconTicket = (p) => (
  <svg viewBox="0 0 32 22" aria-hidden="true" {...p}>
    <path d="M2 0H30a2 2 0 0 1 2 2V8a3 3 0 0 0 0 6V20a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V14a3 3 0 0 0 0-6V2a2 2 0 0 1 2-2Z" fill="#e2b24a" />
    <line x1={10} y1={2} x2={10} y2={20} stroke="#fff8e8" strokeWidth={1.1} strokeDasharray="1.8 1.6" />
    <polygon points="21,4.5 22.7,8.4 26.9,8.8 23.7,11.6 24.7,15.7 21,13.5 17.3,15.7 18.3,11.6 15.1,8.8 19.3,8.4" fill="#e31e24" />
  </svg>
);
