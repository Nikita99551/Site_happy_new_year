import { useModal } from '@/features/modal';
import { useQrReceipt } from '@/features/receipt-qr';
import { Button } from '@/shared/ui/button/Button';
import { Modal } from '@/shared/ui/modal/Modal';

/** Окно 04: войти или зарегистрироваться */
export function AuthChoiceModal({ open }) {
  const { open: openModal, close, afterAuth } = useModal();
  // Отсканированный чек ждёт входа (в том числе если окно открыли кнопкой «Войти» в шапке)
  const { pending } = useQrReceipt();
  const qrWaits = afterAuth === 'qr' || (pending && afterAuth !== 'receipt');
  return (
    <Modal
      id="m-auth"
      open={open}
      onClose={close}
      ribbon="Новогодняя игра Аникс"
      title={<>Добро пожаловать в&nbsp;новогоднюю игру Аникс</>}
      lead={qrWaits
        ? <>Вы отсканировали QR-код с&nbsp;чека. Войдите или создайте личный кабинет&nbsp;— чек зарегистрируется сам, вводить номер не&nbsp;нужно.</>
        : afterAuth === 'receipt'
          ? <>Чтобы зарегистрировать чек, войдите или создайте личный кабинет. Сразу после этого откроется окно чека.</>
          : <>Создайте личный кабинет или&nbsp;войдите, чтобы продолжить свой маршрут.</>}
      decor={<>
        <img className="modal__stamp" src="/img/stamp.webp" alt="" width={115} height={146} />
        <img className="modal__goat modal__goat--right" src="/img/goat-point.webp" alt="" width={460} height={798} />
      </>}
    >
      <div className="modal__form modal__actions">
        <Button block onClick={() => openModal('register')}>Зарегистрироваться</Button>
        <Button block variant="secondary" onClick={() => openModal('login')}>Войти</Button>
      </div>
      <p className="modal__foot">Регистрация займёт минуту: нужны только имя, телефон и&nbsp;ваш магазин.</p>
    </Modal>
  );
}
