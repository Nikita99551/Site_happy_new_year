import { useEffect, type ReactNode } from 'react';
import { Header } from '@/widgets/header/Header';
import { Footer } from '@/widgets/footer/Footer';
import { useReveal } from '@/shared/ui/reveal/useReveal';
import { usePauseOffscreen } from '@/shared/ui/reveal/usePauseOffscreen';

interface PageLayoutProps {
  /** Заголовок вкладки */
  title: string;
  /** Зелёная шапка (главная) */
  hero?: boolean;
  /** Не индексировать (личная страница) */
  noindex?: boolean;
  children: ReactNode;
  /** Данные, после загрузки которых появляются новые .reveal-блоки */
  revealDeps?: unknown[];
}

// Показ на GitHub Pages закрыт от поисковиков целиком (VITE_NOINDEX=1 при сборке)
const NOINDEX_ALL = import.meta.env.VITE_NOINDEX === '1';

/** Общий каркас страницы: шапка, контент, подвал, заголовок вкладки, появление блоков. */
export function PageLayout({ title, hero, noindex, children, revealDeps = [] }: PageLayoutProps) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
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
      <Footer />
    </>
  );
}
