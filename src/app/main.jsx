import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Глобальные стили подключаются ДО компонентов, чтобы стили виджетов и страниц перекрывали базовые
// (в сборке их первыми в <head> ставит плагин globalCssFirst в vite.config.js)
import './styles/index.scss';
import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';

// Защита от показа во фрейме (заголовок frame-ancestors настраивается на хостинге, это запасной вариант)
if (window.top !== window.self) {
  try {
    window.top.location.href = window.location.href;
  } catch {
    document.body.style.display = 'none';
  }
}

// Очень узкий экран (< 360 px в портрете: старые iPhone SE, Android с крупным масштабом интерфейса): вёрстка рассчитана
// от 360 px, поэтому просим браузер показать страницу шириной 360 и уменьшить её под экран — ничего не вылезает за край
function fitNarrowScreen() {
  const meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;
  const portrait = window.matchMedia('(orientation: portrait)').matches;
  const narrow = portrait && Math.min(screen.width, screen.height) < 360;
  meta.content = narrow ? 'width=360, viewport-fit=cover' : 'width=device-width, initial-scale=1, viewport-fit=cover';
}
fitNarrowScreen();
window.matchMedia('(orientation: portrait)').addEventListener('change', fitNarrowScreen);

// Стартовый экран из index.html уже на виду (загрузка дольше 0,25 с): экран загрузки страницы продолжает его без мигания
if (performance.now() > 250) document.documentElement.classList.add('boot-shown');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
