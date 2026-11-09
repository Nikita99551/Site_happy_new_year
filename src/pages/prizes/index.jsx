import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { CertCard, FINAL_PRIZES, PrizeCard, WEEKLY_PRIZES } from '@/entities/prize';
import { OpenModalButton } from '@/features/modal';
import { CAMPAIGN } from '@/shared/config/campaign';
import { Carousel } from '@/shared/ui/carousel/Carousel';
import { CountUp } from '@/shared/ui/count-up/CountUp';
import { useGarlandSway } from '@/shared/ui/lights';
import { Snow } from '@/shared/ui/snow/Snow';
import { CtaBanner } from '@/widgets/cta-banner/CtaBanner';
import { PageLayout } from '@/widgets/page-layout/PageLayout';
import './PrizesPage.scss';

const d = (ms) => ({ '--d': `${ms}ms` });
// Плитки первого экрана — маленькие копии из img/thumbs (скрипты/миниатюры-призов.py, 08.11: страница грузилась долго).
// Размытое превью Алтая 48×24 (оттуда же): видно сразу, пока грузится большое фото, — вместо белой карточки
const ALTAI_BLUR = 'data:image/webp;base64,UklGRl4BAABXRUJQVlA4IFIBAABwBwCdASowABgAPsFUoUwnpKMiKqoA8BgJYwC9i7AKWRyHmSfBgVpig+H82A/m5rHqRinhkcf13909UT1xu2zUrTmIiAD+/VQ7E7fs/L/hW+12unQy+Xu/bz65F+qaSx/V9+WYIJEiIgwfZYLBrvlavFZv9QT28iDs+shYhwXLNM8tqKYSe8mZ05Mqk7O9R3+1Dj0BKMiEAgH00eL/idCQ41/TQAX+dQciDRGEyGxUvkXMNIEeKjQrOWPbuPA+2rcQsGk8aNOWyerEttjb+AQtC75etPKlJzJdIgvICSLo9wZu71M7CCDjaaf2k2tW4bgXw7EcbUe5EItiQx89HwCCobXN/8NYZm+j8Jz8oOZ380QOhPhWPLFsTsWtDVBCZivj8hFdq3xFt69un4SF3sPgjr4qzwUmG10OA47lnUNR9zkeSs5c4LFNLsc855A9YxAAAA==';

export default function PrizesPage() {
  // Бирки недель висят на верёвке и чуть покачиваются, когда мимо проводят мышью
  const calendarRef = useRef(null);
  useGarlandSway(calendarRef, { selector: '.cal-tag', reach: 120, maxAngle: 5, yWeight: 0.25 });
  return (
    <PageLayout title="Подарки · Новогодняя акция Аникс 2027">
      {/* ===== Первый экран ===== */}
      <section className="section section--green prizes-hero on-dark">
        <Snow />
        <img className="prizes-hero__goat reveal" src="/img/goat-gifts.webp" alt="" width={290} height={562} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="ribbon reveal">Подарки акции</span>
          <h1 className="reveal" style={d(60)}>Розыгрыши за&nbsp;шаги.<br /> Призы за&nbsp;весь круг.</h1>
          <p className="lead reveal" style={d(120)}>Проходите маршрут из&nbsp;30&nbsp;шагов и&nbsp;участвуйте в&nbsp;розыгрышах сертификатов Аникс и&nbsp;новогодних призов.</p>
          {/* Цифры с картинками (правка 28.10): видно, что стоит за числом; бирка ведёт к своему разделу ниже */}
          <div className="pfacts reveal" style={d(200)}>
            <Link className="pfact" to="#certs">
              <span className="pfact__pic pfact__pic--certs" aria-hidden="true">
                <CertCard amount="1500" step={10} />
                <CertCard amount="3000" step={20} />
              </span>
              <span className="pfact__text"><CountUp value={2} duration={700} /><small>розыгрыша сертификатов на&nbsp;пути круга</small></span>
            </Link>
            <Link className="pfact" to="#weekly">
              <span className="pfact__pic pfact__pic--weekly" aria-hidden="true">
                <img src="/img/thumbs/prize-w2-airfryer-kitfort.webp" alt="" width={429} height={440} />
                <img src="/img/thumbs/prize-w4-coffee-delonghi.webp" alt="" width={312} height={440} />
                <img src="/img/thumbs/prize-w1-yandex-station.webp" alt="" width={440} height={375} />
                <img src="/img/thumbs/prize-w7-robot-dreame.webp" alt="" width={440} height={321} />
              </span>
              <span className="pfact__tag">5&nbsp;призов × 7&nbsp;недель</span>
              <span className="pfact__text"><CountUp value={35} /><small>еженедельных призов</small></span>
            </Link>
            <Link className="pfact" to="#main-prize">
              <span className="pfact__pic pfact__pic--final" aria-hidden="true">
                <img src="/img/thumbs/final-tv-xiaomi.webp" alt="" width={440} height={274} />
                <img src="/img/thumbs/final-dyson.webp" alt="" width={244} height={440} />
                <img src="/img/thumbs/final-ps5.webp" alt="" width={227} height={440} />
                <span className="pfact__photo"><img src="/img/thumbs/altai.webp" alt="" width={400} height={300} /><i>Манжерок</i></span>
                <img src="/img/thumbs/final-iphone.webp" alt="" width={365} height={440} />
              </span>
              <span className="pfact__text"><CountUp value={5} duration={800} /><small>суперпризов в&nbsp;финале</small></span>
            </Link>
          </div>
          <p className="prizes-hero__note reveal" style={d(260)}>Изображения призов носят иллюстративный характер: внешний вид, цвет и&nbsp;комплектация призов могут отличаться.</p>
        </div>
      </section>

      {/* ===== Суперприз «Манжерок» — самый крупный из 5 (правка 09.11: главных призов пять, не один) ===== */}
      <section className="section section--cream torn-top" id="main-prize">
        <div className="container main-prize">
          <div className="reveal">
            <span className="ribbon ribbon--green">Суперприз · финал</span>
            <h2 style={{ marginTop: 24 }}>Сертификат на&nbsp;250&nbsp;000&nbsp;₽ на&nbsp;курорт «Манжерок»</h2>
            <p className="lead">Самый крупный из&nbsp;5&nbsp;суперпризов финального розыгрыша 12&nbsp;января 2027&nbsp;года&nbsp;— отдых на&nbsp;всесезонном курорте «Манжерок» в&nbsp;Горном Алтае. Участвуют все, кто прошёл 30&nbsp;шагов.</p>
          </div>
          <div className="main-prize__wrap reveal" style={d(120)}>
            <img className="main-prize__branch" src="/img/branch.webp" alt="" width={200} height={214} loading="lazy" decoding="async" />
            <figure className="photo-card" style={{ margin: 0 }}>
              <span className="photo-card__tape" aria-hidden="true" />
              <img src="/img/altai.webp" alt="Зимний Алтай: горы, река и ели" width={1400} height={700} decoding="async" style={{ background: `center / cover url(${ALTAI_BLUR})` }} />
              <figcaption>Алтай</figcaption>
            </figure>
            <span className="seal seal--red main-prize__badge"><span className="num">1</span><small>из&nbsp;5<br />призов</small></span>
            <img className="main-prize__stamp" src="/img/stamp.webp" alt="" width={150} height={190} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      {/* ===== Финал: ещё 4 суперприза ===== */}
      <section className="section section--green torn-top on-dark" id="final">
        <Carousel label="Суперпризы финала" head={
          <div className="section-head reveal" style={{ marginBottom: 0 }}>
            <span className="ribbon">Финал · 12&nbsp;января</span>
            <h2>Ещё 4 суперприза в&nbsp;финале</h2>
            <p className="lead">По&nbsp;одному суперпризу каждого вида. Розыгрыш&nbsp;— 12&nbsp;января 2027&nbsp;года.</p>
          </div>
        }>
          {FINAL_PRIZES.map((p) => <PrizeCard key={p.id} prize={p} badge="Финал · 12 января" final />)}
        </Carousel>
      </section>

      {/* ===== Еженедельные призы ===== */}
      <section className="section section--red torn-top" id="weekly">
        <Carousel label="Еженедельные призы" head={
          <div className="section-head reveal" style={{ marginBottom: 0 }}>
            <span className="ribbon ribbon--cream">Еженедельные призы</span>
            <h2>5&nbsp;призов каждую неделю</h2>
            <p className="lead" style={{ color: 'rgba(255,248,232,.92)' }}>Участвует каждый, у&nbsp;кого есть хотя&nbsp;бы один шаг. Для&nbsp;этого хватит одного чека от&nbsp;600&nbsp;₽.</p>
          </div>
        } after={<p className="prize-note reveal">Изображения призов носят иллюстративный характер: внешний вид, цвет и&nbsp;комплектация призов могут отличаться.</p>}>
          {WEEKLY_PRIZES.map((p, i) => <PrizeCard key={p.id} prize={p} badge={`${i + 1} неделя`} />)}
        </Carousel>
      </section>

      {/* ===== Сертификаты ===== */}
      <section className="section section--cream torn-top" id="certs">
        <div className="container">
          <div className="section-head reveal">
            <span className="ribbon ribbon--green">Сертификаты Аникс</span>
            <h2>Розыгрыш сертификатов<br /> ещё до&nbsp;финиша</h2>
            <p className="lead">Дошли до&nbsp;10‑го или 20‑го шага&nbsp;— можете получить подарочный сертификат Аникс: его получает каждый 30‑й и&nbsp;каждый 100‑й участник недели.</p>
          </div>
          <div className="certs">
            <CertCard className="reveal" amount="1500" step={10} label="Подарочный сертификат Аникс на 1 500 ₽, каждому 30-му на 10-м шаге" />
            <CertCard className="reveal" style={d(100)} amount="3000" step={20} label="Подарочный сертификат Аникс на 3 000 ₽, каждому 100-му на 20-м шаге" />
          </div>
          <p className="certs__note">Счёт участников идёт внутри каждой недели и&nbsp;начинается заново. Подробнее&nbsp;— <Link className="link" to="/conditions#circle">на&nbsp;странице условий акции</Link>.</p>
        </div>
      </section>

      {/* ===== Календарь розыгрышей ===== */}
      <section className="section section--green torn-top on-dark" id="calendar">
        <div className="container">
          <div className="section-head reveal">
            <span className="ribbon">Календарь розыгрышей</span>
            <h2>Один шаг&nbsp;—<br /> и&nbsp;вы в&nbsp;розыгрыше</h2>
            <p className="lead">В&nbsp;еженедельных розыгрышах участвует каждый, у&nbsp;кого есть хотя&nbsp;бы один шаг. В&nbsp;финал 12&nbsp;января попадают те, кто прошёл круг из&nbsp;30&nbsp;шагов. Каждый новый круг даёт ещё один билет в&nbsp;финал, и&nbsp;шансов выиграть суперприз становится больше.</p>
          </div>
          <div className="calendar reveal" ref={calendarRef}>
            <svg className="calendar__wire" viewBox="0 0 1312 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 C 220 44 440 44 656 8 C 872 44 1092 44 1312 8" fill="none" stroke="#e2b24a" strokeWidth={2.5} /></svg>
            <div className="calendar__row">
              {CAMPAIGN.weeklyDraws.map((date, i) => (
                <div key={date} className="cal-tag"><span className="cal-tag__hole" /><small>Неделя</small><span className="num">{i + 1}</span><b>5 призов</b></div>
              ))}
              <div className="cal-tag cal-tag--final"><span className="cal-tag__hole" /><span className="cal-tag__frame" aria-hidden="true" /><span className="cal-tag__date"><span className="star-shape" />12&nbsp;января · финал</span><b>5&nbsp;суперпризов: отдых на&nbsp;курорте «Манжерок», iPhone, стайлер Dyson, телевизор и&nbsp;PlayStation&nbsp;5</b></div>
            </div>
            <div className="calendar__notes">
              <p>Еженедельный приз стоит до&nbsp;15&nbsp;000&nbsp;₽. Участвуют все, у&nbsp;кого к&nbsp;дате розыгрыша есть хотя&nbsp;бы один шаг. В&nbsp;финале участвуют билеты: один пройденный круг&nbsp;— один билет.</p>
              <p>Розыгрыши&nbsp;— по&nbsp;вторникам: 24&nbsp;ноября, 1, 8, 15, 22 и&nbsp;29&nbsp;декабря, 5&nbsp;января. Финал&nbsp;— 12&nbsp;января 2027&nbsp;года. Победителей выбирает программа случайным образом. Результаты публикуем на&nbsp;этом сайте на&nbsp;следующий день. <Link className="link" style={{ color: '#e2b24a' }} to="/rules">Полные правила&nbsp;→</Link></p>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner cream title={<>Зарегистрируйте чек&nbsp;— и&nbsp;вы в&nbsp;розыгрыше недели</>} actions={<OpenModalButton modal="receipt">Зарегистрировать чек</OpenModalButton>} goat={{ src: '/img/goat-dance-wink.webp', width: 656, height: 958 }} />
    </PageLayout>
  );
}
