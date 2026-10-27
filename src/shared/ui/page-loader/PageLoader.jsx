/**
 * Загрузочный экран, пока грузится страница (Suspense). Разметка и стили совпадают с экраном в index.html
 * (стили лежат там, в <style>: экран должен появиться раньше, чем загрузится код сайта).
 *
 * Первый показ сразу после стартового экрана из index.html — без задержки появления, чтобы экран не мигнул
 * (класс html.boot-shown ставит main.jsx, снимается, когда этот экран закрывается). Дальше — с задержкой 0,25 с.
 */
import { useEffect } from 'react';

const BULBS = [[24, 24], [62, 35], [101, 34], [140, 18], [179, 34], [218, 35], [256, 24]];

export function PageLoader() {
  useEffect(() => () => document.documentElement.classList.remove('boot-shown'), []);
  return (
    <div className="boot" role="status" aria-live="polite">
      <div className="boot__logo"><img src="/img/logo.svg" alt="Аникс" width={156} height={41} /></div>
      <svg className="boot__garland" viewBox="0 0 280 72" aria-hidden="true">
        <path d="M4 10 C 50 46, 92 46, 140 18 C 188 46, 230 46, 276 10" fill="none" stroke="#0f2d1e" strokeWidth={3} strokeLinecap="round" />
        {BULBS.map(([x, y], i) => (
          <g key={i} className="boot__bulb" style={{ '--i': i }} transform={`translate(${x} ${y})`}>
            <rect x={-4} y={0} width={8} height={7} rx={2} fill="#0f2d1e" />
            <ellipse cx={0} cy={17} rx={8} ry={11} />
          </g>
        ))}
      </svg>
      <p className="boot__text">Зажигаем гирлянду…</p>
    </div>
  );
}
