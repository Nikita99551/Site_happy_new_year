import { useEffect, useRef } from 'react';
import { PrizeCard, WEEKLY_PRIZES } from '@/entities/prize';
import { getProgress, useSeenStart, useSession, useStepAnimation } from '@/entities/user';
import { OpenModalButton, useModal } from '@/features/modal';
import { api } from '@/shared/api';
import { formatNumber } from '@/shared/lib/text';
import { useInView, useIsMobile } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/button/Button';
import { Carousel } from '@/shared/ui/carousel/Carousel';
import { CountUp } from '@/shared/ui/count-up/CountUp';
import { HeaderLights, Lights, StepRow, useGarlandSway } from '@/shared/ui/lights';
import { useParallax } from '@/shared/ui/parallax/useParallax';
import { Snow, SNOW_PUFF } from '@/shared/ui/snow/Snow';
import { SoonLink } from '@/shared/ui/soon-link/SoonLink';
import { CtaBanner } from '@/widgets/cta-banner/CtaBanner';
import { PageLayout } from '@/widgets/page-layout/PageLayout';
import { useCoverHero } from './lib/useCoverHero';
import { HowCards } from './ui/HowCards';
import { WINNERS } from './model/winners';
import { PrizeArt } from './ui/Winners';
import './HomePage.scss';

const d = (ms) => ({ '--d': `${ms}ms` });

/**
 * Параллакс первого экрана, от дальнего слоя к ближнему: бумажный фон и снег отстают, коза едет со страницей и растёт,
 * «2027» уходит вверх чуть быстрее страницы, даты/заголовок/текст/кнопки — ещё быстрее. Скорость растёт снизу вверх,
 * поэтому слои только расходятся и не наезжают друг на друга. «2027» нельзя делать отстающим: он у нижнего края и спрятался бы под рваный край
 */
const HERO_LIFT = { 'data-speed': -0.3 };

/**
 * Крупные снежинки первого экрана — главный видимый параллакс: стоят в пустом месте над козой и справа от заголовка,
 * ближние (крупные, ярче) улетают вверх быстрее страницы, дальние (мелкие, бледнее) отстают. Положение и размер — в HomePage.scss (.hero__flake--*)
 */
const HERO_FLAKES = [
  { k: 'a', speed: -0.45 },
  { k: 'b', speed: -0.2 },
  { k: 'c', speed: 0.3 },
  { k: 'd', speed: 0.35 },
  { k: 'e', speed: 0.2 },
];

/** Логотипы партнёров демонстрационные. ЗАПОЛНИТЬ: реальные партнёры и ссылки на их страницы. */
const PARTNERS = ['Молочный луг', 'Хлебный дом', 'Таёжный чай', 'Сладкий вечер', 'Сибирская ягода', 'Золотой колос', 'Родной источник'];

const winnersHead = (
  <div className="section-head reveal">
    <span className="ribbon ribbon--green">Победители прошлых акций</span>
    <h2>Они уже получили свои подарки</h2>
    <p className="lead">Это настоящие покупатели Аникс. Следующим можете стать вы.</p>
  </div>
);

/** Карточки победителей: вместо фото — рисунок приза с номером билета на «полароиде» */
const winnerCards = WINNERS.map((w, i) => (
  <article key={w.ticket} className="note-card reveal" style={d(i * 70)}>
    <img className="note-card__clip" src="/img/paperclip.webp" alt="" width={56} height={86} />
    <div className="note-card__photo"><PrizeArt kind={w.kind} label={w.prize} /><span>билет №&nbsp;{w.ticket}</span></div>
    <span className="note-card__badge burst">приз<br />получен</span>
    <h3>{w.name}</h3>
    <p className="note-card__city">{w.store}</p>
    <p className="note-card__prize"><small>Приз</small>{w.prize}</p>
  </article>
));

export function HomePage() {
  const { user, participants } = useSession();
  const mobile = useIsMobile();
  const { state: modal } = useModal();
  const me = user ?? api.sample();
  // Открытка «Ваш путь»: новые шаги зажигаются, когда открытка появляется на экране; цифры считают вместе с гирляндой
  const postcardRef = useRef(null);
  // Гирлянды откликаются на курсор: в шапке первого экрана и на открытке
  const heroRef = useRef(null);
  useGarlandSway(heroRef);
  useGarlandSway(postcardRef);
  // Параллакс: первый экран (фон и снег отстают, заголовок улетает быстрее, коза «выходит вперёд»), коллаж открытки,
  // коза из-за карточек, карточка графика «Акции в цифрах»
  useParallax(heroRef, { origin: 'top' });
  // Первый экран замирает, а блок «Как участвовать» наезжает на него рваным краем
  useCoverHero(heroRef);
  // Коза первого экрана подпрыгивает от нажатия, при приземлении из-под копыт летит снег
  const goatRef = useRef(null);
  useEffect(() => {
    const goat = goatRef.current;
    const hero = heroRef.current;
    if (!goat || !hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || /noanim/.test(location.search)) return;
    let timer = 0;
    const onClick = () => {
      if (goat.classList.contains('hero__goat--jump')) return;
      goat.classList.add('hero__goat--jump');
      // Приземление — на 68 % анимации goat-jump (750 мс)
      timer = window.setTimeout(() => {
        const r = goat.getBoundingClientRect();
        const detail = { x: r.left + r.width / 2, y: r.bottom - Math.min(60, r.height * 0.08), spread: r.width * 0.3 };
        hero.dispatchEvent(new CustomEvent(SNOW_PUFF, { detail }));
      }, 510);
    };
    const onEnd = (e) => {
      if (e.animationName === 'goat-jump') goat.classList.remove('hero__goat--jump');
    };
    goat.classList.add('hero__goat--toy');
    goat.addEventListener('click', onClick);
    goat.addEventListener('animationend', onEnd);
    return () => {
      window.clearTimeout(timer);
      goat.classList.remove('hero__goat--toy', 'hero__goat--jump');
      goat.removeEventListener('click', onClick);
      goat.removeEventListener('animationend', onEnd);
    };
  }, []);
  const postcardInView = useInView(postcardRef);
  const start = useSeenStart(user, 'home');
  const { pos, moving } = useStepAnimation({ from: start, to: { circle: me.circle, step: me.step }, run: postcardInView && !modal });
  const step = pos.step;
  const progress = getProgress(step);
  const weeksTotal = 8;
  const now = participants.length;
  const max = Math.max(...participants, 1);

  return (
    <PageLayout title="Год козы — лови призы · Новогодняя акция Аникс 2027" hero revealDeps={[user, mobile]}>
      {/* ===== Первый экран + «Как участвовать»: обёртка ограничивает, сколько первый экран стоит на месте, пока на него наезжает следующий блок ===== */}
      <div className="hero-stack">
        <section className="hero" ref={heroRef}>
          <div className="hero__bg" aria-hidden="true" data-speed={0.35} />
          <div className="hero__flakes" aria-hidden="true">
            {HERO_FLAKES.map((f) => <span key={f.k} className={`hero__flake hero__flake--${f.k}`} data-speed={f.speed} />)}
          </div>
          <Snow speed={0.45} />
          <HeaderLights className="hero__lights" />
          <div className="container hero__inner">
            <div className="hero__text">
              <span className="ribbon hero__dates reveal" {...HERO_LIFT}>16 ноября 2026 — 10 января 2027</span>
              <h1 className="reveal" style={d(80)} {...HERO_LIFT}>Год козы&nbsp;—<br />лови&nbsp;призы</h1>
              <p className="lead reveal" style={d(160)} {...HERO_LIFT}>Покупайте в&nbsp;Аникс и&nbsp;проходите новогодний маршрут из&nbsp;30&nbsp;шагов вместе с&nbsp;нашей Козой.</p>
              <div className="hero__actions reveal" style={d(240)} {...HERO_LIFT}>
                <OpenModalButton modal="receipt">Зарегистрировать чек</OpenModalButton>
                <SoonLink className="link">Условия акции</SoonLink>
              </div>
              <span className="hero__year reveal" style={d(320)} aria-label="2027 год" data-speed={-0.15}>2027</span>
            </div>
            <div className="hero__goat reveal" style={d(200)} ref={goatRef} data-grow={0.1}>
              <img src="/img/goat-dance.webp" alt="Коза в красном шарфе танцует" width={608} height={939} fetchPriority="high" />
            </div>
          </div>
        </section>
  
        {/* ===== Как участвовать ===== */}
        <section className="section section--cream torn-top how" id="how">
          <div className="container">
            <div className="steps-strip reveal">
              <div className="ticket steps-strip__ticket"><span className="ticket__stitch" /><span className="num">600&nbsp;₽</span><b>= 1&nbsp;шаг</b></div>
              <div className="milestone"><span className="seal"><span className="num">10</span></span><div><b>10‑й шаг</b><p>Розыгрыш сертификата Аникс на&nbsp;1&nbsp;500&nbsp;₽</p></div></div>
              <div className="milestone"><span className="seal"><span className="num">20</span></span><div><b>20‑й шаг</b><p>Розыгрыш сертификата Аникс на&nbsp;3&nbsp;000&nbsp;₽</p></div></div>
              <div className="milestone"><span className="seal seal--red"><span className="num">30</span></span><div><b>30‑й шаг — финиш</b><p>Билет на&nbsp;розыгрыш, главный&nbsp;— сертификат в&nbsp;«Манжерок»</p></div></div>
            </div>
            <div className="section-head reveal">
              <span className="ribbon ribbon--green">Как участвовать</span>
              <h2>Три шага до&nbsp;подарков</h2>
              <p className="lead">Регистрировать можно каждый чек от&nbsp;600&nbsp;₽.</p>
            </div>
            <div className="how__cards-wrap">
              {/* Коза поднимается из-за карточки по мере прокрутки и выше задуманного места не выходит */}
              <img className="how__peek reveal" src="/img/goat-peek.webp" alt="" width={230} height={266} />
              <HowCards />
            </div>
            <p className="how__more reveal"><SoonLink className="link">Подробно о&nbsp;том, как начисляются шаги&nbsp;→</SoonLink></p>
          </div>
        </section>
      </div>

      {/* ===== Акция в цифрах ===== */}
      <section className="section section--green torn-top" id="numbers">
        <div className="container numbers">
          <div className="reveal">
            <span className="ribbon">Акция в&nbsp;цифрах</span>
            <h2 style={{ marginTop: 24 }}>Восемь недель новогодних подарков</h2>
            <div className="numbers__rows">
              <div className="numbers__row"><div><b>Столько длится акция</b><p>С&nbsp;16&nbsp;ноября 2026 по&nbsp;10&nbsp;января 2027&nbsp;года.</p></div><div className="numbers__val"><CountUp value={8} /><small>недель</small></div></div>
              <div className="numbers__row"><div><b>Один круг маршрута</b><p>Каждые полные 600&nbsp;₽ в&nbsp;чеке&nbsp;— один шаг.</p></div><div className="numbers__val"><CountUp value={30} /><small>шагов</small></div></div>
              <div className="numbers__row"><div><b>Еженедельные розыгрыши</b><p>7&nbsp;недель по&nbsp;5&nbsp;призов, каждый до&nbsp;15&nbsp;000&nbsp;₽.</p></div><div className="numbers__val"><CountUp value={35} /><small>призов</small></div></div>
              <div className="numbers__row"><div><b>Финал 12&nbsp;января</b><p>Главный&nbsp;— сертификат на&nbsp;250&nbsp;000&nbsp;₽ на&nbsp;отдых на&nbsp;курорте «Манжерок» (Алтай).</p></div><div className="numbers__val"><CountUp value={5} /><small>призов</small></div></div>
            </div>
          </div>
          {/* Карточка графика отстаёт от текста слева (дальний слой), скрепка на ней едет быстрее (ближний) */}
          <div className="paper chart-card reveal" style={d(120)}>
            <img className="chart-card__clip" src="/img/paperclip.webp" alt="" width={110} height={169} />
            <h3>Уже <CountUp value={participants[now - 1] ?? 0} duration={1400} /> покупателей в&nbsp;пути</h3>
            <p className="chart-card__sub">Участников с&nbsp;начала акции, по&nbsp;неделям</p>
            <div className="chart" role="img" aria-label={`Участники по неделям: ${participants.map(formatNumber).join(', ')}; недели ${now + 1}–${weeksTotal} впереди`}>
              {Array.from({ length: weeksTotal }, (_, i) => {
                const value = participants[i];
                if (value === undefined) return <div key={i} className="chart__bar chart__bar--future"><div className="chart__fill" /></div>;
                const h = `${Math.round((value / max) * 92)}%`;
                return (
                  <div key={i} className={`chart__bar${i === now - 1 ? ' chart__bar--now' : ''}`} style={{ '--h': h, '--i': i }}>
                    <span className="chart__val">{formatNumber(value)}</span><div className="chart__fill" style={{ '--h': h }} />
                  </div>
                );
              })}
            </div>
            <div className="chart__labels">
              {Array.from({ length: weeksTotal }, (_, i) => {
                const n = i + 1;
                const cls = n < now ? 'is-past' : n === now ? 'is-now' : undefined;
                return <span key={n} className={cls}>{n}{n === now && <small>сейчас</small>}{n === weeksTotal && <small style={{ color: '#b98a2e' }}>финал</small>}</span>;
              })}
            </div>
            <p className="chart-card__note">Пример. Настоящие цифры появятся и&nbsp;будут обновляться каждую неделю акции.</p>
          </div>
        </div>
      </section>

      {/* ===== Ваш путь к подаркам ===== */}
      <section className="section section--white torn-top" id="path">
        <div className="container postcard-sec">
          <div className="reveal">
            <span className="ribbon ribbon--green">Мой маршрут</span>
            <h2 style={{ marginTop: 24 }}>Ваш путь к&nbsp;подаркам</h2>
            <p className="lead" style={{ marginTop: 20, maxWidth: 500 }}>Каждый чек&nbsp;— новые шаги по&nbsp;новогодней ёлке. Чеки, круги и&nbsp;ближайшие розыгрыши&nbsp;— на&nbsp;странице «Мой маршрут».</p>
            <Button to="/route">Посмотреть мой маршрут</Button>
          </div>
          {/* Коллаж разложен по слоям: красная бумага дальше открытки, марка, бирка, ветка и печать ближе — едут быстрее и сильнее следуют за курсором */}
          <div className="postcard-stack reveal" style={d(120)}>
            <div className="postcard-stack__red" aria-hidden="true" />
            <img className="postcard-stack__stamp" src="/img/stamp.webp" alt="" width={150} height={190} />
            <div className="postcard-stack__tag"><img src="/img/tag.webp" alt="" width={150} height={196} /><span>С Новым годом!</span></div>
            <div className="postcard" ref={postcardRef}>
              {/* Пунктирная строчка по краю: прошивается при прокрутке (маска рисует линию, сама линия — пунктир) */}
              <svg className="postcard__stitch" aria-hidden="true">
                <defs><mask id="postcard-stitch" maskUnits="userSpaceOnUse"><rect className="postcard__stitch-draw" width="100%" height="100%" pathLength={1} /></mask></defs>
                <rect className="postcard__stitch-line" width="100%" height="100%" mask="url(#postcard-stitch)" />
              </svg>
              <span className="postcard__label">{user ? 'Ваш маршрут' : 'Пример маршрута'}</span>
              <div className="postcard__big"><span key={step} className={`num${moving ? ' num--tick' : ''}`}>{step}</span><b>из 30 шагов</b></div>
              <p className="postcard__next">{step >= 30 ? <>Круг пройден&nbsp;— <em>билет на&nbsp;розыгрыш ваш!</em></> : <>До {progress.goalGen} на&nbsp;{progress.next}‑м шаге&nbsp;— <em>{progress.leftText}</em></>}</p>
              <div className="postcard__lights">
                {mobile ? (
                  // Телефон: три ряда по 10 шагов, лампочки и подписи крупнее (правка 24.10)
                  <div className="postcard__rows">
                    {[0, 1, 2].map((i) => <StepRow key={i} row={i} step={step} here={step > 0} labels moving={moving} />)}
                  </div>
                ) : (
                  <Lights count={30} lit={step} swags={3} labels={{ 10: '10', 20: '20', 30: '30 · финиш' }} here={step} start plain labelColor="#e2b24a" wire="#0b2417" fs={1.5} bulb={1} moving={moving} />
                )}
              </div>
            </div>
            <img className="postcard-stack__branch" src="/img/branch.webp" alt="" width={230} height={246} />
            <img className="postcard__seal" src="/img/seal.webp" alt="" width={120} height={131} />
          </div>
        </div>
      </section>

      {/* ===== 5 призов каждую неделю ===== */}
      <section className="section section--red torn-top" id="weekly">
        <Carousel
          head={
            <div className="section-head reveal" style={{ marginBottom: 0 }}>
              <span className="ribbon ribbon--cream">Еженедельные призы</span>
              <h2>5&nbsp;призов каждую неделю</h2>
              <p className="lead" style={{ color: 'rgba(255,248,232,.92)' }}>Участвуют все, кто прошёл круг. Каждый круг&nbsp;— ещё один билет.</p>
            </div>
          }
          after={<><p className="prize-note reveal">Изображения призов носят иллюстративный характер: внешний вид, цвет и&nbsp;комплектация призов могут отличаться.</p><div className="final-strip reveal"><span className="star-shape" /><p><b>А&nbsp;12&nbsp;января&nbsp;— финал</b>5&nbsp;суперпризов, главный&nbsp;— <span className="final-strip__prize">сертификат на&nbsp;250&nbsp;000&nbsp;₽</span> на&nbsp;отдых на&nbsp;курорте «Манжерок»</p><SoonLink className="btn">Посмотреть все призы</SoonLink></div></>}
        >
          {WEEKLY_PRIZES.map((p, i) => <PrizeCard key={p.id} prize={p} badge={`${i + 1} неделя`} />)}
        </Carousel>
      </section>

      {/* ===== Победители прошлых акций ===== */}
      <section className="section section--cream torn-top winners" id="winners">
        <img className="winners__goat reveal" src="/img/goat-gifts.webp" alt="" width={220} height={427} />
        {mobile ? (
          <Carousel head={winnersHead}>{winnerCards}</Carousel>
        ) : (
          <div className="container">
            {winnersHead}
            <div className="winners__grid">{winnerCards}</div>
          </div>
        )}
      </section>

      {/* ===== Партнёры ===== */}
      <section className="section section--plaid torn-top partners" id="partners">
        <div className="container">
          <div className="partners__paper-wrap reveal"><div className="partners__paper">
            <h2>Вместе с&nbsp;любимыми брендами</h2>
            <p className="lead">5&nbsp;товаров партнёров в&nbsp;чеке&nbsp;— ещё 1&nbsp;шаг к&nbsp;шагам за&nbsp;сумму покупки. Нажмите на&nbsp;логотип, чтобы открыть площадку партнёра.</p>
            <div className="partners__logos">
              {PARTNERS.map((name, i) => <SoonLink key={name}><img src={`/img/partner-${i + 1}.webp`} alt={name} width={480} height={270} loading="lazy" /></SoonLink>)}
            </div>
            <p className="partners__note">Примеры оформления партнёров · логотипы демонстрационные</p>
          </div></div>
        </div>
      </section>

      <CtaBanner
        title={<>Пусть Новый год начнётся с&nbsp;подарка</>}
        lead={<>Сохраните чек после покупки в&nbsp;Аникс. Каждые 600&nbsp;₽&nbsp;— ещё один шаг по&nbsp;маршруту.</>}
        actions={<OpenModalButton modal="receipt" className="btn--shine">Зарегистрировать чек</OpenModalButton>}
        goat={{ src: '/img/goat-jump.webp', width: 627, height: 829 }}
      />
    </PageLayout>
  );
}
