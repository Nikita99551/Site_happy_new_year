import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/shared/lib/hooks';
import { IconArrowLeft, IconArrowRight } from '@/shared/ui/icons/Icons';
import './Carousel.scss';

interface CarouselProps {
  /** Заголовок секции (лента, h2, подзаголовок) слева от стрелок */
  head: ReactNode;
  /** Карточки */
  children: ReactNode;
  /** Контент под дорожкой (например, плашка финала) */
  after?: ReactNode;
}

/**
 * Горизонтальная карусель карточек: свободная прокрутка (без привязки к карточкам — где отпустил, там и осталась),
 * перетаскивание мышью с плавным докатом, стрелки к соседней карточке, точки (правка 27.10).
 */
export function Carousel({ head, children, after }: CarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const count = Children.count(children);
  const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';

  // Шаг между карточками — по реальному расстоянию между первыми двумя (зазор на телефоне меньше)
  const stepWidth = useCallback(() => {
    const [a, b] = Array.from(track.current?.children ?? []) as HTMLElement[];
    if (a && b) return b.offsetLeft - a.offsetLeft;
    return a ? a.getBoundingClientRect().width + 24 : 300;
  }, []);

  // Стрелка — к началу следующей (предыдущей) карточки, даже если лента остановилась посередине
  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const base = cards[0]?.offsetLeft ?? 0;
    const lefts = cards.map((c) => c.offsetLeft - base);
    const now = el.scrollLeft;
    const target = dir > 0 ? lefts.find((x) => x > now + 4) : [...lefts].reverse().find((x) => x < now - 4);
    el.scrollTo({ left: target ?? (dir > 0 ? el.scrollWidth : 0), behavior });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
      setActive(atEnd ? count - 1 : Math.round(el.scrollLeft / stepWidth()));
    };
    el.addEventListener('scroll', onScroll, { passive: true });

    // Перетаскивание мышью (на тач-экранах прокрутка нативная, с инерцией браузера).
    // После отпускания лента ещё немного катится и плавно тормозит — без возврата к карточке
    let drag: { x: number; left: number; moved: boolean; lastX: number; lastT: number; v: number } | null = null;
    let glide = 0;
    const stopGlide = () => cancelAnimationFrame(glide);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stopGlide();
      drag = { x: e.clientX, left: el.scrollLeft, moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      el.scrollLeft = drag.left - dx;
      const dt = e.timeStamp - drag.lastT;
      if (dt > 0) drag.v = 0.7 * ((e.clientX - drag.lastX) / dt) + 0.3 * drag.v;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
    };
    const onUp = (e: PointerEvent) => {
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
    const onDragStart = (e: Event) => e.preventDefault();
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('wheel', stopGlide, { passive: true });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('dragstart', onDragStart);
    return () => {
      stopGlide();
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('wheel', stopGlide);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('dragstart', onDragStart);
    };
  }, [count, reduced, stepWidth]);

  return (
    <div className="container carousel">
      <div className="carousel__head">
        {head}
        <div className="carousel__arrows">
          <button className="arrow" type="button" aria-label="Назад" onClick={() => scrollBy(-1)}><IconArrowLeft /></button>
          <button className="arrow arrow--primary" type="button" aria-label="Вперёд" onClick={() => scrollBy(1)}><IconArrowRight /></button>
        </div>
      </div>
      <div className="carousel__track reveal" ref={track}>{children}</div>
      <div className="carousel__dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => <span key={i} className={i === active ? 'is-active' : undefined} />)}
      </div>
      {after}
    </div>
  );
}
