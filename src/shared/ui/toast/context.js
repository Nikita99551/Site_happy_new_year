import { createContext, useContext } from 'react';

export const ToastContext = createContext(() => {});

/** Показать короткое уведомление: const toast = useToast(); toast('Вы вошли') */
export function useToast() {
  return useContext(ToastContext);
}
