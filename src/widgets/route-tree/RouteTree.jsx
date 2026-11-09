import { useEffect, useRef, useState } from 'react';
import { useStepAnimation } from '@/entities/user';
import { useModal } from '@/features/modal';
import { CAMPAIGN, codeForStep, nextMilestone, promoForStep } from '@/shared/config/campaign';
import { useInView, useReducedMotion } from '@/shared/lib/hooks';
import { formatRub, plural } from '@/shared/lib/text';
import { CouponMark, IconCoupon, IconCrate, IconGift } from '@/shared/ui/icons/Icons';
import { FONT_NUM, FONT_TEXT } from '@/shared/ui/lights/geometry';
import { PartnerBox } from '@/shared/ui/lights';
import { DESKTOP_TREE, MOBILE_TREE } from './geometry';
import { placeCoupons, placeHere } from './placement';

/** Плашка-подпись на ёлке. kicker — мелкая строка сверху («РОЗЫГРЫШ»): сертификат не подарок каждому, а шанс */
function Label({ x, y, text, kicker, bg, color, w, fs = 14 }) {
  const h = Math.round(fs * (kicker ? 2.95 : 2.15));
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={kicker ? fs * 0.9 : h / 2} fill={bg} />
      {kicker && <text x={x} y={y - fs * 0.27} textAnchor="middle" fontFamily={FONT_TEXT} fontWeight={800} fontSize={fs * 0.72} letterSpacing={fs * 0.08} fill={color} opacity={0.85}>{kicker}</text>}
      <text x={x} y={y + (kicker ? fs * 0.8 : fs * 0.36)} textAnchor="middle" fontFamily={FONT_TEXT} fontWeight={800} fontSize={fs} fill={color}>{text}</text>
    </g>
  );
}

function Gift({ x, y, s }) {
  return (
    <g transform={`translate(${x - s / 2} ${y - s / 2})`}>
      <rect x={s * 0.06} y={s * 0.34} width={s * 0.88} height={s * 0.62} fill="#e31e24" />
      <rect x={0} y={s * 0.22} width={s} height={s * 0.2} fill="#b3121a" />
      <rect x={s * 0.42} y={s * 0.22} width={s * 0.16} height={s * 0.74} fill="#e2b24a" />
      <rect x={s * 0.06} y={s * 0.6} width={s * 0.88} height={s * 0.1} fill="#e2b24a" />
      <ellipse cx={s * 0.36} cy={s * 0.14} rx={s * 0.15} ry={s * 0.1} fill="#e2b24a" />
      <ellipse cx={s * 0.64} cy={s * 0.14} rx={s * 0.15} ry={s * 0.1} fill="#e2b24a" />
    </g>
  );
}

function starPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 2 * Math.PI - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

const STATE_NAME = { done: 'Пройден', current: 'Вы здесь', locked: 'Впереди' };

/**
 * Подсказка шара по пунктам (правка 28.10, раньше был сплошной текст): сверху «Шаг N» и метка состояния,
 * ниже — что есть на шаге, каждое отдельным пунктом со значком: розыгрыш, промокод «Торнадо», площадка партнёра.
 */
function TipContent({ n, step, partner, codesOpen }) {
  const state = n < step ? 'done' : n === step ? 'current' : 'locked';
  let note;
  if (state === 'done') note = 'Спасибо за покупки!';
  else if (state === 'current') {
    const next = nextMilestone(n);
    const dl = next - n;
    note = `До ${next === 30 ? 'финиша' : `розыгрыша на ${next}‑м шаге`} — ${dl} ${plural(dl, 'шаг', 'шага', 'шагов')}`;
  } else note = `Откроется после новых чеков: ${formatRub(CAMPAIGN.stepRub)} в чеке или ${CAMPAIGN.partnerItemsPerStep} товаров партнёров — 1 шаг`;

  const items = [];
  // Сертификат — шанс, а не подарок каждому: его получает каждый N‑й участник недели
  if (n === 10 || n === 20) items.push({ key: 'gift', icon: <IconGift />, kicker: 'Розыгрыш', title: `Сертификат «Аникс» на ${formatRub(CAMPAIGN.milestones[n])}`, text: `Получает каждый ${CAMPAIGN.milestoneEvery[n]}‑й участник недели, дошедший до шага` });
  // Промокод доставки — гарантированно каждому (правка 27.10): пройденный шаг отсылает к коду ниже, будущий — обещает
  const promo = promoForStep(n);
  // Правки «Торнадо» 09.11: «Промокод «Торнадо»» читали как код «ТОРНАДО» — открытый шаг показывает сам код, закрытый — «Промокод в «Торнадо»»
  if (promo) items.push({ key: 'promo', icon: <IconCoupon />, kicker: codesOpen ? `Промокод «${codeForStep(n)}»` : 'Промокод в «Торнадо»', title: `−${formatRub(promo.discount)} на доставку`, text: codesOpen ? `На заказ от ${formatRub(promo.minOrder)} в приложении «Торнадо». Скопировать код можно ниже, в «Ваших промокодах»` : `На заказ от ${formatRub(promo.minOrder)} в приложении «Торнадо» — каждому, кто дойдёт до шага` });
  // Задание партнёра (правка 02.11): дошёл до шага — задание открыто, выполнил — участвует в розыгрыше призов партнёра
  if (partner.includes(n)) items.push({ key: 'box', icon: <IconCrate />, kicker: 'Задание партнёра', title: 'Выполните задание и участвуйте в розыгрыше призов партнёра', text: codesOpen ? 'Нажмите на коробку, чтобы открыть задание' : 'Откроется, когда дойдёте до шага' });

  return (
    <>
      <div className="tip__head"><b>Шаг {n}</b><span className={`tip__state tip__state--${state}`}>{STATE_NAME[state]}</span></div>
      <p className="tip__note">{note}</p>
      {items.map((it) => (
        <div key={it.key} className="tip__item">
          <span className="tip__ic" aria-hidden="true">{it.icon}</span>
          <div><small>{it.kicker}</small><strong>{it.title}</strong>{it.text && <p>{it.text}</p>}</div>
        </div>
      ))}
    </>
  );
}

/** Сколько палец у шара на экране, мс (анимация tap-hand в RoutePage.scss той же длины) */
const TAP_MS = 2800;
/** Рука с вытянутым пальцем и дугой касания (значок touch_app, 24×24): кончик пальца — в точке (11.5, 6) */
const HAND = 'M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z';

/** Палец «нажмите на шар» у шара (x, y): подлетает снизу справа, дважды нажимает (от шара расходится кольцо) и исчезает */
function TapHint({ x, y, k }) {
  // Рука на компьютере крупнее (там шары меньше); кончик пальца — у правого нижнего края шара, цифра шага видна
  const s = (k > 1 ? 3.4 : 4.2) * k;
  return (
    <g className="tap-hint" pointerEvents="none" aria-hidden="true">
      <circle className="tap-hint__ring" cx={x} cy={y} r={34 * k} fill="none" stroke="#fff8e8" strokeWidth={4 * k} />
      <g transform={`translate(${x + 14 * k - 11.5 * s} ${y + 14 * k - 6 * s})`}>
        <g className="tap-hint__hand">
          <path d={HAND} transform={`scale(${s})`} fill="#fff8e8" stroke="#173f2a" strokeWidth={0.9} strokeLinejoin="round" />
        </g>
      </g>
    </g>
  );
}

// Расстановка «Вы здесь» и купонов — placement.js (правка 02.11: подписи и купоны больше не наезжают друг на друга и на шары)

/**
 * Карта пути «ёлка» из 30 шагов (на компьютере — геометрия макета 860×1260, на телефоне — вытянутая ёлка). Путь идёт снизу вверх: шаг 1 у подножия, 30 — звезда.
 * Клик или фокус на шаре показывает подсказку.
 */
export function RouteTree({ from, to, paused = false, partnerStops, guest = false }) {
  const host = useRef(null);
  // Анимация шагов начинается, когда ёлка видна на экране
  const inView = useInView(host);
  const { pos, moving } = useStepAnimation({ from, to, run: inView && !paused });
  const step = pos.step;
  const [tip, setTip] = useState(null);
  // На телефоне — вытянутая ёлка с крупными шарами и цифрами (их часто смотрят пожилые покупатели)
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 600px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const tg = narrow ? MOBILE_TREE : DESKTOP_TREE;
  const k = tg.k;
  // Подсказка, открытая кликом, не закрывается, когда мышь уходит с шара
  const pinned = useRef(false);
  const reduced = useReducedMotion();
  // Пока подсказка гаснет, в ней остаются прежние текст и место. Раньше они сбрасывались сразу,
  // и пустая рамка на миг мелькала в верхнем углу ёлки, над звездой (правка 28.10)
  const [view, setView] = useState(null);
  // Палец у текущего шара (правка 30.10 вместо подсказки, которая открывалась сама): один раз за посещение, когда шар виден, —
  // подлетает и дважды «нажимает», так понятно, что шар можно нажать или навести. poke — номер шага, пока палец на экране
  const [poke, setPoke] = useState(null);
  const pokeDone = useRef(false);
  const { open: openModal } = useModal();

  // Шары появляются по очереди
  useEffect(() => {
    const svg = host.current?.querySelector('svg');
    if (!svg || reduced || document.documentElement.classList.contains('no-anim')) return;
    svg.querySelectorAll('.ball').forEach((b, i) => {
      b.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 400, delay: 30 * i, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' });
    });
  }, [reduced]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!host.current?.contains(e.target)) setTip(null);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const show = (g) => {
    const n = Number(g.dataset.step);
    const r = g.getBoundingClientRect();
    const h = host.current.getBoundingClientRect();
    // Ширина подсказки 300 px (на узком экране — по ширине ёлки), по центру шара и не за краями
    const w = Math.min(300, h.width - 16);
    const next = { n, left: Math.max(8, Math.min(h.width - w - 8, r.left - h.left + r.width / 2 - w / 2)), top: r.top - h.top + r.height + 10 };
    setTip(next);
    setView(next);
  };
  // Коробка партнёра — кнопка: открывает окно задания (правка 02.11)
  const openTask = (el) => {
    setTip(null);
    setPoke(null);
    openModal('task', { step: Number(el.dataset.task) });
  };
  const onClick = (e) => {
    const box = e.target.closest('[data-task]');
    if (box) {
      openTask(box);
      return;
    }
    const g = e.target.closest('.ball');
    pinned.current = !!g;
    setPoke(null);
    if (g) show(g);
    else setTip(null);
  };
  // На компьютере подсказка появляется уже при наведении: так понятно, что шар можно нажать
  const onOver = (e) => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const g = e.target.closest('.ball');
    if (g && Number(g.dataset.step) !== tip?.n) {
      pinned.current = false;
      setPoke(null);
      show(g);
    }
  };

  // Палец: когда анимация шагов закончилась и текущий шар целиком на экране — через 0,7 с, на TAP_MS. Один раз за посещение;
  // при «уменьшить движение» не показывается. Если человек сам навёл или нажал на шар — палец сразу исчезает
  useEffect(() => {
    if (pokeDone.current || moving || paused || reduced) return;
    const n = Math.max(1, step);
    const ball = host.current?.querySelector(`.ball[data-step="${n}"]`);
    if (!ball) return;
    let t1 = 0;
    let t2 = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      // «Показано» отмечаем только в момент показа: если тут же началась анимация новых шагов, палец покажется после неё
      t1 = window.setTimeout(() => {
        pokeDone.current = true;
        if (host.current?.querySelector('.tooltip.is-open')) return;
        setPoke(n);
        t2 = window.setTimeout(() => setPoke(null), TAP_MS);
      }, 700);
    }, { threshold: 1, rootMargin: '-15% 0px -15% 0px' });
    io.observe(ball);
    return () => {
      io.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [moving, paused, step, reduced]);
  const onOut = (e) => {
    const to = e.relatedTarget;
    if (!pinned.current && e.target.closest('.ball') && !to?.closest?.('.ball')) setTip(null);
  };
  const onFocus = (e) => {
    const g = e.target.closest('.ball');
    if (g) {
      setPoke(null);
      show(g);
    }
  };
  const onKey = (e) => {
    if (e.key === 'Escape') setTip(null);
    const box = e.target.closest?.('[data-task]');
    if (box && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openTask(box);
    }
  };

  const labels = [];
  // «Вы здесь» — в первом свободном месте у текущего шара; купоны обходят её (правка 02.11)
  const here = placeHere(tg, k, partnerStops, step);
  const balls = tg.balls.map(([n, cx, cy]) => {
    const state = n < step ? 'done' : n === step ? 'current' : 'locked';
    const isGift = n === 10 || n === 20;
    const r = (state === 'current' ? 36 : 30) * k;
    if (isGift) labels.push(<Label key={`l${n}`} x={cx} y={cy + tg.gift.dy} kicker="РОЗЫГРЫШ" text={`Сертификат ${n === 10 ? '1 500 ₽' : '3 000 ₽'}`} bg="#e31e24" color="#fff8e8" w={tg.gift.w} fs={tg.gift.fs} />);
    if (here && state === 'current') labels.push(<Label key={`l${n}`} x={here.x} y={here.y} text="Вы здесь" bg="#e31e24" color="#fff8e8" w={tg.here.w} fs={tg.here.fs} />);
    return (
      <g key={n} className={`ball ball--${state}${tip?.n === n ? ' is-active' : ''}${moving && n === step ? ' ball--arrive' : ''}${moving && n === step - 1 ? ' ball--lit' : ''}`} tabIndex={0} role="button" data-step={n} aria-label={`Шаг ${n}${state === 'done' ? ', пройден' : state === 'current' ? ', вы здесь' : ', ещё не открыт'}`}>
        {/* Зона наведения — сплошной круг: при увеличении шара (hover) он только растёт и не уходит из-под курсора.
            Кольцо — тонкая линия, по нему наведение ловить нельзя: шар увеличивается, кольцо уезжает, подсказка мигает */}
        <circle className="ball__hit" cx={cx} cy={isGift ? cy + 4 * k : cy} r={isGift ? 48 * k : r + 11 * k} fill="transparent" />
        <circle className="ball__ring" cx={cx} cy={isGift ? cy + 4 * k : cy} r={isGift ? 46 * k : r + 7 * k} fill="none" stroke="#fff8e8" strokeWidth={3 * k} />
        <line x1={cx} y1={cy - 44 * k} x2={cx} y2={cy - 30 * k} stroke="#e2b24a" strokeWidth={2 * k} />
        <rect x={cx - 6 * k} y={cy - 36 * k} width={12 * k} height={8 * k} rx={2 * k} fill="#b98a2e" />
        {isGift ? (
          <>
            <Gift x={cx} y={cy + 4 * k} s={70 * k} />
            <text x={cx} y={cy + 12 * k} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={26 * k} fill="#fff8e8" pointerEvents="none">{n}</text>
          </>
        ) : (
          <>
            <circle cx={cx} cy={cy} r={r} fill={state === 'done' ? '#e2b24a' : state === 'current' ? '#e31e24' : '#cfd9d1'} opacity={state === 'locked' ? 0.75 : undefined} filter={state === 'current' ? 'url(#tree-glow)' : undefined} />
            <circle cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 0.18} fill="#fff" opacity={0.55} />
            <text x={cx} y={cy + 9 * k} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={(state === 'current' ? 30 : 26) * k} fill={state === 'locked' ? '#4e5f54' : '#173f2a'} pointerEvents="none">{n}</text>
            {state === 'done' && (
              <>
                <circle cx={cx + 22 * k} cy={cy - 22 * k} r={9 * k} fill="#173f2a" />
                <path d={`M ${cx + 17 * k} ${cy - 22 * k} l ${4 * k} ${4 * k} l ${7 * k} ${-8 * k}`} fill="none" stroke="#fff8e8" strokeWidth={2.5 * k} strokeLinecap="round" />
              </>
            )}
          </>
        )}
      </g>
    );
  });
  // Коробки партнёров — кнопки окна задания; у открытого задания (шаг пройден) красный значок «!»
  const taskOpen = (n) => !guest && (n <= step || pos.circle > 1);
  const boxes = tg.balls.filter(([n]) => partnerStops.includes(n)).map(([n, cx, cy]) => {
    const bx = cx + 26 * k;
    const by = cy + 26 * k;
    const s = 40 * k;
    return (
      <g key={`b${n}`} className={`tree__task${taskOpen(n) ? ' is-open' : ''}`} role="button" tabIndex={0} data-task={n} aria-label={`Задание партнёра на шаге ${n}${taskOpen(n) ? ', открыто' : ''}`}>
        <rect x={bx - s / 2} y={by - s / 2} width={s} height={s} fill="transparent" />
        <PartnerBox x={bx} y={by} s={s} />
        {taskOpen(n) && (
          <g pointerEvents="none">
            <circle cx={bx + 14 * k} cy={by - 13 * k} r={8 * k} fill="#e31e24" stroke="#fff8e8" strokeWidth={1.5 * k} />
            <text x={bx + 14 * k} y={by - 8.6 * k} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={13 * k} fill="#fff8e8">!</text>
          </g>
        )}
      </g>
    );
  });
  // Купоны промокодов доставки (шаги — DELIVERY_PROMOS): у шара в свободном углу (правка 30.10). Слева снизу у соседнего шара
  // часто висит коробка партнёра или стоит подарок 10/20 с подписью «РОЗЫГРЫШ» — тогда купон справа снизу, иначе сверху
  const coupons = placeCoupons(tg, k, partnerStops, step, here, (n) => !!promoForStep(n)).map(([n, x, y]) => <CouponMark key={`c${n}`} x={x} y={y} s={46 * k} />);
  // У звезды — только если на финише есть промокод (с 30.10 нет: промокоды на нечётных шагах, Никита просил не ставить его на 30-й)
  if (promoForStep(CAMPAIGN.circleSteps)) coupons.push(<CouponMark key="c30" x={tg.star.x - tg.star.r * 1.1} y={tg.star.y + tg.star.r * 0.6} s={46 * k} rot={-18} />);
  const lit = step >= 30;

  return (
    <div ref={host} className="tree-host reveal" style={{ position: 'relative' }}>
      {/* Компьютер — «наведите», телефон — «нажмите» (правка 28.10); плашка красная, чтобы её заметили */}
      <p className="tree-hint">
        <span className="tree-hint__ic" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x={10} y={1} width={4} height={4} rx={1} fill="#b98a2e" /><circle cx={12} cy={14} r={9} fill="currentColor" /><circle cx={9} cy={11} r={2} fill="#fff" opacity={0.6} /></svg></span>
        {/* «узнаете, что на шаге» одним куском: на телефоне переносится на вторую строку целиком (правка 30.10) */}
        <span className="tree-hint__hover">Наведите на&nbsp;шар&nbsp;— <span className="tree-hint__nb">узнаете, что на&nbsp;шаге</span></span>
        <span className="tree-hint__touch">Нажмите на&nbsp;шар&nbsp;— <span className="tree-hint__nb">узнаете, что на&nbsp;шаге</span></span>
      </p>
      <svg viewBox={`0 0 ${tg.w} ${tg.h}`} className={`tree${narrow ? ' tree--tall' : ''}`} role="group" aria-label={`Карта пути: ёлка из 30 шагов, вы на шаге ${step}`} onClick={onClick} onMouseOver={onOver} onMouseOut={onOut} onFocus={onFocus} onBlur={() => setTip(null)} onKeyDown={onKey}>
        <defs>
          <filter id="tree-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={6} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <ellipse cx={tg.snow.cx} cy={tg.snow.cy} rx={tg.snow.rx} ry={tg.snow.ry} fill="#fff" opacity={0.9} />
        <rect x={tg.trunk.x} y={tg.trunk.y} width={tg.trunk.w} height={tg.trunk.h} rx={8} fill="#7a4a2b" />
        {[...tg.tiers].reverse().map((t, i) => {
          const gl = tg.glints[tg.tiers.length - 1 - i];
          return (
            <g key={i}>
              <path d={t.d} fill={t.fill} transform={`translate(${t.x} ${t.y})`} />
              <path d={gl.d} fill="#fff" opacity={0.06} transform={`translate(${gl.x} ${gl.y})`} />
            </g>
          );
        })}
        <path d={tg.garland} fill="none" stroke="#e2b24a" strokeWidth={2 * k} strokeDasharray={`${5 * k} ${7 * k}`} opacity={0.9} />
        <g className={`tree__star${lit ? ' is-lit' : ''}${lit && moving ? ' tree__star--pop' : ''}`} filter={lit ? 'url(#tree-glow)' : undefined}>
          <polygon points={starPoints(tg.star.x, tg.star.y, tg.star.r)} fill={lit ? '#e2b24a' : '#f1d58a'} />
          <text x={tg.star.x} y={tg.star.y + tg.star.fs * 0.4} textAnchor="middle" fontFamily={FONT_NUM} fontWeight={900} fontSize={tg.star.fs} fill="#173f2a" pointerEvents="none">30</text>
        </g>
        <Label x={tg.finish.x} y={tg.finish.y} text="30 · финиш" bg="#e31e24" color="#fff8e8" w={tg.finish.w} fs={tg.finish.fs} />
        <Label x={tg.start.x} y={tg.start.y} text="Старт ↑" bg="#173f2a" color="#fff8e8" w={tg.start.w} fs={tg.start.fs} />
        {balls}
        {labels}
        {boxes}
        {coupons}
        {poke && (() => {
          const b = tg.balls.find(([n]) => n === poke);
          return b ? <TapHint x={b[1]} y={b[2]} k={k} /> : null;
        })()}
      </svg>
      <div className={`tooltip${tip ? ' is-open' : ''}`} role="tooltip" style={view ? { left: view.left, top: view.top } : undefined}>
        {view && <TipContent n={view.n} step={step} partner={partnerStops} codesOpen={!guest && (view.n <= step || pos.circle > 1)} />}
      </div>
    </div>
  );
}
