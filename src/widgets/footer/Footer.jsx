import { Link } from 'react-router-dom';
import { SoonLink } from '@/shared/ui/soon-link/SoonLink';
import './Footer.scss';

/** Подвал: логотип, разделы, правила и согласие. compact — только нижняя строка (страницы-документы).
 *  adNote — пометка «Реклама» с данными рекламодателя (только страницы партнёров, Никита 13.11.2026). */
export function Footer({ compact = false, adNote = false }) {
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
              <Link to="/">Главная</Link><Link to="/route">Мой маршрут</Link><Link to="/conditions">Условия</Link><Link to="/prizes">Подарки</Link><Link to="/#partners">Партнёры</Link>
            </nav>
          </div>
        )}
        <div className="footer__bottom">
          <span>© Аникс, 2026–2027</span>
          <Link to="/rules">Правила акции</Link>
          <SoonLink>Обработка персональных данных</SoonLink>
        </div>
        {/* Пометка рекламы (Никита, 13.11.2026): только на страницах партнёров, текст дословно; неразрывные пробелы только против переносов */}
        {adNote && (
          <p className="footer__legal">
            РЕКЛАМА. РЕКЛАМОДАТЕЛЬ: ООО&nbsp;«ТОРГОВАЯ СЕТЬ АНИКС». ИНН&nbsp;2204039458. ЮРИДИЧЕСКИЙ АДРЕС: 659316, АЛТАЙСКИЙ КРАЙ,
            Г.&nbsp;БИЙСК, УЛ.&nbsp;СОЦИАЛИСТИЧЕСКАЯ, Д.&nbsp;5/1, ОФИС&nbsp;305. СРОК ПРОВЕДЕНИЯ АКЦИИ: С&nbsp;16.11.2026 ПО&nbsp;10.01.2027
            ВКЛЮЧИТЕЛЬНО. ПОДРОБНАЯ ИНФОРМАЦИЯ ОБ&nbsp;ОРГАНИЗАТОРЕ АКЦИИ, ПРАВИЛАХ ЕЁ&nbsp;ПРОВЕДЕНИЯ, КОЛИЧЕСТВЕ ПРИЗОВ, СРОКАХ, МЕСТЕ
            И&nbsp;ПОРЯДКЕ ИХ&nbsp;ПОЛУЧЕНИЯ РАЗМЕЩЕНА НА&nbsp;САЙТЕ PROMO.TDANIX.RU.
          </p>
        )}
      </div>
    </footer>
  );
}
