import { useModal } from '@/features/modal';
import { Button } from '@/shared/ui/button/Button';
import { IconClock } from '@/shared/ui/icons/Icons';
import { Lights } from '@/shared/ui/lights';
import { Modal } from '@/shared/ui/modal/Modal';

/** Окно 09a: чек принят и обрабатывается. Показывается после каждого чека: шаги начисляются сразу или чуть позже */
export function ProcessingModal({ open }) {
  const { open: openModal, close } = useModal();
  return (
    <Modal
      id="m-processing"
      open={open}
      onClose={close}
      ribbon="Чек принят"
      center
      title="Чек обрабатывается"
      lead={<>Шаги появятся в&nbsp;вашем маршруте, как только чек обработается: иногда сразу, иногда чуть позже.</>}
      before={<div className="seal modal__icon"><IconClock /></div>}
      decor={<img className="modal__goat modal__goat--left" src="/img/goat-lantern.webp" alt="" width={460} height={636} />}
    >
      <div className="modal__lights"><Lights count={10} lit={0} swags={1} offColor="#173f2a" wire="#173f2a" /></div>
      <div className="modal__actions" style={{ marginTop: 24 }}>
        <Button block to="/route" onClick={close}>Перейти к&nbsp;маршруту</Button>
        <Button block variant="secondary" onClick={() => openModal('receipt')}>Зарегистрировать ещё чек</Button>
      </div>
      <p className="modal__foot">Сохраните чек до&nbsp;24&nbsp;января 2027&nbsp;года. Если он зарегистрирован, на&nbsp;нём напечатан ваш номер телефона.</p>
    </Modal>
  );
}
