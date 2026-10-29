import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { QrStatusNote, useQrReceipt } from '@/features/receipt-qr';
import { launchConfetti } from '@/shared/lib/confetti';
import { useReducedMotion } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/button/Button';
import { IconCheck } from '@/shared/ui/icons/Icons';
import { Modal } from '@/shared/ui/modal/Modal';

/** Окно после регистрации: видно, что кабинет создан, и понятно, что делать дальше (правка 27.10) */
export function RegisteredModal({ open }) {
  const { open: openModal, close, afterAuth, finishAuth } = useModal();
  const { user } = useSession();
  const qr = useQrReceipt();
  // Гость пришёл по QR-коду с чека: чек уже ушёл в фоне, его итог — плашкой в этом окне
  const withQr = Boolean(qr.pending || qr.result);
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (open && !reduced) launchConfetti();
  }, [open, reduced]);

  // Пришёл из кнопки чека — откроется то же окно чека; иначе — новое
  const toReceipt = () => {
    if (afterAuth) finishAuth();
    else openModal('receipt');
  };
  const toRoute = () => {
    close();
    if (pathname !== '/route') navigate('/route');
  };

  return (
    <Modal
      id="m-registered"
      open={open}
      onClose={close}
      ribbon="Готово"
      center
      title="Вы зарегистрированы!"
      lead={<>{user ? `${user.name}, ваш кабинет создан.` : 'Кабинет создан.'} Теперь регистрируйте чеки от&nbsp;600&nbsp;₽: за&nbsp;каждые 600&nbsp;₽&nbsp;— шаг по&nbsp;новогоднему маршруту.</>}
      before={<div className="seal modal__icon"><IconCheck /></div>}
      decor={<img className="modal__goat modal__goat--right" src="/img/goat-dance.webp" alt="" width={460} height={710} />}
    >
      {withQr ? (
        <>
          <QrStatusNote />
          <div className="modal__actions">
            <Button block onClick={toRoute}>Перейти к&nbsp;маршруту</Button>
            <Button block variant="secondary" onClick={() => openModal('receipt')}>Зарегистрировать ещё чек</Button>
          </div>
        </>
      ) : (
        <div className="modal__actions" style={{ marginTop: 24 }}>
          <Button block onClick={toReceipt}>Зарегистрировать чек</Button>
          <Button block variant="secondary" onClick={toRoute}>Перейти к&nbsp;маршруту</Button>
        </div>
      )}
    </Modal>
  );
}
