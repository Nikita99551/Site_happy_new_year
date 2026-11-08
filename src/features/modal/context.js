import { createContext, useContext } from 'react';
/**
 * Имена окон сайта. Одновременно открыто не больше одного.
 * 'task' — задание партнёра с коробки на ёлке, 'answers' — все ответы на задание, 'answer' — форма ответа (правка 08.11)
 * @typedef {'auth' | 'login' | 'register' | 'registered' | 'receipt' | 'qr' | 'processing' | 'store' | 'task' | 'answers' | 'answer'} ModalName
 */

export const ModalContext = createContext(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal можно вызывать только внутри ModalProvider');
  return ctx;
}
