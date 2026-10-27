import { useEffect, useLayoutEffect, useState } from 'react';

/** Пользователь попросил меньше анимаций (системная настройка) */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia('(prefers-reduced-motion: reduce)').matches));
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Ширина элемента, обновляется при изменении размера */
export function useElementWidth(ref) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/** true на экранах шириной ≤ 900 px (мобильная сетка) */
export function useIsMobile() {
  const [mobile, setMobile] = useState(() => (typeof window === 'undefined' ? false : window.innerWidth <= 900));
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mobile;
}

/** Вызывает колбэк после изменения размера окна с задержкой */
export function useWindowResize(callback, delay = 120) {
  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(callback, delay);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [callback, delay]);
}

/** Элемент виден на экране хотя бы на threshold (для анимаций, которые должны начаться у человека на глазах) */
export function useInView(ref, threshold = 0.35) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return inView;
}

/** Текущее время, обновляется раз в минуту (подписи «5 минут назад» не застывают) */
export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
