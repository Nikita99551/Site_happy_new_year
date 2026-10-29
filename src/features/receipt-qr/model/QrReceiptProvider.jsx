import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { useToast } from '@/shared/ui/toast/context';
import { readPending, takeFreshScan, writePending } from '../lib/pending';
import { QrReceiptContext } from './context';

/** Окна, которые сами показывают итог чека по QR: уведомление поверх них не нужно */
const SHOWS_RESULT = ['qr', 'registered'];

/**
 * Чек по QR-коду (номер из ссылки забирает captureQrFromUrl в main.jsx).
 * - Вошёл: окно «Регистрируем чек», запрос сразу, потом «Чек обрабатывается».
 * - Гость: «Войти или зарегистрироваться» (окно 'qr' требует входа — NEEDS_AUTH в ModalProvider). Как только он вошёл
 *   или зарегистрировался, чек уходит в фоне: после входа откроется окно этого чека, после регистрации итог виден
 *   в окне «Вы зарегистрированы».
 * - Гость закрыл окно: номер ждёт во вкладке, чек зарегистрируется после любого входа.
 * Пока чек отправляется, result = null, а pending ещё есть: окна показывают «Регистрируем…».
 */
export function QrReceiptProvider({ children }) {
  const { user, ready, registerReceiptQr, refresh } = useSession();
  const { state: modal, open } = useModal();
  const toast = useToast();
  const [pending, setPending] = useState(readPending);
  const [result, setResult] = useState(null);
  const busy = useRef(false);
  const authRetried = useRef(false);
  const askLogin = useRef(false);
  const modalRef = useRef(modal);
  useEffect(() => {
    modalRef.current = modal;
  }, [modal]);

  const keep = useCallback((p) => {
    writePending(p);
    setPending(p);
  }, []);

  // Вышел из кабинета — итог чужого чека больше не показываем (сброс прямо при отрисовке, как в ModalProvider)
  const phone = user?.phone ?? null;
  const [lastPhone, setLastPhone] = useState(phone);
  if (phone !== lastPhone) {
    setLastPhone(phone);
    if (!phone) setResult(null);
  }

  // Только что открыли ссылку с чека: сразу окно (гостю ModalProvider покажет вход). Сессия закончилась — снова вход
  useEffect(() => {
    if (!ready) return;
    const scan = takeFreshScan();
    if (scan === 'invalid') {
      toast('Не получилось прочитать QR-код. Введите номер чека вручную');
      open('receipt');
    } else if (scan === 'valid' || (askLogin.current && !user)) {
      askLogin.current = false;
      open('qr');
    }
  }, [ready, user, open, toast]);

  // Есть вход и отсканированный чек — регистрируем (в том числе в фоне, сразу после входа или регистрации)
  useEffect(() => {
    if (!ready || !user || !pending || busy.current) return;
    busy.current = true;
    const { code } = pending;
    registerReceiptQr(code)
      .then(() => {
        keep(null);
        authRetried.current = false;
        setResult({ status: 'done', code });
        if (!SHOWS_RESULT.includes(modalRef.current?.name)) toast('Чек с QR-кода принят и обрабатывается');
      })
      .catch(async (err) => {
        if (err?.status === 401 && !authRetried.current) {
          // Сессия на сервере закончилась: номер ждёт, после обновления сессии гость снова увидит вход
          authRetried.current = true;
          askLogin.current = true;
          await refresh().catch(() => {});
          keep({ code, at: Date.now() });
          return;
        }
        keep(null);
        setResult({ status: 'error', code, message: err instanceof Error ? err.message : 'Не удалось зарегистрировать чек' });
        if (!SHOWS_RESULT.includes(modalRef.current?.name)) open('qr');
      })
      .finally(() => {
        busy.current = false;
      });
  }, [ready, user, pending, registerReceiptQr, keep, refresh, toast, open]);

  const retry = useCallback(() => {
    if (!result?.code) return;
    setResult(null);
    keep({ code: result.code, at: Date.now() });
  }, [result, keep]);

  const value = useMemo(() => ({ pending, result, retry }), [pending, result, retry]);
  return <QrReceiptContext.Provider value={value}>{children}</QrReceiptContext.Provider>;
}
