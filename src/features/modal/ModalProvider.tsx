import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { ModalContext, type ModalName, type ModalPayloads, type ModalState } from './context';

/** Окна, для которых нужен вход: гость сначала видит «Войти или зарегистрироваться» (правка 25.10) */
const NEEDS_AUTH: ModalName[] = ['receipt'];

/** Менеджер окон: кто открыт и с какими данными. Разметка окон — в widgets/modal-host. */
export function ModalProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();
  const [state, setState] = useState<ModalState>(null);
  // Куда вернуться после входа: гость нажал «Зарегистрировать чек» — после входа сразу окно чека
  const [afterAuth, setAfterAuth] = useState<ModalName | null>(null);

  const open = useCallback(<K extends ModalName>(name: K, payload?: ModalPayloads[K]) => {
    if (NEEDS_AUTH.includes(name) && ready && !user) {
      setAfterAuth(name);
      setState({ name: 'auth', payload: undefined });
      return;
    }
    setState({ name, payload } as ModalState);
  }, [ready, user]);

  // Закрыл окно сам (крестик, Esc) — намерение отменено
  const close = useCallback(() => {
    setState(null);
    setAfterAuth(null);
  }, []);

  const finishAuth = useCallback(() => {
    if (afterAuth) {
      setState({ name: afterAuth, payload: undefined } as ModalState);
      setAfterAuth(null);
      return true;
    }
    setState(null);
    return false;
  }, [afterAuth]);

  // Переход на другую страницу (в том числе кнопкой «Назад» браузера) закрывает окно: оно не должно висеть над чужой страницей.
  // Сброс прямо при отрисовке, когда сменился адрес (без эффекта — так рекомендует React для производного состояния)
  const { key } = useLocation();
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    if (state) setState(null);
    if (afterAuth) setAfterAuth(null);
  }

  // Пока открыто окно, страница не прокручивается; ширину полосы прокрутки компенсируем отступом (--sbw)
  useEffect(() => {
    const html = document.documentElement;
    if (state) {
      html.style.setProperty('--sbw', `${Math.max(0, window.innerWidth - html.clientWidth)}px`);
      html.classList.add('modal-open');
    } else {
      html.classList.remove('modal-open');
    }
  }, [state]);

  const value = useMemo(() => ({ state, open, close, afterAuth, finishAuth }), [state, open, close, afterAuth, finishAuth]);
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}
