import { useState } from 'react';
import { useModal } from '@/features/modal';
import { SoonLink } from '@/shared/ui/soon-link/SoonLink';
import { errorText } from '@/shared/lib/errors';
import { Button } from '@/shared/ui/button/Button';
import { Field } from '@/shared/ui/field/Field';
import { Modal } from '@/shared/ui/modal/Modal';
import { fioError } from '../lib/fioError';

/**
 * Окно «Укажите ФИО» (09.11, просьба программиста). ПОКА НИКУДА НЕ ПОДКЛЮЧЕНО — подключает программист.
 * Зачем: кто зарегистрировал чек на кассе, у того на сервере только телефон. Войдёт на сайт по номеру — ФИО нет,
 * а оно нужно, чтобы вручить приз и подписать ответы на задания партнёров («Анна К.», кружок — первая буква имени).
 * Согласие на обработку ПДн — приписка под кнопкой (решение Никиты 09.11): галочек на сайте эти участники не ставили.
 *
 * Как подключить (пример):
 *   widgets/modal-host/ModalHost.jsx:  {was('fio') && <UpdateFIOModal open={is('fio')} onSave={(fio) => api.updateMe({ fio })} />}
 *   после входа, если у участника пустое ФИО:  open('fio')
 *
 * Свойства:
 *   open    — окно открыто;
 *   onSave  — async (fio) => …, получает ФИО одной строкой без лишних пробелов («Иванова Анна Сергеевна»).
 *             Бросил ошибку — её текст покажется под полем (технические английские сообщения заменяются, см. errorText);
 *             успех — окно закрывается;
 *   onClose — что делать при закрытии (крестик, Esc, после сохранения). По умолчанию — закрыть окно (useModal().close).
 */
export function UpdateFIOModal({ open, onSave, onClose }) {
  const { close } = useModal();
  const done = onClose ?? close;
  const [fio, setFio] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // При каждом открытии старая ошибка не остаётся (сброс при смене open прямо в рендере)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setError('');
  }

  const submit = async (e) => {
    e.preventDefault();
    const value = fio.trim().replace(/\s+/g, ' ');
    const err = fioError(value);
    setError(err);
    if (err) return;
    setBusy(true);
    try {
      await onSave?.(value);
      setFio('');
      done();
    } catch (er) {
      setError(errorText(er, 'Не удалось сохранить. Попробуйте ещё раз'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      id="m-fio"
      open={open}
      onClose={done}
      ribbon="Ваши данные"
      title={<>Укажите фамилию, имя и&nbsp;отчество</>}
      lead={<>Чек вы&nbsp;зарегистрировали на&nbsp;кассе, поэтому у&nbsp;нас есть только ваш номер телефона. ФИО нужно, чтобы вручить приз, если выиграете, и&nbsp;подписать ваши ответы на&nbsp;задания.</>}
      decor={<img className="modal__goat modal__goat--peek" src="/img/goat-peek.webp" alt="" width={230} height={266} loading="lazy" decoding="async" />}
    >
      <form className="modal__form" noValidate onSubmit={submit}>
        <Field label="Фамилия, имя, отчество" type="text" name="fio" autoComplete="name" placeholder="Иванова Анна Сергеевна" maxLength={120} required
          value={fio} onChange={(e) => { setFio(e.target.value); if (error) setError(''); }} error={error} />
        <div className="modal__actions"><Button block type="submit" disabled={busy}>{busy ? 'Секунду…' : 'Сохранить'}</Button></div>
        <p className="modal__foot">Нажимая «Сохранить», вы&nbsp;даёте <SoonLink className="link">согласие на&nbsp;обработку персональных данных</SoonLink></p>
      </form>
    </Modal>
  );
}
