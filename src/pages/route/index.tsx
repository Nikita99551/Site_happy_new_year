import { useMemo, useRef } from 'react';
import { getProgress, useSeenStart, useSession, useStepAnimation } from '@/entities/user';
import { OpenModalButton, useModal } from '@/features/modal';
import { api } from '@/shared/api';
import { launchConfetti } from '@/shared/lib/confetti';
import { useReducedMotion } from '@/shared/lib/hooks';
import { circleName, plural } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { IconCrate, IconGift, IconStar } from '@/shared/ui/icons/Icons';
import { StepGarland, StepRow, useGarlandSway } from '@/shared/ui/lights';
import { Snow } from '@/shared/ui/snow/Snow';
import { useToast } from '@/shared/ui/toast/context';
import { CtaBanner } from '@/widgets/cta-banner/CtaBanner';
import { PageLayout } from '@/widgets/page-layout/PageLayout';
import { RouteTree } from '@/widgets/route-tree/RouteTree';
import { ReceiptHistory } from './ui/ReceiptHistory';
import './RoutePage.scss';

const d = (ms: number) => ({ '--d': `${ms}ms` } as React.CSSProperties);

/** Личная страница «Мой маршрут». Гость видит пример маршрута и приглашение войти. */
export default function RoutePage() {
  const { user, ready } = useSession();
  const { open, state: modal } = useModal();
  const toast = useToast();
  const reduced = useReducedMotion();
  const guest = !user;
  const shown = useMemo(() => user ?? { ...api.sample(), name: 'Гость' }, [user]);
  // Новые шаги зажигаются по очереди с того места, где человек был в прошлый раз; цифры считают вместе с гирляндой.
  // Пока открыто окно (например, «Чек зарегистрирован»), анимация ждёт, чтобы её было видно.
  const start = useSeenStart(user, 'route');
  const target = { circle: shown.circle, step: shown.step };
  const { pos, moving } = useStepAnimation({ from: start, to: target, run: ready && !modal, onFinish: () => { if (!reduced) launchConfetti(); } });
  const p = getProgress(pos.step);
  // Пока идёт переход на новый круг, пройденные круги и билеты показываем на момент кадра
  const behind = shown.circle - pos.circle;
  const circlesDone = shown.circlesDone - behind;
  const chances = shown.chances - behind;
  const tick = moving ? ' num--tick' : '';
  // 30‑й шаг: круг пройден, «осталось 0 шагов» не пишем
  const finished = pos.step >= 30;
  // Гирлянда шагов откликается на курсор, как на главной
  const heroRef = useRef<HTMLElement>(null);
  useGarlandSway(heroRef);

  return (
    <PageLayout title="Мой маршрут · Новогодняя акция Аникс" noindex revealDeps={[ready, user]}>
      {/* ===== Первый экран маршрута ===== */}
      <section className="section section--green route-hero on-dark" ref={heroRef}>
        <Snow />
        <div className="route-hero__goat reveal" aria-hidden="true"><img src="/img/goat-lantern.webp" alt="" width={688} height={1024} /></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <p className="route-hero__greet reveal">{user ? `${user.name}, с наступающим!` : 'С наступающим Новым годом!'}</p>
          <h1 className="reveal" style={d(60)}>Ваш новогодний маршрут</h1>
          <div className="route-hero__grid">
            <div className="route-hero__progress reveal" style={d(120)}>
              <span key={pos.step} className={`num${tick}`}>{pos.step}</span>
              <div className="route-hero__of">
                <b>из 30 шагов</b>
                <span className="ticket ticket--gold">{circleName(pos.circle)} круг</span>
                {finished
                  ? <p>Круг пройден&nbsp;— билет на&nbsp;розыгрыш ваш! Следующий чек начнёт новый круг.</p>
                  : <p>До {p.goalGen} на&nbsp;{p.next}‑м шаге&nbsp;— всего <span>{p.leftText}</span>, это покупки на&nbsp;<span>{p.leftRub}</span>.</p>}
              </div>
            </div>
            <div className="counters reveal" style={d(200)}>
              <div className="ticket ticket--cream counter"><span className="num">{shown.receiptsTotal}</span><small>чеков</small></div>
              <div className="ticket ticket--cream counter"><span key={circlesDone} className={`num${tick}`}>{circlesDone}</span><small>{plural(circlesDone, 'круг', 'круга', 'кругов')}<br />{plural(circlesDone, 'пройден', 'пройдено', 'пройдено')}</small></div>
              <div className="ticket ticket--cream counter counter--red"><span key={chances} className={`num${tick}`}>{chances}</span><small>{plural(chances, 'билет', 'билета', 'билетов')}<br />на розыгрыш</small></div>
            </div>
          </div>
          <div className="route-hero__lights reveal" style={d(260)}><StepGarland step={pos.step} here labels moving={moving} /></div>
          {/* Телефон: гирлянда тремя рядами по 10 шагов, чтобы была видна целиком (правка 24.10) */}
          <div className="route-hero__rows reveal" style={d(260)}>
            {([0, 1, 2] as const).map((i) => <StepRow key={i} row={i} step={pos.step} here labels moving={moving} />)}
          </div>
          <div className="route-hero__actions reveal" style={d(320)}>
            <OpenModalButton modal="receipt">Зарегистрировать чек</OpenModalButton>
            <Button variant="light" to="/">На главную</Button>
          </div>
          {guest && ready && (
            <p className="route-hero__note reveal" style={d(380)}>Это пример маршрута. <a className="link" href="#" style={{ color: '#e2b24a' }} onClick={(e) => { e.preventDefault(); open('auth'); }}>Войдите</a>, чтобы увидеть свои шаги и&nbsp;чеки.</p>
          )}
        </div>
      </section>

      {/* ===== Карта пути: ёлка ===== */}
      <section className="section section--cream tree-sec" id="map">
        <div className="container tree-grid">
          <RouteTree from={start} to={target} paused={!ready || !!modal} partnerStops={shown.partnerStops} />
          <aside className="tree-panel reveal" style={d(120)}>
            <h2>Карта вашего пути</h2>
            <p className="lead tree-panel__lead">Идите по&nbsp;гирлянде снизу вверх: от&nbsp;первого шара у&nbsp;подножия ёлки к&nbsp;звезде. На&nbsp;10‑м и&nbsp;20‑м шагах&nbsp;— подарки-сертификаты. Пройдёте все шаги&nbsp;— и&nbsp;звезда на&nbsp;верхушке зажжётся: это финиш и&nbsp;билет на&nbsp;розыгрыш призов.</p>
            <div className="tree-panel__next">
              {finished ? (
                <><b>Круг пройден&nbsp;— <em>билет ваш!</em></b><p>Следующий чек начнёт новый круг и&nbsp;даст ещё один шанс.</p></>
              ) : (
                <><b>До подарка на&nbsp;{p.next}‑м шаге&nbsp;— <em>всего {p.leftText}</em></b><p>Это покупки на&nbsp;<span>{p.leftRub}</span>. На&nbsp;{p.next}‑м шаге&nbsp;— {p.goalText}.</p></>
              )}
              <OpenModalButton modal="receipt" block>Добавить чек</OpenModalButton>
            </div>
            <div className="legend">
              <ul>
                <li><i className="i-gold" />Золотой шар&nbsp;— шаг пройден</li>
                <li><i className="i-red" />Красный шар&nbsp;— вы здесь</li>
                <li><i className="i-dim" />Прозрачный шар&nbsp;— откроется после новых чеков</li>
                <li><i className="i-gift"><IconGift /></i>Подарок&nbsp;— сертификат Аникс</li>
                <li><i className="i-box"><IconCrate /></i>Коробка&nbsp;— площадка партнёра: видео и&nbsp;отзывы</li>
                <li><i className="i-star"><IconStar /></i>Звезда&nbsp;— финиш и&nbsp;билет на&nbsp;розыгрыш</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ===== Розыгрыши и история чеков ===== */}
      <section className="section section--green torn-top activity on-dark">
        <div className="container activity__grid">
          <div>
            <div className="section-head reveal">
              <span className="ribbon">Ваши розыгрыши</span>
              <h2>Билеты на&nbsp;розыгрыши</h2>
            </div>
            <div className="ticket ticket--cream ticket-card reveal" style={{ color: '#173f2a' }}>
              <img className="ticket-card__seal" src="/img/seal-check.svg" alt="" width={100} height={100} />
              <span className="ticket-card__divider" />
              <div><b>{circlesDone === 0 ? 'Первый круг впереди' : circlesDone === 1 ? 'Первый круг пройден' : `Пройдено ${circlesDone} ${plural(circlesDone, 'круг', 'круга', 'кругов')}`}</b><p>Первый круг&nbsp;— первый билет. Каждый новый круг даёт ещё один билет, а&nbsp;ёлка начинается заново.</p></div>
            </div>
            <div className="ticket ticket--gold ticket-card reveal" style={d(80)}>
              <img className="ticket-card__seal" src="/img/seal-star.svg" alt="" width={100} height={100} />
              <span className="ticket-card__divider" />
              <div><b>Участие в&nbsp;розыгрышах призов открыто</b><OpenModalButton modal="receipt">Зарегистрировать чек</OpenModalButton></div>
            </div>
            <div className="share-tag reveal" style={d(160)}>
              <b>Поделитесь прогрессом в&nbsp;чате магазина</b>
              <p>Самых активных участников чата своего магазина ждёт дополнительный подарок.</p>
              {/* ЗАПОЛНИТЬ: ссылка на группу MAX выбранного магазина */}
              <Button variant="yellow" href="#" onClick={(e) => { e.preventDefault(); toast('Ссылка на чат магазина появится позже'); }}>Поделиться в&nbsp;чате MAX</Button>
            </div>
          </div>
          <div className="receipt-wrap reveal" style={d(120)}>
            <ReceiptHistory user={user ? shown : null} />
          </div>
        </div>
      </section>

      <CtaBanner
        cream
        route
        title={finished ? <>Круг пройден&nbsp;—<br />начните новый</> : <>До {p.goalGen}&nbsp;—<br /><span style={{ whiteSpace: 'nowrap' }}>всего {p.leftText}</span></>}
        lead={<>Добавьте новый чек и&nbsp;продолжите свой новогодний маршрут.</>}
        actions={<><OpenModalButton modal="receipt">Зарегистрировать чек</OpenModalButton><span style={{ fontWeight: 800, color: '#173f2a' }}>600&nbsp;₽ = 1&nbsp;шаг к&nbsp;подаркам</span></>}
        goat={{ src: '/img/goat-star.webp', width: 342, height: 1000 }}
      />
    </PageLayout>
  );
}
