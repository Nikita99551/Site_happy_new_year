import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '@/features/modal';
import { useReducedMotion } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/button/Button';
import { IconClock } from '@/shared/ui/icons/Icons';
import { Lights } from '@/shared/ui/lights';
import { Modal } from '@/shared/ui/modal/Modal';
import { useQrReceipt } from '../model/context';
import './QrReceipt.scss';

/** Окно чека по QR-коду: «Регистрируем чек» → «Чек обрабатывается» (общее окно) или ошибка с повтором */
export function QrReceiptModal({ open }) {
  const { open: openModal, close } = useModal();
  const { pending, result, retry } = useQrReceipt();
  const reduced = useReducedMotion();
  const failed = result?.status === 'error';
  const code = result?.code ?? pending?.code ?? '';

  // Чек принят — то же окно, что после ручного ввода номера. Чека уже нет (вышел из кабинета) — окну нечего показывать
  useEffect(() => {
    if (!open) return;
    if (result?.status === 'done') openModal('processing');
    else if (!result && !pending) close();
  }, [open, result, pending, openModal, close]);

  // Пока ждём ответ сервера, огоньки бегут по гирлянде
  const [lit, setLit] = useState(0);
  useEffect(() => {
    if (!open || failed || reduced) return;
    const id = window.setInterval(() => setLit((n) => (n + 1) % 11), 240);
    return () => window.clearInterval(id);
  }, [open, failed, reduced]);

  return (
    <Modal
      id="m-qr"
      open={open}
      onClose={close}
      ribbon="Чек с QR-кода"
      center
      title={failed ? 'Чек не зарегистрирован' : 'Регистрируем чек'}
      lead={failed ? result.message : <>Проверяем чек по&nbsp;QR-коду. Это займёт несколько секунд, вводить номер не&nbsp;нужно.</>}
      before={failed
        ? <div className="seal seal--red modal__icon"><span className="num">!</span></div>
        : <div className="seal modal__icon"><IconClock /></div>}
      decor={<img className="modal__goat modal__goat--left" src="/img/goat-lantern.webp" alt="" width={460} height={636} />}
    >
      {code && <p className="qr-receipt__code">Чек №&nbsp;<b>{code}</b></p>}
      {failed ? (
        <>
          <div className="modal__actions" style={{ marginTop: 24 }}>
            <Button block onClick={retry}>Попробовать ещё раз</Button>
            <Button block variant="secondary" onClick={() => openModal('receipt')}>Ввести номер вручную</Button>
          </div>
          <p className="modal__foot"><Link className="link link--green" to="/route" onClick={close}>Перейти к&nbsp;маршруту</Link></p>
        </>
      ) : (
        <div className="modal__lights" aria-hidden="true"><Lights count={10} lit={reduced ? 10 : lit} swags={1} offColor="#173f2a" wire="#173f2a" /></div>
      )}
    </Modal>
  );
}
