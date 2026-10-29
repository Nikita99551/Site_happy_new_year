import { AuthChoiceModal, LoginModal, RegisteredModal, RegisterModal } from '@/features/auth';
import { useModal } from '@/features/modal';
import { QrReceiptModal } from '@/features/receipt-qr';
import { ProcessingModal, ReceiptModal } from '@/features/receipt-register';
import { StoreModal } from '@/features/store-select';

/** Все окна сайта в одном месте. Открыто не больше одного — какое, знает ModalProvider. */
export function ModalHost() {
  const { state } = useModal();
  const is = (name) => state?.name === name;
  return (
    <>
      <AuthChoiceModal open={is('auth')} />
      <LoginModal open={is('login')} />
      <RegisterModal open={is('register')} />
      <RegisteredModal open={is('registered')} />
      <ReceiptModal open={is('receipt')} />
      <QrReceiptModal open={is('qr')} />
      <ProcessingModal open={is('processing')} />
      <StoreModal open={is('store')} returnTo={state?.name === 'store' ? state.payload?.returnTo : undefined} />
    </>
  );
}
