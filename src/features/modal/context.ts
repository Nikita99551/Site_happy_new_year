import { createContext, useContext } from 'react';
/** Имена окон сайта. Одновременно открыто не больше одного. */
export type ModalName = 'auth' | 'login' | 'register' | 'registered' | 'receipt' | 'processing' | 'store';

export interface ModalPayloads {
  auth: undefined;
  login: undefined;
  register: undefined;
  /** Кабинет создан — окно «Вы зарегистрированы» */
  registered: undefined;
  receipt: undefined;
  processing: undefined;
  /** Куда вернуться после выбора магазина (например, в регистрацию) */
  store: { returnTo?: ModalName } | undefined;
}

export type ModalState = { [K in ModalName]: { name: K; payload: ModalPayloads[K] } }[ModalName] | null;

export interface ModalValue {
  state: ModalState;
  /** Открыть окно. Гостю вместо окна чека открывается вход, а окно чека — сразу после входа или регистрации */
  open<K extends ModalName>(name: K, payload?: ModalPayloads[K]): void;
  close(): void;
  /** Крестик в окне, открытом из другого окна: вернуться в предыдущее (вход → выбор «войти или зарегистрироваться»), иначе закрыть */
  back(): void;
  /** Окно, которое откроется после входа/регистрации (гость нажал «Зарегистрировать чек»), или null */
  afterAuth: ModalName | null;
  /**
   * Вход или регистрация прошли. Если человек пришёл из кнопки чека — открывает окно чека и возвращает true,
   * иначе закрывает окно и возвращает false.
   */
  finishAuth(): boolean;
}

export const ModalContext = createContext<ModalValue | null>(null);


export function useModal(): ModalValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal можно вызывать только внутри ModalProvider');
  return ctx;
}
