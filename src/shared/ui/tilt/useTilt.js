import { useEffect } from 'react';

/** Наибольший наклон, градусы */
const MAX = 4;

/**
 * Карточка наклоняется за курсором, как открытка в руке, и по ней скользит блик.
 * Пишет --tilt-x / --tilt-y (градусы) и --glare-x / --glare-y (проценты); наклон и блик рисует CSS карточки.
 * Пока курсор над карточкой, на ней класс .is-tilting (короткий переход), при уходе она плавно выпрямляется.
 * Только мышь; во время перетаскивания карусели карточка ровная. При reduced-motion и ?noanim выключено.
 */
export function useTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || /noanim/.test(location.search)) return;

    const reset = () => {
      el.classList.remove('is-tilting');
      ['--tilt-x', '--tilt-y', '--glare-x', '--glare-y'].forEach((p) => el.style.removeProperty(p));
    };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      if (e.buttons) {
        reset();
        return;
      }
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.classList.add('is-tilting');
      // Курсор справа — правый край уходит от нас (поворот вокруг Y), курсор сверху — верхний край уходит от нас
      el.style.setProperty('--tilt-y', `${((px - 0.5) * 2 * MAX).toFixed(2)}deg`);
      el.style.setProperty('--tilt-x', `${((0.5 - py) * 2 * MAX).toFixed(2)}deg`);
      el.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
      reset();
    };
  }, [ref]);
}
