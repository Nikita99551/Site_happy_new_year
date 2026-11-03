import { useLayoutEffect, useRef } from 'react';
import { formatNumber } from '@/shared/lib/text';

/**
 * Число «досчитывает» от нуля до значения, когда появляется на экране (один раз).
 * Число на первом экране показывает итог сразу (правка 03.11: на «Подарках» при открытии страницы были нули).
 * При reduced-motion и `?noanim` сразу показывает итог. Экранный диктор читает итоговое число.
 */
export function CountUp({ value, className = 'num', duration = 1100 }) {
  const ref = useRef(null);
  const digits = useRef(null);
  const played = useRef(false);

  // Текст пишется прямо в DOM: счёт идёт без перерисовок React
  useLayoutEffect(() => {
    const el = ref.current;
    const out = digits.current;
    if (!el || !out) return;
    const show = (n) => (out.textContent = formatNumber(n));
    const r = el.getBoundingClientRect();
    const onFirstScreen = r.top < window.innerHeight && r.bottom > 0;
    const instant = played.current || onFirstScreen || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || /noanim/.test(location.search);
    show(instant ? value : 0);
    if (instant) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      // Страница открылась ниже числа (ссылка на якорь, например /#partners) — число уже над экраном: сразу итог, без нуля
      if (!e.isIntersecting && e.boundingClientRect.bottom < 0) {
        io.disconnect();
        played.current = true;
        show(value);
        return;
      }
      if (!e.isIntersecting) return;
      io.disconnect();
      played.current = true;
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        show(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      show(value);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      <span ref={digits} aria-hidden="true" />
      {/* Диктор читает итоговое число скрытым текстом, а не бегущие цифры (aria-label на простом span стандарт не разрешает) */}
      <span className="sr-only">{formatNumber(value)}</span>
    </span>
  );
}
