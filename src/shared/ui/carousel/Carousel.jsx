import { Children, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/lib/hooks';
import { IconArrowLeft, IconArrowRight } from '@/shared/ui/icons/Icons';
import './Carousel.scss';

/**
 * Горизонтальная карусель карточек: свободная прокрутка (без привязки к карточкам — где отпустил, там и осталась),
 * перетаскивание мышью с плавным докатом, стрелки к соседней карточке, точки (правка 27.10).
 */
export function Carousel({ head, children, after, label = 'Лента карточек' }) {
  const track = useRef(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);
  // Точек столько, сколько у ленты положений «карточка у левого края» (последнее — упор в конец), а не по одной
  // на карточку: на компьютере видно три-четыре карточки, и прежние точки 5–6 никогда не загорались, а в конце
  // выделение перескакивало сразу на последнюю (правка 02.11)
  const [pages, setPages] = useState(count);
  const stops = useRef([0]);
  const reduced = useReducedMotion();
  const behavior = reduced ? 'auto' : 'smooth';

  // Стрелка — к началу следующей (предыдущей) карточки, даже если лента остановилась посередине
  const scrollBy = (dir) => {
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.children);
    const base = cards[0]?.offsetLeft ?? 0;
    const lefts = cards.map((c) => c.offsetLeft - base);
    const now = el.scrollLeft;
    const target = dir > 0 ? lefts.find((x) => x > now + 4) : [...lefts].reverse().find((x) => x < now - 4);
    el.scrollTo({ left: target ?? (dir > 0 ? el.scrollWidth : 0), behavior });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    // Горит точка положения, ближайшего к текущей прокрутке
    const onScroll = () => {
      const xs = stops.current;
      const s = el.scrollLeft;
      let best = 0;
      for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - s) < Math.abs(xs[best] - s)) best = i;
      setActive(best);
    };
    // Положения ленты пересчитываются при смене ширины (поворот телефона, окно браузера)
    const measure = () => {
      const cards = Array.from(el.children);
      const base = cards[0]?.offsetLeft ?? 0;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      const xs = [];
      for (const c of cards) {
        const x = Math.min(c.offsetLeft - base, max);
        if (!xs.length || x - xs[xs.length - 1] > 8) xs.push(x);
      }
      stops.current = xs.length ? xs : [0];
      setPages(stops.current.length);
      onScroll();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener('scroll', onScroll, { passive: true });

    // Перетаскивание мышью (на тач-экранах прокрутка нативная, с инерцией браузера).
    // После отпускания лента ещё немного катится и плавно тормозит — без возврата к карточке
    let drag = null;
    let glide = 0;
    const stopGlide = () => cancelAnimationFrame(glide);
    const onDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stopGlide();
      drag = { x: e.clientX, left: el.scrollLeft, moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
      el.style.cursor = 'grabbing';
    };
    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      el.scrollLeft = drag.left - dx;
      const dt = e.timeStamp - drag.lastT;
      if (dt > 0) drag.v = 0.7 * ((e.clientX - drag.lastX) / dt) + 0.3 * drag.v;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
    };
    const onUp = (e) => {
      if (!drag) return;
      const { moved, lastT } = drag;
      // Мышь остановили перед тем, как отпустить, — докатывать нечего
      let v = e.timeStamp - lastT > 80 ? 0 : -drag.v * 16;
      drag = null;
      el.style.cursor = '';
      if (!moved || reduced) return;
      const step = () => {
        if (Math.abs(v) < 0.4) return;
        el.scrollLeft += v;
        v *= 0.93;
        glide = requestAnimationFrame(step);
      };
      glide = requestAnimationFrame(step);
    };
    const onDragStart = (e) => e.preventDefault();
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('wheel', stopGlide, { passive: true });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('dragstart', onDragStart);
    return () => {
      stopGlide();
      ro.disconnect();
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('wheel', stopGlide);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('dragstart', onDragStart);
    };
  }, [count, reduced]);

  return (
    <div className="container carousel">
      <div className="carousel__head">
        {head}
        <div className="carousel__arrows">
          <button className="arrow" type="button" aria-label="Назад" onClick={() => scrollBy(-1)}><IconArrowLeft /></button>
          <button className="arrow arrow--primary" type="button" aria-label="Вперёд" onClick={() => scrollBy(1)}><IconArrowRight /></button>
        </div>
      </div>
      {/* Лента в фокусе листается стрелками клавиатуры; label — название ленты для экранного диктора */}
      <div className="carousel__track reveal" ref={track} tabIndex={0} role="region" aria-label={label}>{children}</div>
      {pages > 1 && (
        <div className="carousel__dots" aria-hidden="true">
          {Array.from({ length: pages }, (_, i) => <span key={i} className={i === active ? 'is-active' : undefined} />)}
        </div>
      )}
      {after}
    </div>
  );
}
