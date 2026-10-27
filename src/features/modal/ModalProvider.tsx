import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { ModalContext, type ModalName, type ModalPayloads, type ModalState } from './context';

/** Окна, для которых нужен вход: гость сначала видит «Войти или зарегистрироваться» (правка 25.10) */
const NEEDS_AUTH: ModalName[] = ['receipt'];

type OpenModal = Exclude<ModalState, null>;

/**
 * Состояние окон: открытое окно, история (откуда пришли — для «назад») и окно, которое откроется после входа.
 * История: «Войти или зарегистрироваться» → «Регистрация» → «Магазин»; крестик возвращает на шаг назад (правка 27.10)
 */
interface Nav {
  state: ModalState;
  history: OpenModal[];
  afterAuth: ModalName | null;
}

type Action =
  | { type: 'open'; modal: OpenModal; afterAuth?: ModalName }
  | { type: 'back' }
  | { type: 'close' }
  | { type: 'finishAuth' };

const EMPTY: Nav = { state: null, history: [], afterAuth: null };

function reducer(nav: Nav, action: Action): Nav {
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
      return nav.afterAuth ? { state: { name: nav.afterAuth, payload: undefined } as OpenModal, history: [], afterAuth: null } : EMPTY;
  }
}

/** Менеджер окон: кто открыт и с какими данными. Разметка окон — в widgets/modal-host. */
export function ModalProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();
  const [nav, dispatch] = useReducer(reducer, EMPTY);
  const { state, afterAuth } = nav;

  const open = useCallback(<K extends ModalName>(name: K, payload?: ModalPayloads[K]) => {
    if (NEEDS_AUTH.includes(name) && ready && !user) {
      // Гость нажал «Зарегистрировать чек» — сначала вход, а окно чека сразу после него
      dispatch({ type: 'open', modal: { name: 'auth', payload: undefined }, afterAuth: name });
      return;
    }
    dispatch({ type: 'open', modal: { name, payload } as OpenModal });
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
