import { Button } from '@/shared/ui/button/Button';
import { useSession } from '@/entities/user';
import { useModal } from './context';

/** Кнопка «Зарегистрировать чек», «Войти», «Выбрать магазин» и т. п. */
export function OpenModalButton({ modal, children, ...rest }) {
  const { open } = useModal();
  const { user } = useSession();
  const target = modal === 'auth' && user ? 'receipt' : modal;
  return <Button {...rest} onClick={() => open(target)}>{children}</Button>;
}
