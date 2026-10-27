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
/** Подарок (легенда ёлки) */
export const IconGift = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><rect x={2} y={9} width={20} height={13} fill="#e31e24" /><rect x={1} y={6} width={22} height={4} fill="#b3121a" /><rect x={10} y={6} width={4} height={16} fill="#e2b24a" /></svg>
);
/** Коробка партнёра (легенда ёлки) */
export const IconCrate = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><rect x={2} y={9} width={20} height={13} fill="#c9955a" /><rect x={1} y={5} width={22} height={5} fill="#b07b42" /><rect x={10} y={5} width={4} height={17} fill="#e31e24" /></svg>
);
export const IconStar = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><polygon points="12,2 14.9,8.6 22,9.3 16.6,14.1 18.2,21 12,17.3 5.8,21 7.4,14.1 2,9.3 9.1,8.6" fill="#e2b24a" /></svg>
);
