import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/lib/hooks';

/** Не больше стольких снежинок от прыжков одновременно (если нажимать часто) */
const PUFF_MAX = 120;

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
    const size = () => {
      W = cv.width = host.clientWidth;
      H = cv.height = host.clientHeight;
    };
    size();
    const flakes = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 3, s: 0.3 + Math.random() * 0.7, o: 0.25 + Math.random() * 0.45, w: Math.random() * 6.28, vx: 0, vy: 0 }));
    const tick = () => {
      raf = 0;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#fff8e8';
      for (const f of flakes) {
        f.vx *= 0.93;
        f.vy *= 0.93;
        f.y += f.s + f.vy;
        f.w += 0.01;
        f.x += Math.sin(f.w) * 0.3 + f.vx;
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
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
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
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) start();
      else stop();
    });
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
