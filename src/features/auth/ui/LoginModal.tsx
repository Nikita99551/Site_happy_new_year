import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { formatPhone, isValidPhone, normalizePhone } from '@/shared/lib/phone';
import { Button } from '@/shared/ui/button/Button';
import { Field } from '@/shared/ui/field/Field';
import { Modal } from '@/shared/ui/modal/Modal';
import { useToast } from '@/shared/ui/toast/context';

/** Окно 05: вход по номеру телефона без SMS */
export function LoginModal({ open }: { open: boolean }) {
  const { open: openModal, back, finishAuth } = useModal();
  const { login } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // При каждом открытии окно чистое: старая ошибка и чужой номер не остаются (сброс при смене open прямо в рендере)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setError('');
      setPhone('');
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError('Введите 10 цифр номера, начиная с 9');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await login(normalizePhone(phone));
      toast('Вы вошли. Добро пожаловать!');
      // Пришёл из кнопки чека — сразу окно чека на этой же странице; иначе — на свой маршрут
      if (!finishAuth() && location.pathname !== '/route') navigate('/route');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      id="m-login"
      open={open}
      onClose={back}
      ribbon="Вход"
      title={<>Вход в&nbsp;личный кабинет</>}
      lead={<>Введите номер: 10&nbsp;цифр, без&nbsp;8 и&nbsp;+7. Используйте телефон, указанный при&nbsp;регистрации.</>}
      decor={<img className="modal__goat modal__goat--peek" src="/img/goat-peek.webp" alt="" width={230} height={266} />}
    >
      <form className="modal__form" noValidate onSubmit={submit}>
        <Field label="Номер телефона" prefix="+7" type="tel" name="phone" inputMode="numeric" autoComplete="tel-national" placeholder="9XX XXX XX XX" required value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} error={error} />
        <div className="modal__actions"><Button block type="submit" disabled={busy}>{busy ? 'Секунду…' : 'Войти'}</Button></div>
        <p className="modal__foot"><a className="link link--green" href="#" onClick={(e) => { e.preventDefault(); openModal('auth'); }}>Назад к&nbsp;выбору</a></p>
      </form>
    </Modal>
  );
}
