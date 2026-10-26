import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { useStepAnimation, type RoutePos } from '@/entities/user';
import { CAMPAIGN, nextMilestone } from '@/shared/config/campaign';
import { useInView, useReducedMotion } from '@/shared/lib/hooks';
import { plural } from '@/shared/lib/text';
import { FONT_NUM, FONT_TEXT } from '@/shared/ui/lights/geometry';
import { PartnerBox } from '@/shared/ui/lights';
import { DESKTOP_TREE, MOBILE_TREE } from './geometry';

interface RouteTreeProps {
  /** Что человек видел в прошлый раз: от этого шага новые шары зажигаются по очереди */
  from: RoutePos | null;
  /** Настоящее положение из данных */
  to: RoutePos;
  /** Не играть анимацию (открыто окно, данные ещё грузятся) */
  paused?: boolean;
  partnerStops: number[];
}

function Label({ x, y, text, bg, color, w, fs = 14 }: { x: number; y: number; text: string; bg: string; color: string; w: number; fs?: number }) {
  const h = Math.round(fs * 2.15);
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={bg} />
      <text x={x} y={y + fs * 0.36} textAnchor="middle" fontFamily={FONT_TEXT} fontWeight={800} fontSize={fs} fill={color}>{text}</text>
    </g>
  );
}

function Gift({ x, y, s }: { x: number; y: number; s: number }) {
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

function starPoints(cx: number, cy: number, r: number): string {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 2 * Math.PI - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

function tooltipText(n: number, step: number, partner: number[]): string {
  let body: string;
  if (n === 10 || n === 20) body = `Сертификат Аникс на ${n === 10 ? '1 500' : '3 000'} ₽: его получает каждый ${CAMPAIGN.milestoneEvery[n]}‑й, кто дошёл до этого шага за неделю.`;
  else if (n < step) body = 'Пройден. Спасибо за покупки!';
  else if (n === step) {
    const dl = nextMilestone(n) - n;
    body = `Вы здесь. До следующей вехи — ${dl} ${plural(dl, 'шаг', 'шага', 'шагов')}.`;
  } else body = 'Откроется после новых чеков: каждые 600 ₽ — один шаг.';
  if (partner.includes(n)) body += ' Здесь площадка партнёра: видео, рассказ о компании и отзывы.';
  return body;
}

/**
 * Карта пути «ёлка» из 30 шагов (на компьютере — геометрия макета 860×1260, на телефоне — вытянутая ёлка). Путь идёт снизу вверх: шаг 1 у подножия, 30 — звезда.
 * Клик или фокус на шаре показывает подсказку.
 */
export function RouteTree({ from, to, paused = false, partnerStops }: RouteTreeProps) {
  const host = useRef<HTMLDivElement>(null);
  // Анимация шагов начинается, когда ёлка видна на экране
  const inView = useInView(host);
  const { pos, moving } = useStepAnimation({ from, to, run: inView && !paused });
  const step = pos.step;
  const [tip, setTip] = useState<{ n: number; left: number; top: number } | null>(null);
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

  // Шары появляются по очереди
  useEffect(() => {
    const svg = host.current?.querySelector('svg');
    if (!svg || reduced || document.documentElement.classList.contains('no-anim')) return;
    svg.querySelectorAll<SVGGElement>('.ball').forEach((b, i) => {
      b.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 400, delay: 30 * i, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' });
    });
  }, [reduced]);

  useEffect(() => {
    const onDoc = (e: Event) => {
      if (!host.current?.contains(e.target as Node)) setTip(null);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const show = (g: SVGGElement) => {
    const n = Number(g.dataset.step);
    const r = g.getBoundingClientRect();
    const h = host.current!.getBoundingClientRect();
    setTip({ n, left: Math.max(8, Math.min(h.width - 278, r.left - h.left + r.width / 2 - 130)), top: r.top - h.top + r.height + 10 });
  };
  const onClick = (e: MouseEvent<SVGSVGElement>) => {
    const g = (e.target as Element).closest<SVGGElement>('.ball');
    pinned.current = !!g;
    if (g) show(g);
    else setTip(null);
  };
  // На компьютере подсказка появляется уже при наведении: так понятно, что шар можно нажать
  const onOver = (e: MouseEvent<SVGSVGElement>) => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const g = (e.target as Element).closest<SVGGElement>('.ball');
    if (g && Number(g.dataset.step) !== tip?.n) {
      pinned.current = false;
      show(g);
    }
  };
  const onOut = (e: MouseEvent<SVGSVGElement>) => {
    const to = e.relatedTarget as Element | null;
    if (!pinned.current && (e.target as Element).closest('.ball') && !to?.closest?.('.ball')) setTip(null);
  };
  const onFocus = (e: FocusEvent<SVGSVGElement>) => {
    const g = (e.target as Element).closest<SVGGElement>('.ball');
    if (g) show(g);
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'Escape') setTip(null);
  };

  const labels: ReactNode[] = [];
  const balls = tg.balls.map(([n, cx, cy]) => {
    const state = n < step ? 'done' : n === step ? 'current' : 'locked';
    const isGift = n === 10 || n === 20;
    const r = (state === 'current' ? 36 : 30) * k;
    if (isGift) labels.push(<Label key={`l${n}`} x={cx} y={cy + tg.gift.dy} text={`Сертификат ${n === 10 ? '1 500 ₽' : '3 000 ₽'}`} bg="#e31e24" color="#fff8e8" w={tg.gift.w} fs={tg.gift.fs} />);
    if (!isGift && state === 'current') labels.push(<Label key={`l${n}`} x={cx} y={cy + tg.here.dy} text="Вы здесь" bg="#e31e24" color="#fff8e8" w={tg.here.w} fs={tg.here.fs} />);
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
  const boxes = tg.balls.filter(([n]) => partnerStops.includes(n)).map(([n, cx, cy]) => <PartnerBox key={`b${n}`} x={cx + 26 * k} y={cy + 26 * k} s={40 * k} />);
  const lit = step >= 30;

  return (
    <div ref={host} className="tree-host reveal" style={{ position: 'relative' }}>
      <p className="tree-hint">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x={10} y={1} width={4} height={4} rx={1} fill="#b98a2e" /><circle cx={12} cy={14} r={9} fill="currentColor" /><circle cx={9} cy={11} r={2} fill="#fff" opacity={0.6} /></svg>
        Нажмите на&nbsp;шар, чтобы узнать о&nbsp;шаге
      </p>
      <svg viewBox={`0 0 ${tg.w} ${tg.h}`} className={`tree${narrow ? ' tree--tall' : ''}`} role="img" aria-label={`Карта пути: ёлка из 30 шагов, вы на шаге ${step}`} onClick={onClick} onMouseOver={onOver} onMouseOut={onOut} onFocus={onFocus} onBlur={() => setTip(null)} onKeyDown={onKey}>
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
      </svg>
      <div className={`tooltip${tip ? ' is-open' : ''}`} role="tooltip" style={tip ? { left: tip.left, top: tip.top } : undefined}>
        {tip && <><b>Шаг {tip.n}</b>{tooltipText(tip.n, step, partnerStops)}</>}
      </div>
    </div>
  );
}
