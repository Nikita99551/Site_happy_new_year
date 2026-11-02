import { useId } from 'react';
import { CERT_AMOUNTS } from './certAmounts';
import './CertCard.scss';

/* Звезда-контур: центр (cx, cy), внешний радиус r */
const star = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  const rr = i % 2 ? r * 0.45 : r;
  return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
}).join(' ');

/**
 * Подарочный сертификат Аникс вектором (правка 02.11: прежние картинки 640×360 мылились на чётких экранах).
 * Рисунок 640×360 повторяет прежний: зелёная бумага, двойная золотая рамка, логотип, сумма крупно (кривые из Fira —
 * certAmounts.js), подпись про шаг, три звезды, красная лента в углу. Масштабируется без потерь.
 */
export function CertCard({ amount, step, className = '', style, label }) {
  const clip = useId();
  const sum = CERT_AMOUNTS[amount];
  return (
    <svg className={`cert-card ${className}`} style={style} viewBox="0 0 640 360" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <clipPath id={clip}><rect width="640" height="360" rx="18" /></clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="640" height="360" fill="#194327" />
        <image href="/img/paper-green.webp" width="640" height="360" preserveAspectRatio="xMidYMid slice" />
        <rect x="21" y="21" width="598" height="318" rx="9" fill="none" stroke="#c9c78e" strokeWidth="2" />
        <rect x="26.5" y="26.5" width="587" height="307" rx="6" fill="none" stroke="#c9c78e" strokeOpacity="0.35" strokeWidth="1" />
        <text className="cert-card__title" x="53" y="77">ПОДАРОЧНЫЙ СЕРТИФИКАТ</text>
        <image href="/img/logo.svg" x="51" y="91" width="163" height="43" />
        <path d={sum.d} transform="translate(48 246)" fill="#fff8e8" />
        <text className="cert-card__step" x="54" y="298">Разыгрывается на&nbsp;{step}‑м шаге</text>
        <g fill="none" stroke="#c9c78e" strokeWidth="1.6" strokeLinejoin="round">
          <polygon points={star(562, 70, 12)} />
          <polygon points={star(519, 102, 6.5)} />
          <polygon points={star(594, 111, 6.5)} />
        </g>
        <polygon points="441,330 471,300 531,360 471,360" fill="#e31e23" />
      </g>
    </svg>
  );
}
