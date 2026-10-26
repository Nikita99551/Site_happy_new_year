import { useLayoutEffect, useRef } from 'react';
import { formatNumber } from '@/shared/lib/text';

interface CountUpProps {
  value: number;
  className?: string;
  /** Длительность счёта, мс */
  duration?: number;
}

/**
 * Число «досчитывает» от нуля до значения, когда появляется на экране (один раз).
 * При reduced-motion и `?noanim` сразу показывает итог. Экранный диктор читает итоговое число.
 */
export function CountUp({ value, className = 'num', duration = 1100 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  // Текст пишется прямо в DOM: счёт идёт без перерисовок React
  useLayoutEffect(() => {
    const el = ref.current;
    const out = digits.current;
    if (!el || !out) return;
    const show = (n: number) => (out.textContent = formatNumber(n));
    const instant = played.current || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || /noanim/.test(location.search);
    show(instant ? value : 0);
    if (instant) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      played.current = true;
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        show(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      show(value);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className} aria-label={formatNumber(value)}>
      <span ref={digits} aria-hidden="true" />
    </span>
  );
}
