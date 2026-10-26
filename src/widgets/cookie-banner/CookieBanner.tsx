import { useEffect, useState } from 'react';
import { api } from '@/shared/api';
import { Button } from '@/shared/ui/button/Button';
import './CookieBanner.scss';

/** Cookie-открытка. Показывается, пока пользователь не ответил; ответ хранит слой данных. */
export function CookieBanner() {
  // Показываем, только если пользователь ещё не отвечал; класс is-open ставится кадром позже ради анимации появления
  const [visible, setVisible] = useState(() => api.cookieConsent() === undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  if (!visible) return null;

  const answer = (yes: boolean) => {
    api.cookieConsent(yes);
    setOpen(false);
    window.setTimeout(() => setVisible(false), 300);
    /* Здесь подключаются счётчики (Метрика и т. п.) только при согласии yes === true. */
  };

  return (
    <div className={`cookie${open ? ' is-open' : ''}`} role="region" aria-label="Cookie">
      <b>Мы используем cookie</b>
      <p>Только для работы сайта и&nbsp;чтобы помнить ваш магазин. Статистику включаем после вашего согласия.</p>
      <div className="cookie__actions">
        <Button small onClick={() => answer(true)}>Принять</Button>
        <Button small variant="secondary" onClick={() => answer(false)}>Только нужные</Button>
      </div>
    </div>
  );
}
