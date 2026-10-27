import { useEffect } from 'react';

/** Жёсткость и затухание маятника: ~1 качание в секунду, успокаивается за 2–3 с */
const STIFF = 55;
const DAMP = 3.2;

/**
 * Гирлянда откликается на курсор: лампочки рядом с мышью (или пальцем) раскачиваются, как настоящие, и успокаиваются.
 * host — область, где ловится движение (секция или открытка); качаются элементы `selector` внутри неё (по умолчанию лампочки `.bulb`).
 * Угол пишется в CSS-переменную `--sway`, а поворот задаёт CSS элемента: у лампочек `rotate` вокруг цоколя (`.lights .bulb`).
 * Анимации шагов (transform) не мешает.
 * При reduced-motion и `?noanim` выключено.
 */
export function useGarlandSway(host, { selector = '.bulb', reach = 90, maxAngle = 14, yWeight = 1.4 } = {}) {
  useEffect(() => {
    const root = host.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || /noanim/.test(location.search)) return;

    let bulbs = [];
    let raf = 0;
    let last = 0;
    let px = NaN;
    let pt = 0;

    // Центры лампочек относительно host: меряем при входе курсора (элементы могли смениться после ресайза)
    const measure = () => {
      const r = root.getBoundingClientRect();
      const prev = new Map(bulbs.map((b) => [b.el, b]));
      bulbs = Array.from(root.querySelectorAll(selector)).map((el) => {
        const b = el.getBoundingClientRect();
        const old = prev.get(el);
        return { el, x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top, a: old?.a ?? 0, v: old?.v ?? 0 };
      });
    };

    const tick = (t) => {
      const dt = Math.min(0.032, (t - last) / 1000 || 0.016);
      last = t;
      let busy = false;
      for (const b of bulbs) {
        if (b.a === 0 && b.v === 0) continue;
        b.v += (-STIFF * b.a - DAMP * b.v) * dt;
        b.a = Math.max(-maxAngle, Math.min(maxAngle, b.a + b.v * dt));
        if (Math.abs(b.a) < 0.05 && Math.abs(b.v) < 0.5) {
          b.a = 0;
          b.v = 0;
          b.el.style.removeProperty('--sway');
        } else {
          b.el.style.setProperty('--sway', `${b.a.toFixed(2)}deg`);
          busy = true;
        }
      }
      raf = busy ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    // Толчок лампочкам рядом с точкой (x, y): speed — скорость курсора в px/мс, ближние качаются сильнее
    const push = (x, y, speed) => {
      let hit = false;
      for (const b of bulbs) {
        const d = Math.hypot(b.x - x, (b.y - y) * yWeight);
        if (d > reach) continue;
        // Курсор вправо → низ уходит вправо → поворот против часовой (отрицательный угол). Сила пропорциональна maxAngle
        b.v -= speed * (1 - d / reach) * maxAngle;
        b.v = Math.max(-maxAngle * 6.8, Math.min(maxAngle * 6.8, b.v));
        hit = true;
      }
      if (hit) kick();
    };

    const onEnter = () => {
      measure();
      px = NaN;
    };
    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const now = e.timeStamp;
      if (!Number.isNaN(px) && now > pt) push(x, y, Math.max(-3, Math.min(3, (x - px) / (now - pt))));
      px = x;
      pt = now;
    };
    // Касание пальцем: лёгкий толчок в сторону от точки касания
    const onDown = (e) => {
      if (e.pointerType === 'mouse') return;
      if (!bulbs.length) measure();
      const r = root.getBoundingClientRect();
      push(e.clientX - r.left, e.clientY - r.top, Math.random() < 0.5 ? -2.5 : 2.5);
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onDown);
      bulbs.forEach((b) => b.el.style.removeProperty('--sway'));
    };
  }, [host, selector, reach, maxAngle, yWeight]);
}
