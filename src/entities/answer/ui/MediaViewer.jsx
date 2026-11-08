import { useEffect, useRef, useState } from 'react';
import { IconClose } from '@/shared/ui/icons/Icons';
import './MediaViewer.scss';

/**
 * Фото или видео из ответа крупно (правка 08.11). Своё окно <dialog>, поверх всего — и поверх окна «Все ответы»:
 * под ним ничего не закрывается и прокрутка списка не теряется. Закрывают крестик, Esc и клик по тёмному фону
 * (терять тут нечего). answer = null — закрыто.
 */
export function MediaViewer({ answer, onClose }) {
  const ref = useRef(null);
  // Последний открытый ответ: пока окно гаснет после закрытия, картинка не пропадает
  const [last, setLast] = useState(answer);
  if (answer && answer !== last) setLast(answer);
  const a = answer ?? last;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const html = document.documentElement;
    if (answer && !d.open) {
      d.showModal();
      // С открытой страницы (не из окна) — страница под просмотром не прокручивается
      if (!html.classList.contains('modal-open')) {
        html.style.setProperty('--sbw', `${Math.max(0, window.innerWidth - html.clientWidth)}px`);
        html.classList.add('modal-open', 'viewer-open');
      }
    } else if (!answer && d.open) {
      d.close();
    }
    if (!answer && html.classList.contains('viewer-open')) html.classList.remove('modal-open', 'viewer-open');
  }, [answer]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener('cancel', onCancel);
    return () => d.removeEventListener('cancel', onCancel);
  }, [onClose]);

  const video = a?.video;
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- Esc закрывает через cancel
    <dialog ref={ref} className="viewer" aria-label={a ? `${video ? 'Видео' : 'Фото'}: ${a.author}` : 'Просмотр'} onClick={(e) => e.target === e.currentTarget && onClose()}>
      {a && (
        <figure className="viewer__box">
          <button type="button" className="viewer__close" aria-label="Закрыть" onClick={onClose}><IconClose /></button>
          {a.photo && !video && <img className="viewer__media" src={a.photo.src} alt={a.text ? a.text.slice(0, 120) : `Фото участника ${a.author}`} />}
          {video && video.src && (
            // Видео участника: субтитров нет — это любительская запись. key — новое видео начинается с начала
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video key={video.src} className="viewer__media" src={video.src} poster={video.poster} controls autoPlay playsInline preload="metadata" />
          )}
          {video && !video.src && (
            <div className="viewer__empty">
              <img className="viewer__media" src={video.poster} alt="" />
              <p>В демо-версии выбранное видео хранится, пока не обновили страницу. На настоящем сайте оно будет здесь.</p>
            </div>
          )}
          <figcaption className="viewer__cap"><b>{a.author}</b>{a.place && <span> · {a.place}</span>}</figcaption>
        </figure>
      )}
    </dialog>
  );
}
