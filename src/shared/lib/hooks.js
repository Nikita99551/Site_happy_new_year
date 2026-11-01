import { useEffect, useState } from 'react';

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

/**
 * Ширина элемента, обновляется при изменении размера. guess — первая прикидка (например, ширина окна):
 * настоящую ширину сообщит ResizeObserver сразу после первой раскладки. Раньше ширина читалась прямо при
 * отрисовке React, и браузеру приходилось раскладывать всю страницу посреди неё — на слабом телефоне это
 * склеивало загрузку в одну долгую задачу (правка 01.11).
 */
export function useElementWidth(ref, guess = 0) {
  const [width, setWidth] = useState(guess);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // В колбэке ResizeObserver раскладка уже готова — clientWidth ничего не пересчитывает
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
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
