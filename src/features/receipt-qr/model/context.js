import { createContext, useContext } from 'react';

/**
 * Итог регистрации чека по QR-коду
 * @typedef {{ status: 'sending' | 'done' | 'error', code: string, message?: string }} QrResult
 */

export const QrReceiptContext = createContext({ pending: null, result: null, retry: () => {} });

/** Отсканированный чек (pending), итог его регистрации (result) и повтор после ошибки (retry) */
export function useQrReceipt() {
  return useContext(QrReceiptContext);
}
