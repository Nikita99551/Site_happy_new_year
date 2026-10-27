import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { Button } from '@/shared/ui/button/Button';
import { Field } from '@/shared/ui/field/Field';
import { Modal } from '@/shared/ui/modal/Modal';
import { useToast } from '@/shared/ui/toast/context';
import { ReceiptHint } from './ReceiptHint';

const CHANNELS = {
  store: { tab: 'Покупка в магазине', short: 'В магазине', label: 'Номер чека', hint: 'Дата и сумма покупки подтянутся автоматически.', placeholder: 'Цифры с бумажного или e‑чека' },
  delivery: { tab: 'Заказ доставки', short: 'Доставка', label: 'Номер заказа доставки', hint: 'Заказ проверят после доставки: шаги появятся, когда покупка подтвердится.', placeholder: 'Номер из приложения или SMS' },
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
    if (number.replace(/\D/g, '').length < 4) {
      setError('Введите номер чека полностью');
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
          <button key={key} type="button" role="tab" aria-selected={channel === key} onClick={() => setChannel(key)}><span className="tabs__full">{CHANNELS[key].tab}</span><span className="tabs__short">{CHANNELS[key].short}</span></button>
        ))}
      </div>
      <div className="ticket ticket--green modal__ticket">
        <span className="num">600&nbsp;₽</span>
        <div><b>= 1&nbsp;шаг</b><p>Чек от&nbsp;600&nbsp;₽, до&nbsp;5&nbsp;чеков в&nbsp;день, 5&nbsp;товаров партнёров&nbsp;— ещё шаг. Чек храните до&nbsp;24&nbsp;января&nbsp;2027.</p></div>
      </div>
      {channel === 'store' && <ReceiptHint />}
      <form className="modal__form" noValidate onSubmit={submit} style={{ marginTop: 0 }}>
        <Field label={c.label} hint={c.hint} type="text" name="number" inputMode="numeric" autoComplete="off" placeholder={c.placeholder} maxLength={30} required value={number} onChange={(e) => setNumber(e.target.value.replace(/[^\d\-/ ]/g, ''))} error={error} />
        <div className="modal__actions" style={{ marginTop: 26 }}><Button block type="submit" disabled={busy}>{busy ? 'Секунду…' : 'Зарегистрировать'}</Button></div>
        <p className="modal__foot"><Link className="link link--green" to="/route" onClick={close}>Назад к&nbsp;маршруту</Link></p>
      </form>
    </Modal>
  );
}
