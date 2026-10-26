import { useEffect } from 'react';

/**
 * Бесконечные CSS-анимации (мигание лампочек, покачивание козы, блики) ставятся на паузу, пока их блок за экраном:
 * класс .anim-off на секции (animations.scss). Без этого страница в покое перерисовывалась ~300 раз в секунду
 * и на слабых ноутбуках подтормаживала (замер 25.10).
 */
export function usePauseOffscreen(deps: unknown[] = []): void {
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('main section, footer'));
    if (!blocks.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle('anim-off', !e.isIntersecting);
      },
      { rootMargin: '150px 0px' },
    );
    blocks.forEach((b) => io.observe(b));
    return () => {
      io.disconnect();
      blocks.forEach((b) => b.classList.remove('anim-off'));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
