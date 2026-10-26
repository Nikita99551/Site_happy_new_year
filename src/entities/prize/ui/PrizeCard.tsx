import type { Prize } from '../model/prizes';
import './PrizeCard.scss';

interface PrizeCardProps {
  prize: Prize;
  /** Плашка на фото: «Еженедельный приз» или «Финал · 12 января» */
  badge: string;
  /** Золотая плашка и широкая карточка (финал) */
  final?: boolean;
  /** Строка цены под названием */
  price?: string;
}

export function PrizeCard({ prize, badge, final = false, price }: PrizeCardProps) {
  return (
    <article className={`prize-card${final ? ' prize-card--wide' : ''}`}>
      {/* Плашка над фото, а не поверх: сам приз ничем не закрыт (правка 24.10) */}
      <div className="prize-card__top"><span className={`prize-card__badge${final ? ' prize-card__badge--gold' : ''}`}>{badge}</span></div>
      <div className="prize-card__pic">
        <img src={prize.image} alt={prize.alt} width={final ? 900 : 800} height={final ? 900 : 800} loading="lazy" />
      </div>
      <div className="prize-card__body">
        <h3>{prize.title}</h3>
        {price && <p className="prize-card__price">{price}</p>}
        <p className="prize-card__note">{prize.note}</p>
      </div>
    </article>
  );
}
