import { createContext, useContext } from 'react';

export const ToastContext = createContext<(message: string) => void>(() => {});

/** Показать короткое уведомление: const toast = useToast(); toast('Вы вошли') */
export function useToast() {
  return useContext(ToastContext);
}
