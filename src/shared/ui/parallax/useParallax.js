import { useEffect } from 'react';

/**
 * Параллакс при прокрутке: слои внутри host едут с разной скоростью — у открытки появляется глубина.
 * За курсором ничего не двигается (решение Никиты 25.10: на мышь откликается только гирлянда).
 * Разметка на элементах внутри host:
 *  data-speed="0.2" — отставание при прокрутке: 0.2 = на 20 % медленнее страницы (дальний слой), минус — быстрее (ближний);
 *  data-speed-mobile — то же на экранах ≤ 900 px (по умолчанию половина data-speed);
 *  data-speed-min / data-speed-max — пределы этого сдвига в px (например, коза не поднимается выше задуманного);
 *  data-grow="0.06" — увеличение к концу host при прокрутке (точку опоры задаёт transform-origin).
 * Значения пишутся в CSS-переменные --par-y / --par-s, а применяет их CSS отдельными свойствами translate и scale
 * (animations.scss), поэтому transform анимаций появления и rotate наклонов не сбиваются. При reduced-motion и ?noanim выключено.
 * Пересчёт — только на прокрутку и изменение размера окна, в покое хук ничего не делает.
 */
export function useParallax(host, { origin = 'center' } = {}) {
  useEffect(() => {
    const root = host.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || /noanim/.test(location.search)) return;

    const num = (v, def) => (v === undefined || v === '' ? def : Number(v));
    const layers = Array.from(root.querySelectorAll('[data-speed], [data-grow]')).map((el) => {
      const speed = num(el.dataset.speed, 0);
      return {
        el,
        speed,
        speedMobile: num(el.dataset.speedMobile, speed / 2),
        min: num(el.dataset.speedMin, -Infinity),
        max: num(el.dataset.speedMax, Infinity),
        grow: num(el.dataset.grow, 0),
        last: {},
      };
    });
    if (!layers.length) return;
    // Стиль трогаем, только когда значение изменилось: блок за экраном не пересчитывается на каждом кадре прокрутки
    const set = (l, prop, value) => {
      if (l.last[prop] === value) return;
      l.last[prop] = value;
      l.el.style.setProperty(prop, value);
    };

    let raf = 0;
    const frame = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      // Высота окна без адресной строки телефона: clientHeight не меняется, когда она прячется, и слои не дёргаются
      const vh = document.documentElement.clientHeight;
      // Блок далеко за экраном — ничего не пересчитываем
      if (r.bottom < -vh || r.top > 2 * vh) return;
      // Насколько страница прокручена дальше опорной точки. Ограничено: у 'top' — высотой host (дальше он уже за экраном),
      // у 'center' — частью экрана, чтобы слои не разъезжались у его краёв
      const passed = origin === 'top' ? Math.max(0, Math.min(r.height, -r.top)) : Math.max(-vh * 0.6, Math.min(vh * 0.6, vh / 2 - (r.top + r.height / 2)));
      const mobile = window.innerWidth <= 900;
      const grown = Math.max(0, Math.min(1, passed / r.height));
      for (const l of layers) {
        const y = Math.max(l.min, Math.min(l.max, passed * (mobile ? l.speedMobile : l.speed)));
        set(l, '--par-y', `${y.toFixed(1)}px`);
        if (l.grow) set(l, '--par-s', (1 + grown * l.grow).toFixed(4));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      layers.forEach(({ el }) => ['--par-y', '--par-s'].forEach((p) => el.style.removeProperty(p)));
    };
  }, [host, origin]);
}
