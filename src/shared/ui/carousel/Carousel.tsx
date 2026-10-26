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

/** Горизонтальная карусель карточек: прокрутка со snap, стрелки, точки, перетаскивание мышью. */
export function Carousel({ head, children, after }: CarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const count = Children.count(children);
  const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';

  const stepWidth = useCallback(() => {
    const first = track.current?.firstElementChild;
    return first ? first.getBoundingClientRect().width + 24 : 300;
  }, []);

  const scrollBy = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * stepWidth(), behavior });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setActive(Math.round(el.scrollLeft / stepWidth()));
    el.addEventListener('scroll', onScroll, { passive: true });

    // Перетаскивание мышью (на тач-экранах прокрутка нативная)
    let drag: { x: number; left: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      drag = { x: e.clientX, left: el.scrollLeft, moved: false };
      el.style.scrollSnapType = 'none';
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      el.scrollLeft = drag.left - dx;
    };
    const onUp = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      el.style.cursor = '';
      el.style.scrollSnapType = '';
      if (moved) {
        const s = stepWidth();
        el.scrollTo({ left: Math.round(el.scrollLeft / s) * s, behavior });
      }
    };
    const onDragStart = (e: Event) => e.preventDefault();
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('dragstart', onDragStart);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('dragstart', onDragStart);
    };
  }, [behavior, stepWidth]);

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
