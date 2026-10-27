import { createContext, useContext } from 'react';
/**
 * Имена окон сайта. Одновременно открыто не больше одного.
 * @typedef {'auth' | 'login' | 'register' | 'registered' | 'receipt' | 'processing' | 'store'} ModalName
 */

export const ModalContext = createContext(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal можно вызывать только внутри ModalProvider');
  return ctx;
}
