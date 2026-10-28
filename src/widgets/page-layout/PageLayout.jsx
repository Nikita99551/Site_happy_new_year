import { useEffect } from 'react';
import { Header } from '@/widgets/header/Header';
import { Footer } from '@/widgets/footer/Footer';
import { useReveal } from '@/shared/ui/reveal/useReveal';
import { usePauseOffscreen } from '@/shared/ui/reveal/usePauseOffscreen';

// Показ на GitHub Pages закрыт от поисковиков целиком (VITE_NOINDEX=1 при сборке)
const NOINDEX_ALL = import.meta.env.VITE_NOINDEX === '1';

/** Общий каркас страницы: шапка, контент, подвал, заголовок вкладки, появление блоков. */
export function PageLayout({ title, hero, compactFooter, noindex, children, revealDeps = [] }) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="robots"]');
    if (noindex || NOINDEX_ALL) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'robots';
        document.head.appendChild(meta);
      }
      meta.content = 'noindex';
    } else {
      meta?.remove();
    }
  }, [title, noindex]);
  useReveal(revealDeps);
  usePauseOffscreen(revealDeps);

  return (
    <>
      <Header hero={hero} />
      <main>{children}</main>
      <Footer compact={compactFooter} />
    </>
  );
}
