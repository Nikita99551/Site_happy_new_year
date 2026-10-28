import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/lib/hooks';

/** Не больше стольких снежинок от прыжков одновременно (если нажимать часто) */
const PUFF_MAX = 120;
/** Снег рисуется 30 раз в секунду на любом экране (правка 28.10). Раньше кадр заказывался на каждое обновление экрана:
    на 120–240 Гц снег съедал процессор вдвое-вчетверо больше и падал быстрее, а вместе с ним браузер каждый кадр
    пересчитывал все анимации страницы. Теперь между кадрами снега — таймер, движение считается по времени (в «кадрах 60 Гц») */
const FRAME_MS = 1000 / 30;
const BASE_MS = 1000 / 60;

/** Событие для секции со снегом: из точки (clientX, clientY) вылетает горсть снега — например, из-под копыт козы */
export const SNOW_PUFF = 'snow-puff';

/**
 * Падающий снег на canvas. Кладётся внутрь секции с position: relative; при reduced-motion не рисуется.
 * На курсор не реагирует (решение 25.10: на мышь откликается только гирлянда).
 * Рисуется, только пока секция на экране и вкладка открыта: за экраном снег не тратит процессор.
 */
export function Snow({ speed }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const cv = ref.current;
    const host = cv?.parentElement;
    if (!cv || !host || reduced) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let W = 0;
    let H = 0;
    let inView = true;
    let raf = 0;
    let timer = 0;
    let last = 0;
    const size = () => {
      W = cv.width = host.clientWidth;
      H = cv.height = host.clientHeight;
    };
    size();
    const flakes = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 3, s: 0.3 + Math.random() * 0.7, o: 0.25 + Math.random() * 0.45, w: Math.random() * 6.28, vx: 0, vy: 0 }));
    const tick = (t) => {
      raf = 0;
      // Сколько «кадров 60 Гц» прошло; после паузы (снег был за экраном) — не больше четырёх, без скачка
      const k = last ? Math.min((t - last) / BASE_MS, 4) : 1;
      const damp = 0.93 ** k;
      last = t;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#fff8e8';
      for (const f of flakes) {
        f.vx *= damp;
        f.vy *= damp;
        f.y += (f.s + f.vy) * k;
        f.w += 0.01 * k;
        f.x += (Math.sin(f.w) * 0.3 + f.vx) * k;
        if (f.y > H + 5) {
          f.y = -5;
          f.x = Math.random() * W;
          f.vx = 0;
          f.vy = 0;
          // Снег от прыжка больше не нужен: обычные снежинки падают по кругу, эти исчезают
          if (f.temp) f.o = 0;
        }
        ctx.globalAlpha = f.o;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 6.28);
        ctx.fill();
      }
      for (let i = flakes.length - 1; i >= 0; i--) if (flakes[i].temp && flakes[i].o === 0) flakes.splice(i, 1);
      start();
    };
    const start = () => {
      if (raf || timer || !inView || document.hidden) return;
      const wait = last ? FRAME_MS - (performance.now() - last) : 0;
      timer = window.setTimeout(() => {
        timer = 0;
        raf = requestAnimationFrame(tick);
      }, Math.max(0, wait));
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      raf = 0;
      timer = 0;
      last = 0;
    };
    // Горсть снега: снежинки вылетают вверх и в стороны, тормозят и потом медленно оседают
    const onPuff = (e) => {
      const { x, y, spread } = e.detail;
      const r = cv.getBoundingClientRect();
      const room = PUFF_MAX - flakes.filter((f) => f.temp).length;
      for (let i = 0; i < Math.min(26, room); i++) {
        const side = Math.random() * 2 - 1;
        flakes.push({
          x: x - r.left + side * spread, y: y - r.top - Math.random() * 10,
          r: 1.5 + Math.random() * 3, s: 0.5 + Math.random() * 0.8, o: 0.5 + Math.random() * 0.4, w: Math.random() * 6.28,
          vx: side * (1.5 + Math.random() * 3), vy: -(3 + Math.random() * 5), temp: true,
        });
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    // Снег идёт, пока видно хотя бы 15 % секции: на узкой полоске у края экрана его не видно, а у ёлки маршрута
    // каждый кадр снега стоил процессору втрое больше покоя (правка 28.10)
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting && e.intersectionRatio >= 0.15;
      if (inView) start();
      else stop();
    }, { threshold: [0, 0.15, 0.3] });
    io.observe(host);
    start();
    window.addEventListener('resize', size);
    document.addEventListener('visibilitychange', onVisibility);
    host.addEventListener(SNOW_PUFF, onPuff);
    return () => {
      io.disconnect();
      stop();
      host.removeEventListener(SNOW_PUFF, onPuff);
      window.removeEventListener('resize', size);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  if (reduced) return null;
  return <canvas ref={ref} className="snow" aria-hidden="true" data-speed={speed} />;
}
