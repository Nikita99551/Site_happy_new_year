import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { Button } from '@/shared/ui/button/Button';
import { Field } from '@/shared/ui/field/Field';
import { Modal } from '@/shared/ui/modal/Modal';
import { useToast } from '@/shared/ui/toast/context';
import { DeliveryHint } from './DeliveryHint';
import { ReceiptHint } from './ReceiptHint';
import './ReceiptModal.scss';

/** Русские буквы, похожие на латинские: в коде с чека меняем их на латиницу (на телефоне часто включена русская раскладка) */
const LOOKALIKE = { А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M', Н: 'H', О: 'O', Р: 'P', С: 'C', Т: 'T', У: 'Y', Х: 'X', а: 'a', е: 'e', к: 'k', м: 'm', о: 'o', р: 'p', с: 'c', т: 't', у: 'y', х: 'x' };

/**
 * Каналы покупки (правка 29.10). В магазине вводят «Код для регистрации» с чека — латиница и цифры, тот же номер, что в QR-коде
 * (features/receipt-qr: 4–64 знака, «-» и «_»); в доставке — номер заказа из приложения «Торнадо», только цифры
 */
const CHANNELS = {
  store: {
    tab: 'Покупка в магазине', short: 'В магазине', label: 'Код для регистрации с чека', hint: 'Дата и сумма покупки подтянутся автоматически.',
    placeholder: 'Буквы и цифры под QR‑кодом', inputMode: 'text', min: 4, error: 'Введите код с чека полностью — буквы и цифры под QR‑кодом',
    clean: (v) => v.replace(/[А-Яа-я]/g, (ch) => LOOKALIKE[ch] ?? '').replace(/[^0-9A-Za-z_-]/g, ''),
  },
  delivery: {
    tab: 'Заказ доставки', short: 'Доставка', label: 'Номер заказа доставки', hint: 'Заказ проверят после доставки: шаги появятся, когда покупка подтвердится.',
    placeholder: 'Например, 1234567', inputMode: 'numeric', min: 4, error: 'Введите номер заказа полностью',
    clean: (v) => v.replace(/\D/g, ''),
  },
};

/** Окно 08: регистрация чека или заказа доставки */
export function ReceiptModal({ open }) {
  const { open: openModal, close } = useModal();
  const { user, registerReceipt } = useSession();
  const toast = useToast();
  const [channel, setChannel] = useState('store');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const c = CHANNELS[channel];

  // При открытии старая ошибка не показывается
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setError('');
  }

  const submit = async (e) => {
    e.preventDefault();
    if (number.length < c.min) {
      setError(c.error);
      return;
    }
    if (!user) {
      // Окно чека для гостя откроет вход, а после входа вернёт сюда — номер чека сохранится
      openModal('receipt');
      toast('Сначала войдите или зарегистрируйтесь');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await registerReceipt(number.trim(), channel);
      setNumber('');
      // Всегда «Чек обрабатывается»: шаги могут начислиться сразу или чуть позже — человек увидит их на маршруте (правка 27.10)
      openModal('processing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось зарегистрировать чек');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      id="m-receipt"
      open={open}
      onClose={close}
      ribbon="Новый чек"
      width={720}
      title="Зарегистрировать чек"
      decor={<>
        <img className="modal__clip" src="/img/paperclip.webp" alt="" width={80} height={123} />
        <img className="modal__goat modal__goat--right" src="/img/goat-point.webp" alt="" width={460} height={798} />
      </>}
    >
      <div className="tabs" role="tablist">
        {(Object.keys(CHANNELS)).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={channel === key} onClick={() => { if (key !== channel) { setChannel(key); setNumber(''); setError(''); } }}><span className="tabs__full">{CHANNELS[key].tab}</span><span className="tabs__short">{CHANNELS[key].short}</span></button>
        ))}
      </div>
      <div className={`ticket ticket--green modal__ticket modal__ticket--${channel}`}>
        <span className="num">600&nbsp;₽</span>
        <div><b>= 1&nbsp;шаг</b><p>Чек от&nbsp;600&nbsp;₽, до&nbsp;5&nbsp;чеков в&nbsp;день<span className="modal__ticket-extra">, 5&nbsp;товаров партнёров&nbsp;— ещё шаг</span>. Чек храните до&nbsp;24&nbsp;января&nbsp;2027.</p></div>
      </div>
      {channel === 'store' ? <ReceiptHint /> : <DeliveryHint />}
      <form className="modal__form" noValidate onSubmit={submit} style={{ marginTop: 0 }}>
        <Field label={c.label} hint={c.hint} type="text" name="number" inputMode={c.inputMode} autoComplete="off" autoCapitalize={channel === 'store' ? 'characters' : 'off'} autoCorrect="off" spellCheck={false} placeholder={c.placeholder} maxLength={64} required value={number} onChange={(e) => setNumber(c.clean(e.target.value))} error={error} />
        <div className="modal__actions" style={{ marginTop: 26 }}><Button block type="submit" disabled={busy}>{busy ? 'Секунду…' : 'Зарегистрировать'}</Button></div>
        <p className="modal__foot"><Link className="link link--green" to="/route" onClick={close}>Назад к&nbsp;маршруту</Link></p>
      </form>
    </Modal>
  );
}
