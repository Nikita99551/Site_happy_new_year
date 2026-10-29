import { useQrReceipt } from '../model/context';
import './QrReceipt.scss';

const TEXT = {
  sending: { title: 'Регистрируем чек с QR-кода', text: <>Это займёт несколько секунд, вводить номер не&nbsp;нужно.</> },
  done: { title: 'Чек с QR-кода принят', text: <>Он обрабатывается: шаги появятся в&nbsp;маршруте сразу или чуть позже.</> },
  error: { title: 'Чек с QR-кода не зарегистрирован', text: null },
};

/**
 * Итог чека по QR-коду внутри окна «Вы зарегистрированы»: гость отсканировал чек, зарегистрировался,
 * а чек ушёл в фоне. Ничего не рисует, если чека по QR нет.
 */
export function QrStatusNote() {
  const { pending, result, retry } = useQrReceipt();
  if (!result && !pending) return null;
  const status = result?.status ?? 'sending';
  const t = TEXT[status];
  const failed = status === 'error';
  return (
    <div className={`ticket ${failed ? '' : 'ticket--green '}modal__ticket qr-note`} role="status">
      <span className="num">{failed ? '!' : 'QR'}</span>
      <div>
        <b>{t.title}</b>
        <p>{failed ? result.message : t.text}</p>
        {failed && <button type="button" className="link qr-note__retry" onClick={retry}>Попробовать ещё раз</button>}
      </div>
    </div>
  );
}
