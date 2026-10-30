import { Link } from 'react-router-dom';
import { SoonLink } from '@/shared/ui/soon-link/SoonLink';
import './Footer.scss';

/** Подвал: логотип, разделы, правила и согласие. compact — только нижняя строка (страницы-документы). */
export function Footer({ compact = false }) {
  return (
    <footer className="footer">
      <div className="container">
        {!compact && (
          <div className="footer__row">
            <div>
              <img className="footer__logo" src="/img/logo.svg" alt="Аникс" width={136} height={36} />
              <p className="footer__tag">Рядом с&nbsp;вами. К&nbsp;Новому году.</p>
            </div>
            <nav className="footer__nav" aria-label="Разделы сайта">
              <Link to="/">Главная</Link><Link to="/route">Мой маршрут</Link><Link to="/conditions">Условия</Link><SoonLink>Подарки</SoonLink><Link to="/#partners">Партнёры</Link>
            </nav>
          </div>
        )}
        <div className="footer__bottom">
          <span>© Аникс, 2026–2027</span>
          <Link to="/rules">Правила акции</Link>
          <SoonLink>Обработка персональных данных</SoonLink>
        </div>
      </div>
    </footer>
  );
}
