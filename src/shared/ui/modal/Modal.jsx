import { useEffect, useRef } from 'react';
import { IconClose } from '@/shared/ui/icons/Icons';
import './Modal.scss';

/**
 * Окно на <dialog>: закрывают крестик и Esc (клик по фону — нет); страница под окном не прокручивается
 * (класс html.modal-open ставит ModalProvider). Первое поле получает фокус на десктопе.
 */
export function Modal({ open, onClose, ribbon, title, lead, width = 640, center = false, decor, before, children, id }) {
  const ref = useRef(null);
  const titleId = `${id}-title`;
  // Актуальное open для обработчика close: отличать закрытие браузером от нашего d.close()
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open; // до d.close(), чтобы обработчик close не принял наше закрытие за закрытие браузером
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      const first = d.querySelector('input:not([type=checkbox]), button.btn');
      if (first && window.innerWidth > 900) window.setTimeout(() => first.focus(), 60);
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  // Окно выше экрана (например, регистрация с ошибками на ноутбуке 1366×768): прокручивается само окно, коза прячется
  useEffect(() => {
    const d = ref.current;
    if (!d || !open) return;
    const box = d.querySelector('.modal__box');
    if (!box) return;
    const check = () => d.classList.toggle('modal--tall', box.offsetHeight + 48 > window.innerHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(box);
    window.addEventListener('resize', check);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    // Браузер может закрыть диалог сам, без cancel (Esc без свежего клика): синхронизируем состояние
    const onNativeClose = () => {
      if (openRef.current) onClose();
    };
    // Клик по фону окно не закрывает (правка 24.10): только крестик или Esc, чтобы случайно не потерять введённое
    d.addEventListener('cancel', onCancel);
    d.addEventListener('close', onNativeClose);
    return () => {
      d.removeEventListener('cancel', onCancel);
      d.removeEventListener('close', onNativeClose);
    };
  }, [onClose]);

  return (
    <dialog ref={ref} className={`modal${center ? ' modal--center' : ''}`} id={id} style={{ '--w': `${width}px` }} aria-labelledby={titleId}>
      <div className="modal__box">
        <span className="ribbon modal__ribbon">{ribbon}</span>
        <button className="modal__close" type="button" aria-label="Закрыть окно" onClick={onClose}><IconClose /></button>
        {before}
        <h2 id={titleId}>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
      {decor}
    </dialog>
  );
}
