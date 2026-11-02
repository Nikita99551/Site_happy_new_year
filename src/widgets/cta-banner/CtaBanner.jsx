import './CtaBanner.scss';

/** Финальный призыв с гирляндой сверху и козой справа. Есть на всех основных страницах. */
export function CtaBanner({ title, lead, actions, goat, cream = false, route = false }) {
  const cls = ['section', cream ? 'section--cream cta cta--cream' : 'section--green cta on-dark', route && 'cta--route'].filter(Boolean).join(' ');
  return (
    <section className={cls}>
      <div className="cta__garland" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => <img key={i} src="/img/garland.webp" alt="" width={974} height={250} loading="lazy" decoding="async" />)}
      </div>
      <div className="container cta__inner">
        <div className="reveal">
          <h2>{title}</h2>
          {lead && <p className="lead">{lead}</p>}
          <div className="cta__actions">{actions}</div>
        </div>
        <img
          className="cta__goat reveal" src={goat.src} alt="" width={goat.width} height={goat.height} loading="lazy"
          // Прыжок закончился — оставляем одно покачивание (почему — в CtaBanner.scss у .is-hopped)
          onAnimationEnd={(e) => { if (e.animationName === 'goat-hop-in') e.currentTarget.classList.add('is-hopped'); }}
        />
      </div>
    </section>
  );
}
