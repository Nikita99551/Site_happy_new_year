import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SAVED_KEY = 'anix_scroll';

/** Сохранённая позиция прокрутки для перезагрузки (F5): { путь, y } */
function readSaved() {
  try {
    const raw = sessionStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * При переходе на новую страницу прокручиваем к началу, при якоре (#partners) — к элементу.
 * Смена страницы — мгновенно (html имеет scroll-behavior: smooth, иначе прокрутка «едет» через всю новую страницу);
 * якорь на той же странице — плавно. После перезагрузки (F5) возвращаем прежнюю позицию сами:
 * страницы ленивые, и к моменту, когда браузер восстанавливает прокрутку, страницы ещё нет.
 */
export function ScrollManager() {
  // key меняется при каждом переходе: повторный клик по «Партнёры» на той же странице снова прокручивает к разделу
  const { pathname, hash, key } = useLocation();
  const prevPath = useRef(null);

  // Позицию запоминаем при уходе со страницы (перезагрузка, закрытие вкладки)
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const save = () => {
      try {
        // Путь внутри сайта (как у роутера), без подпапки GitHub Pages
        sessionStorage.setItem(SAVED_KEY, JSON.stringify({ path: prevPath.current, y: window.scrollY }));
      } catch {
        /* приватный режим: без восстановления */
      }
    };
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, []);

  useEffect(() => {
    // Первая загрузка (в том числе F5): у react-router ключ 'default'
    const firstRender = key === 'default';
    const samePage = prevPath.current === pathname;
    prevPath.current = pathname;
    const behavior = samePage ? 'smooth' : 'instant';
    let timer = 0;

    if (firstRender && !hash) {
      const saved = readSaved();
      if (!saved || saved.path !== pathname || saved.y <= 0) return;
      // Ждём, пока ленивая страница отрисуется и станет достаточно высокой
      const restore = (attempt = 0) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max >= saved.y || attempt >= 40) window.scrollTo({ top: Math.min(saved.y, max), behavior: 'instant' });
        else timer = window.setTimeout(() => restore(attempt + 1), 100);
      };
      restore();
      return () => window.clearTimeout(timer);
    }

    if (hash) {
      // Элемент может появиться после рендера ленивой страницы
      const id = hash.slice(1);
      const tryScroll = (attempt = 0) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: 'start', behavior });
        else if (attempt < 40) timer = window.setTimeout(() => tryScroll(attempt + 1), 100);
      };
      tryScroll();
    } else {
      window.scrollTo({ top: 0, behavior });
    }
    return () => window.clearTimeout(timer);
  }, [pathname, hash, key]);
  return null;
}
