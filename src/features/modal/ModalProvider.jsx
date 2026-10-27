import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { ModalContext } from './context';

/** Окна, для которых нужен вход: гость сначала видит «Войти или зарегистрироваться» (правка 25.10) */
const NEEDS_AUTH = ['receipt'];

/**
 * Состояние окон: открытое окно, история (откуда пришли — для «назад») и окно, которое откроется после входа.
 * История: «Войти или зарегистрироваться» → «Регистрация» → «Магазин»; крестик возвращает на шаг назад (правка 27.10)
 * @typedef {Object} Nav
 * @property {ModalState} state
 * @property {OpenModal[]} history
 * @property {ModalName | null} afterAuth
 */

const EMPTY = { state: null, history: [], afterAuth: null };

function reducer(nav, action) {
  switch (action.type) {
    case 'open': {
      const afterAuth = action.afterAuth ?? nav.afterAuth;
      const { modal } = action;
      if (!nav.state) return { state: modal, history: [], afterAuth };
      if (nav.state.name === modal.name) return { ...nav, state: modal, afterAuth };
      // Вернулись в окно, которое уже было по пути (магазин → регистрация, «Назад к выбору»): история укорачивается
      const i = nav.history.findIndex((m) => m.name === modal.name);
      if (i >= 0) return { state: modal, history: nav.history.slice(0, i), afterAuth };
      return { state: modal, history: [...nav.history, nav.state], afterAuth };
    }
    case 'back': {
      if (!nav.history.length) return EMPTY;
      return { ...nav, state: nav.history[nav.history.length - 1], history: nav.history.slice(0, -1) };
    }
    case 'close':
      // Закрыл окно сам — намерение (например, «после входа открыть чек») отменено
      return EMPTY;
    case 'finishAuth':
      return nav.afterAuth ? { state: { name: nav.afterAuth, payload: undefined }, history: [], afterAuth: null } : EMPTY;
  }
}

/** Менеджер окон: кто открыт и с какими данными. Разметка окон — в widgets/modal-host. */
export function ModalProvider({ children }) {
  const { user, ready } = useSession();
  const [nav, dispatch] = useReducer(reducer, EMPTY);
  const { state, afterAuth } = nav;

  const open = useCallback((name, payload) => {
    if (NEEDS_AUTH.includes(name) && ready && !user) {
      // Гость нажал «Зарегистрировать чек» — сначала вход, а окно чека сразу после него
      dispatch({ type: 'open', modal: { name: 'auth', payload: undefined }, afterAuth: name });
      return;
    }
    dispatch({ type: 'open', modal: { name, payload } });
  }, [ready, user]);

  const close = useCallback(() => dispatch({ type: 'close' }), []);
  const back = useCallback(() => dispatch({ type: 'back' }), []);

  const finishAuth = useCallback(() => {
    dispatch({ type: 'finishAuth' });
    return afterAuth !== null;
  }, [afterAuth]);

  // Переход на другую страницу (в том числе кнопкой «Назад» браузера) закрывает окно: оно не должно висеть над чужой страницей.
  // Сброс прямо при отрисовке, когда сменился адрес (без эффекта — так рекомендует React для производного состояния)
  const { key } = useLocation();
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    if (state || afterAuth) dispatch({ type: 'close' });
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

  const value = useMemo(() => ({ state, open, close, back, afterAuth, finishAuth }), [state, open, close, back, afterAuth, finishAuth]);
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}
