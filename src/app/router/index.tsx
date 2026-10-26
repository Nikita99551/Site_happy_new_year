import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { PageLoader } from '@/shared/ui/page-loader/PageLoader';
import { ROUTES } from './routes';

const RELOAD_KEY = 'anix_chunk_reload';

/**
 * После выкладки новой версии у человека с открытой вкладкой старые файлы страниц пропадают (404).
 * Тогда один раз перезагружаем страницу — подтянется свежая версия. Если не помогло — ошибку покажет ErrorBoundary.
 */
function withReload<T>(importer: () => Promise<T>): () => Promise<T> {
  return () =>
    importer().then(
      (m) => {
        try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* приватный режим */ }
        return m;
      },
      (err: unknown) => {
        let reloaded = false;
        try { reloaded = sessionStorage.getItem(RELOAD_KEY) === '1'; sessionStorage.setItem(RELOAD_KEY, '1'); } catch { /* приватный режим */ }
        if (reloaded) throw err;
        window.location.reload();
        return new Promise<T>(() => {}); // страница перезагружается — ничего не рисуем
      },
    );
}

// «Мой маршрут» грузится по требованию
const RoutePage = lazy(withReload(() => import('@/pages/route')));

/**
 * Когда текущая страница загрузилась и браузер свободен, в фоне подгружаем «Мой маршрут»:
 * переходы по меню становятся мгновенными, а на медленном интернете не висит старая страница.
 */
function usePrefetchPages() {
  useEffect(() => {
    const run = () => {
      // Фоновая подгрузка: если файлов уже нет (вышла новая версия) — молча пропускаем, перезагрузка будет при переходе
      import('@/pages/route').catch(() => {});
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    let id = 0;
    const start = () => { id = idle(run) as number; };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      cancel(id);
    };
  }, []);
}

export function AppRouter() {
  usePrefetchPages();
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.route} element={<RoutePage />} />
        {/* В показе только две страницы: любой другой адрес ведёт на главную */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </Suspense>
  );
}
