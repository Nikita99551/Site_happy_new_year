import { AuthChoiceModal, LoginModal, RegisterModal } from '@/features/auth';
import { useModal } from '@/features/modal';
import { ProcessingModal, ReceiptModal, SuccessModal } from '@/features/receipt-register';
import { StoreModal } from '@/features/store-select';

/** Все окна сайта в одном месте. Открыто не больше одного — какое, знает ModalProvider. */
export function ModalHost() {
  const { state } = useModal();
  const is = (name: string) => state?.name === name;
  return (
    <>
      <AuthChoiceModal open={is('auth')} />
      <LoginModal open={is('login')} />
      <RegisterModal open={is('register')} />
      <ReceiptModal open={is('receipt')} />
      <ProcessingModal open={is('processing')} />
      <SuccessModal open={is('success')} steps={state?.name === 'success' ? state.payload.steps : 2} />
      <StoreModal open={is('store')} returnTo={state?.name === 'store' ? state.payload?.returnTo : undefined} />
    </>
  );
}
