import { useState } from 'react';
import { AuthChoiceModal, LoginModal, RegisteredModal, RegisterModal } from '@/features/auth';
import { useModal } from '@/features/modal';
import { AnswerFormModal, AnswersModal } from '@/features/partner-answer';
import { PartnerTaskModal } from '@/features/partner-task';
import { QrReceiptModal } from '@/features/receipt-qr';
import { ProcessingModal, ReceiptModal } from '@/features/receipt-register';
import { StoreModal } from '@/features/store-select';

/**
 * Все окна сайта в одном месте. Открыто не больше одного — какое, знает ModalProvider.
 * Окно строится при первом открытии и дальше остаётся (введённое в форму не теряется, закрытие плавное):
 * восемь закрытых окон при загрузке каждой страницы только занимали телефон (правка 01.11).
 */
export function ModalHost() {
  const { state } = useModal();
  const [opened, setOpened] = useState(() => new Set());
  if (state?.name && !opened.has(state.name)) setOpened(new Set(opened).add(state.name));
  const is = (name) => state?.name === name;
  const was = (name) => opened.has(name) || is(name);
  return (
    <>
      {was('auth') && <AuthChoiceModal open={is('auth')} />}
      {was('login') && <LoginModal open={is('login')} />}
      {was('register') && <RegisterModal open={is('register')} />}
      {was('registered') && <RegisteredModal open={is('registered')} />}
      {was('receipt') && <ReceiptModal open={is('receipt')} />}
      {was('qr') && <QrReceiptModal open={is('qr')} />}
      {was('processing') && <ProcessingModal open={is('processing')} />}
      {was('task') && <PartnerTaskModal open={is('task')} />}
      {was('answers') && <AnswersModal open={is('answers')} />}
      {was('answer') && <AnswerFormModal open={is('answer')} />}
      {was('store') && <StoreModal open={is('store')} returnTo={state?.name === 'store' ? state.payload?.returnTo : undefined} />}
    </>
  );
}
