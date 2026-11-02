import { useCallback, useEffect, useRef } from 'react';
import { useWindowResize } from '@/shared/lib/hooks';

const STOPS = [
  { n: '01', title: <>Покупайте в&nbsp;Аникс</>, text: <>Чек от&nbsp;600&nbsp;₽. Алкоголь и&nbsp;табачные изделия в&nbsp;сумму не&nbsp;входят. Перед оплатой скажите кассиру, что участвуете в&nbsp;акции.</>, sidePin: false },
  { n: '02', title: <>Регистрируйте чек</>, text: <>У&nbsp;кассира, на&nbsp;кассе самообслуживания или на&nbsp;сайте. Назовите номер телефона. До&nbsp;5&nbsp;чеков в&nbsp;день.</>, sidePin: false },
  { n: '03', title: <>Шагайте по&nbsp;маршруту</>, text: <>Каждые полные 600&nbsp;₽&nbsp;— один шаг. На&nbsp;10‑м и&nbsp;20‑м шагах каждый 30‑й и&nbsp;100‑й получает сертификат Аникс.</>, sidePin: true },
  { n: '04', title: <>Финиш на&nbsp;30‑м шаге</>, text: <>Круг из&nbsp;30&nbsp;шагов&nbsp;— билет на&nbsp;розыгрыш призов. Новый круг&nbsp;— ещё один билет.</>, sidePin: false },
];

/* Отрезки пунктира. vS — вниз к кнопке, hS — бок в бок, eP — от бокового края к кнопке карточки ниже (не задевая заголовок) */
const vS = (a, b) => { const dy = Math.max(60, (b[1] - a[1]) * 0.55); return `M ${a[0]} ${a[1] - 6} C ${a[0]} ${a[1] + dy}, ${b[0]} ${b[1] - dy}, ${b[0]} ${b[1] - 20} `; };
const hS = (a, b) => { const dx = Math.max(60, Math.abs(b[0] - a[0]) * 0.5) * (b[0] > a[0] ? 1 : -1); return `M ${a[0] + (dx > 0 ? -6 : 6)} ${a[1]} C ${a[0] + dx} ${a[1]}, ${b[0] - dx} ${b[1]}, ${b[0] + (dx > 0 ? -14 : 14)} ${b[1]} `; };
const eP = (a, b) => { const toLeft = b[0] < a[0]; const dx = Math.max(80, Math.abs(b[0] - a[0]) * 0.55) * (toLeft ? -1 : 1); return `M ${a[0] + (toLeft ? 6 : -6)} ${a[1]} C ${a[0] + dx} ${b[1] - 10}, ${b[0] + (toLeft ? 140 : -140)} ${b[1] - 46}, ${b[0]} ${b[1] - 20} `; };
/* Петля на компьютере — от кнопки к кнопке (правка Никиты 27.10): arch — дугой над промежутком между карточками
   (не выше minY, чтобы не задеть карточку сверху), around — вокруг правого края карточки вниз к кнопке следующей */
const arch = (a, b, minY = -Infinity) => {
  const top = Math.max(Math.min(a[1], b[1]) - Math.max(50, Math.abs(b[0] - a[0]) * 0.12), minY);
  const k = (b[0] - a[0]) * 0.3;
  return `M ${a[0]} ${a[1]} C ${a[0] + k} ${top}, ${b[0] - k} ${top}, ${b[0]} ${b[1]} `;
};
const around = (a, b, card, gapY) => {
  const x = card.right + 34;
  return `M ${a[0]} ${a[1]} C ${a[0] + (x - a[0]) * 0.6} ${a[1] - 34}, ${x} ${a[1] - 16}, ${x} ${a[1] + 44} L ${x} ${gapY - 30} Q ${x} ${gapY}, ${x - 30} ${gapY} L ${b[0] + 46} ${gapY} Q ${b[0]} ${gapY}, ${b[0]} ${b[1]} `;
};
/**
 * Перевод точки из координат элемента в координаты root по раскладке, без анимации появления (правка 29.10).
 * getBoundingClientRect видит сдвиг .reveal (карточки въезжают снизу на 24 px), и пунктир прыгал за ними;
 * offsetLeft/offsetTop его не видят, а постоянный наклон карточек (CSS rotate) учитываем сами.
 */
function frameIn(el, root) {
  const chain = [];
  for (let e = el; e && e !== root; e = e.offsetParent) chain.push(e);
  return (px, py) => {
    let x = px;
    let y = py;
    for (const e of chain) {
      const cs = getComputedStyle(e);
      const a = ((parseFloat(cs.rotate) || 0) * Math.PI) / 180;
      if (a) {
        const [ox, oy] = cs.transformOrigin.split(' ').map(parseFloat);
        const dx = x - ox;
        const dy = y - oy;
        x = ox + dx * Math.cos(a) - dy * Math.sin(a);
        y = oy + dx * Math.sin(a) + dy * Math.cos(a);
      }
      x += e.offsetLeft;
      y += e.offsetTop;
    }
    return [x, y];
  };
}
/** Рамка элемента в координатах root (с учётом наклона — как у getBoundingClientRect, но без анимации появления) */
function boxIn(el, root) {
  const f = frameIn(el, root);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const c = [f(0, 0), f(w, 0), f(0, h), f(w, h)];
  const xs = c.map((q) => q[0]);
  const ys = c.map((q) => q[1]);
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
}
const centerIn = (el, root) => frameIn(el, root)(el.offsetWidth / 2, el.offsetHeight / 2);

/**
 * Карта «четыре остановки»: карточки-записки и пунктир между ними. Пунктир считается от настоящих
 * координат карточек, поэтому совпадает с ними на любой ширине; на телефоне (≤ 900) карточки идут столбиком без линии.
 */
export function StopsMap() {
  const map = useRef(null);
  const path = useRef(null);

  const draw = useCallback(() => {
    const m = map.current;
    const p = path.current;
    const svg = p?.ownerSVGElement;
    if (!m || !p || !svg || getComputedStyle(svg).display === 'none') return;
    const stops = Array.from(m.querySelectorAll('.stop'));
    svg.setAttribute('viewBox', `0 0 ${m.offsetWidth} ${m.offsetHeight}`);
    const pts = stops.map((st) => {
      const r = boxIn(st, m);
      const midY = (r.top + r.bottom) / 2;
      // Видимая кнопка: у карточки 03 их две (боковая и верхняя), CSS показывает одну в зависимости от раскладки
      const pinEl = Array.from(st.querySelectorAll('.stop__pin')).find((e) => getComputedStyle(e).display !== 'none') ?? st;
      return {
        box: r,
        pin: centerIn(pinEl, m),
        bottom: [(r.left + r.right) / 2, r.bottom],
        left: [r.left, midY],
        right: [r.right, midY],
      };
    });
    let d = '';
    const fin = m.querySelector('.map__finish');
    // Компьютер (правка 27.10): петля — 01 → 02 вправо, 03 под 02, 04 влево, финиш под заголовком (раскладка в ConditionsPage.scss).
    // Линия выходит из красной кнопки и приходит в кнопку следующей карточки
    if (getComputedStyle(m).getPropertyValue('--map-flow').trim() === 'loop' && pts.length === 4) {
      const [s1, s2, s3, s4] = pts;
      const rowGap = (Math.max(s1.box.bottom, s2.box.bottom) + Math.min(s3.box.top, s4.box.top)) / 2;
      d = arch(s1.pin, s2.pin) + around(s2.pin, s3.pin, s2.box, rowGap) + arch(s3.pin, s4.pin, Math.max(s1.box.bottom, s2.box.bottom) + 14);
      if (fin) {
        const f = boxIn(fin, m);
        const t = [(f.left + f.right) / 2, f.top - 12];
        d += `M ${s4.pin[0]} ${s4.pin[1]} C ${s4.pin[0] - 170} ${s4.pin[1] - 110}, ${t[0] + 130} ${t[1] - 190}, ${t[0]} ${t[1]} `;
      }
      p.setAttribute('d', d);
      return;
    }
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const bLeft = b.pin[0] < a.left[0] + (a.right[0] - a.left[0]) / 2;
      if (b.pin[1] > a.left[1] + 10) d += eP(bLeft ? a.left : a.right, b.pin);
      else d += bLeft ? hS(a.left, b.right) : hS(a.right, b.left);
    }
    if (fin && getComputedStyle(fin).position === 'absolute') {
      const last = pts[pts.length - 1];
      const f = boxIn(fin, m);
      const fp = [f.left - 16, (f.top + f.bottom) / 2];
      d += fp[1] > last.left[1] - 120 && fp[1] < last.bottom[1] + 20 ? hS(last.right, fp) : vS(last.bottom, [fp[0] + 40, fp[1] + 20]);
    }
    p.setAttribute('d', d);
  }, []);

  useEffect(() => {
    // Анимация появления на линию не влияет (frameIn), поэтому пересчёт только когда меняется раскладка:
    // шрифты догрузились (другая высота карточек) или поменялось окно
    draw();
    document.fonts?.ready.then(draw);
    window.addEventListener('load', draw);
    return () => window.removeEventListener('load', draw);
  }, [draw]);
  useWindowResize(draw);

  return (
    <div className="map" ref={map}>
      <svg className="map__path" viewBox="0 0 1312 1380" aria-hidden="true"><path ref={path} d="" /></svg>
      {STOPS.map((s, i) => (
        <article key={s.n} className={`stop stop--${i + 1} reveal`} style={{ '--d': `${i * 80}ms` }}>
          {/* У карточки 03 пунктир приходит сбоку, поэтому верхняя кнопка ей не нужна (правка 24.10) */}
          {/* Без пунктира (телефон, планшет) у 03 кнопка сверху, как у всех; боковая идёт первой — по ней считается пунктир */}
          {s.sidePin ? <><span className="stop__pin stop__pin--left" /><span className="stop__pin stop__pin--narrow" /></> : <span className="stop__pin" />}
          <span className="stop__n">{s.n}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </article>
      ))}
      <p className="map__finish reveal" style={{ '--d': '300ms' }}>А&nbsp;дальше&nbsp;— розыгрыш призов!</p>
      <img className="map__goat reveal" src="/img/goat-point.webp" alt="" width={300} height={520} loading="lazy" />
    </div>
  );
}
