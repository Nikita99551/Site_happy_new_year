import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from '@/entities/user';
import { ModalProvider } from '@/features/modal';
import { SvgShapes } from '@/shared/ui/svg-shapes/SvgShapes';
import { ToastProvider } from '@/shared/ui/toast/ToastProvider';
import { CookieBanner } from '@/widgets/cookie-banner/CookieBanner';
import { ModalHost } from '@/widgets/modal-host/ModalHost';
import { AppRouter } from './router';
import { ScrollManager } from './router/ScrollManager';

// Адрес сайта без завершающего слэша: '/' локально, '/Site_happy_new_year' на GitHub Pages
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <SessionProvider>
        <ToastProvider>
          <ModalProvider>
            <SvgShapes />
            <ScrollManager />
            <AppRouter />
            <ModalHost />
            <CookieBanner />
          </ModalProvider>
        </ToastProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
