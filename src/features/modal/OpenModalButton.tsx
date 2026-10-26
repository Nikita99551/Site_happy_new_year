import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '@/shared/ui/button/Button';
import { useSession } from '@/entities/user';
import { useModal, type ModalName } from './context';

type Props = Omit<Extract<ButtonProps, { to?: undefined; href?: undefined }>, 'onClick' | 'children'> & {
  /** Какое окно открыть. 'auth' для вошедшего пользователя открывает чек. */
  modal: 'auth' | 'login' | 'register' | 'receipt' | 'store';
  children: ReactNode;
};

/** Кнопка «Зарегистрировать чек», «Войти», «Выбрать магазин» и т. п. */
export function OpenModalButton({ modal, children, ...rest }: Props) {
  const { open } = useModal();
  const { user } = useSession();
  const target: ModalName = modal === 'auth' && user ? 'receipt' : modal;
  return <Button {...rest} onClick={() => open(target)}>{children}</Button>;
}
