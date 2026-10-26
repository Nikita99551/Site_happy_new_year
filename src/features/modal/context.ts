import { createContext, useContext } from 'react';
import type { ReceiptResult } from '@/shared/api';

/** Имена окон сайта. Одновременно открыто не больше одного. */
export type ModalName = 'auth' | 'login' | 'register' | 'receipt' | 'processing' | 'success' | 'store';

export interface ModalPayloads {
  auth: undefined;
  login: undefined;
  register: undefined;
  receipt: undefined;
  processing: undefined;
  success: Extract<ReceiptResult, { status: 'done' }>;
  /** Куда вернуться после выбора магазина (например, в регистрацию) */
  store: { returnTo?: ModalName } | undefined;
}

export type ModalState = { [K in ModalName]: { name: K; payload: ModalPayloads[K] } }[ModalName] | null;

export interface ModalValue {
  state: ModalState;
  /** Открыть окно. Гостю вместо окна чека открывается вход, а окно чека — сразу после входа или регистрации */
  open<K extends ModalName>(name: K, payload?: ModalPayloads[K]): void;
  close(): void;
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
