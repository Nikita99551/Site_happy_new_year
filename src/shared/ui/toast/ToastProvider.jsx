import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContext } from './context';
import './Toast.scss';

/** Короткое уведомление внизу экрана («Вы вошли», «Магазин выбран»). */
export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const timer = useRef(0);

  const toast = useCallback((text) => {
    setMessage(text);
    setOpen(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo(() => toast, [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`toast${open ? ' is-open' : ''}`} role="status">{message}</div>
    </ToastContext.Provider>
  );
}

