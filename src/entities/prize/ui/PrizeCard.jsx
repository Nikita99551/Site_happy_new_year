import './PrizeCard.scss';

export function PrizeCard({ prize, badge, final = false, price }) {
  return (
    <article className={`prize-card${final ? ' prize-card--wide' : ''}`}>
      {/* Плашка над фото, а не поверх: сам приз ничем не закрыт (правка 24.10) */}
      <div className="prize-card__top"><span className={`prize-card__badge${final ? ' prize-card__badge--final' : ''}`}>{badge}</span></div>
      <div className={`prize-card__pic${prize.cutout ? ' prize-card__pic--cutout' : ''}`}>
        <img src={prize.image} alt={prize.alt} width={final ? 900 : 800} height={final ? 900 : 800} loading="lazy" />
      </div>
      <div className="prize-card__body">
        <h3>{prize.title}</h3>
        {prize.model && <p className="prize-card__model">{prize.model}</p>}
        {price && <p className="prize-card__price">{price}</p>}
        {prize.note && <p className="prize-card__note">{prize.note}</p>}
      </div>
    </article>
  );
}
