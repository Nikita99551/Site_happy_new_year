import { Link } from 'react-router-dom';
import { SoonLink } from '@/shared/ui/soon-link/SoonLink';
import './Footer.scss';

/** Подвал: логотип, разделы, правила и согласие. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__row">
          <div>
            <img className="footer__logo" src="/img/logo.svg" alt="Аникс" width={136} height={36} />
            <p className="footer__tag">Рядом с&nbsp;вами. К&nbsp;Новому году.</p>
          </div>
          <nav className="footer__nav" aria-label="Разделы сайта">
            <Link to="/">Главная</Link><Link to="/route">Мой маршрут</Link><SoonLink>Условия</SoonLink><SoonLink>Подарки</SoonLink><Link to="/#partners">Партнёры</Link>
          </nav>
        </div>
        <div className="footer__bottom">
          <span>© Аникс, 2026–2027</span>
          <SoonLink>Правила акции</SoonLink>
          <SoonLink>Обработка персональных данных</SoonLink>
        </div>
      </div>
    </footer>
  );
}
