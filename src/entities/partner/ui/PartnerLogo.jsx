import './PartnerLogo.scss';

/** Если пара логотипов вместе шире этого (ширина / высота), в маленькой плитке оба выходят мелкими — показываем первый */
const PAIR_MAX_RATIO = 3.2;

/**
 * Логотип партнёра: один или два логотипа брендов рядом. Пока логотипа нет — название бренда текстом
 * (в духе сайта, а не серой заглушкой). alt — название партнёра, у второго логотипа пустой, чтобы не повторять.
 * compact — для плиток: длинную пару («Меленка» + «Большая кастрюля») сокращаем до главного логотипа.
 */
export function PartnerLogo({ partner, className = '', lazy = true, compact = false }) {
  const ratio = partner.logos.reduce((s, l) => s + l.w / l.h, 0);
  const logos = compact && partner.logos.length > 1 && ratio > PAIR_MAX_RATIO ? partner.logos.slice(0, 1) : partner.logos;
  const cls = ['plogo', logos.length > 1 && 'plogo--pair', className].filter(Boolean).join(' ');
  if (!logos.length) {
    return <span className={`${cls} plogo--text`}>{partner.title}</span>;
  }
  return (
    <span className={cls}>
      {logos.map((l, i) => (
        <img
          key={l.src} src={l.src} width={l.w} height={l.h} alt={i === 0 ? partner.title : ''}
          loading={lazy ? 'lazy' : undefined} decoding="async"
          // В паре ширина делится по форме логотипа (PartnerLogo.scss), поэтому оба выходят одной высоты
          style={{ '--ratio': (l.w / l.h).toFixed(3) }}
        />
      ))}
    </span>
  );
}
