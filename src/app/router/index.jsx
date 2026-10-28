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
function withReload(importer) {
  return () =>
    importer().then(
      (m) => {
        try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* приватный режим */ }
        return m;
      },
      (err) => {
        let reloaded = false;
        try { reloaded = sessionStorage.getItem(RELOAD_KEY) === '1'; sessionStorage.setItem(RELOAD_KEY, '1'); } catch { /* приватный режим */ }
        if (reloaded) throw err;
        window.location.reload();
        return new Promise(() => {}); // страница перезагружается — ничего не рисуем
      },
    );
}

// Остальные показанные страницы грузятся по требованию
const RoutePage = lazy(withReload(() => import('@/pages/route')));
const ConditionsPage = lazy(withReload(() => import('@/pages/conditions')));

/**
 * Когда текущая страница загрузилась и браузер свободен, в фоне подгружаем остальные страницы:
 * переходы по меню становятся мгновенными, а на медленном интернете не висит старая страница.
 */
function usePrefetchPages() {
  useEffect(() => {
    const run = () => {
      // Фоновая подгрузка: если файлов уже нет (вышла новая версия) — молча пропускаем, перезагрузка будет при переходе
      for (const f of [() => import('@/pages/route'), () => import('@/pages/conditions')]) f().catch(() => {});
    };
    const idle = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 2000));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    let id = 0;
    const start = () => { id = idle(run); };
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
        <Route path={ROUTES.conditions} element={<ConditionsPage />} />
        {/* В показе только готовые страницы: любой другой адрес ведёт на главную */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </Suspense>
  );
}
