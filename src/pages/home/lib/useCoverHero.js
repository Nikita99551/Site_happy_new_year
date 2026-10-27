import { useEffect } from 'react';

/**
 * Первый экран «уходит под бумагу»: когда его низ доходит до низа экрана, он замирает (sticky),
 * а следующий блок наезжает поверх рваным краем и закрывает его. Пока блок наезжает, первый экран темнеет
 * и чуть отдаляется — CSS берёт долю перекрытия из --cover (0…1), стили в HomePage.scss (.hero--pin).
 * Верх sticky = высота окна − высота блока (--hero-h): блок сначала прокручивается целиком (видны «2027» и коза) и только потом замирает.
 * Замирает он внутри обёртки .hero-stack (первый экран + следующий блок), дальше уезжает вместе с ней уже закрытым.
 * При reduced-motion и ?noanim — обычная прокрутка без наезда.
 */
export function useCoverHero(hero) {
  useEffect(() => {
    const el = hero.current;
    const next = el?.nextElementSibling;
    if (!el || !next) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || /noanim/.test(location.search)) return;

    let raf = 0;
    let last = '';
    let heroH = 0;
    // Верх sticky считает CSS: min(0, 100svh − --hero-h). svh не меняется, когда на телефоне прячется адресная строка, — блок не дёргается
    const measure = () => {
      heroH = el.offsetHeight;
      el.style.setProperty('--hero-h', `${heroH}px`);
    };
    const frame = () => {
      raf = 0;
      // Доля перекрытия считается с момента, когда первый экран замер: тогда верх следующего блока стоит на низе первого экрана
      // (низ окна, а если первый экран ниже окна — его высота). Иначе на высоких экранах, где следующий блок виден сразу,
      // первый экран темнел бы уже при загрузке. clientHeight не прыгает от адресной строки телефона
      const start = Math.min(document.documentElement.clientHeight, heroH) || 1;
      const cover = Math.max(0, Math.min(1, 1 - next.getBoundingClientRect().top / start)).toFixed(3);
      if (cover === last) return;
      last = cover;
      el.style.setProperty('--cover', cover);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    el.classList.add('hero--pin');
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      el.classList.remove('hero--pin');
      el.style.removeProperty('--hero-h');
      el.style.removeProperty('--cover');
    };
  }, [hero]);
}
