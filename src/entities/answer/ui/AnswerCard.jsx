import { useLayoutEffect, useRef, useState } from 'react';
import { formatDuration } from '@/shared/lib/media';
import { formatDay } from '@/shared/lib/text';
import { IconHeart, IconPhoto, IconPlay } from '@/shared/ui/icons/Icons';
import { answerPhotos } from '../model/answers';
import './AnswerCard.scss';

/** Цвет кружка с буквой имени: свой у каждого имени, из цветов кампании */
const AVATARS = ['#173f2a', '#e31e24', '#b98a2e', '#2f6b4a', '#b3121a', '#8a6a3a'];
const avatarColor = (name) => AVATARS[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % AVATARS.length];

/** Сердечко с числом. Своё и ещё не опубликованное — без кнопки, просто число */
export function LikeButton({ answer, onLike }) {
  const [pop, setPop] = useState(false);
  if (answer.mine || answer.status !== 'published' || !onLike) {
    return (
      <span className="like like--static" aria-label={`Сердечек: ${answer.likes}`}>
        <IconHeart /><span>{answer.likes}</span>
      </span>
    );
  }
  return (
    <button
      type="button"
      className={`like${answer.liked ? ' is-on' : ''}${pop ? ' is-pop' : ''}`}
      aria-pressed={answer.liked}
      aria-label={`Нравится. Сердечек: ${answer.likes}`}
      onClick={() => {
        if (!answer.liked) setPop(true);
        onLike(answer);
      }}
      onAnimationEnd={() => setPop(false)}
    >
      <IconHeart /><span>{answer.likes}</span>
    </button>
  );
}

/**
 * Карточка ответа участника на задание партнёра (правка 08.11): фото или видео (нажал — открывается крупно), текст,
 * подпись «Анна К. · Бийск · 2 декабря» и сердечко. Длинный текст обрезается до lines строк — ниже «Читать полностью».
 * layout: 'column' — карточка на странице (фото сверху), 'row' — в окне «Все ответы» (фото слева, на телефоне сверху).
 */
export function AnswerCard({ answer, layout = 'column', lines = 5, expanded = false, onExpand, onLike, onMedia }) {
  const textRef = useRef(null);
  const [clamped, setClamped] = useState(false);

  // Текст длиннее lines строк? Тогда показываем «Читать полностью». Пересчёт при смене ширины (поворот телефона)
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight - el.clientHeight > 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [answer.text, lines]);

  // До 3 фото в ответе (правка 13.11): в карточке первое, сколько всего — значком; остальные листаются в просмотре
  const photos = answerPhotos(answer);
  const media = answer.video ?? photos[0];
  const meta = [answer.place, formatDay(answer.at)].filter(Boolean).join(' · ');
  const statusText = answer.status === 'review' ? 'На проверке — пока его видите только вы' : answer.status === 'rejected' ? 'Не прошёл проверку' : '';

  return (
    <article className={`answer answer--${layout}${answer.mine ? ' answer--mine' : ''}${media ? '' : ' answer--text'}`} id={`answer-${answer.id}`}>
      {media && (
        <button
          type="button"
          className={`answer__media${answer.video ? ' answer__media--video' : ''}`}
          onClick={() => onMedia?.(answer)}
          aria-label={answer.video ? `Смотреть видео: ${answer.author}` : photos.length > 1 ? `Открыть ${photos.length} фото крупно: ${answer.author}` : `Открыть фото крупно: ${answer.author}`}
        >
          <img src={answer.video ? answer.video.poster : photos[0].src} alt="" loading="lazy" decoding="async" />
          {!answer.video && photos.length > 1 && <span className="answer__count" aria-hidden="true"><IconPhoto />{photos.length}</span>}
          {answer.video && <span className="answer__play"><IconPlay /></span>}
          {answer.video && answer.video.duration > 0 && <span className="answer__dur">{formatDuration(answer.video.duration)}</span>}
        </button>
      )}
      <div className="answer__body">
        {answer.mine && <span className={`answer__badge answer__badge--${answer.status}`}>{statusText || 'Ваш ответ'}</span>}
        {answer.text && (
          <p ref={textRef} className={`answer__text${expanded ? ' is-open' : ''}`} style={{ '--lines': lines }}>{answer.text}</p>
        )}
        {answer.text && (clamped || expanded) && onExpand && (
          <button type="button" className="answer__more" onClick={() => onExpand(answer)} aria-expanded={layout === 'row' ? expanded : undefined}>
            {expanded ? 'Свернуть' : 'Читать полностью'}
          </button>
        )}
        <footer className="answer__foot">
          <span className="answer__avatar" style={{ '--c': avatarColor(answer.author) }} aria-hidden="true">{answer.author[0]}</span>
          <span className="answer__who">
            <b>{answer.mine ? `${answer.author} (вы)` : answer.author}</b>
            {meta && <small>{meta}</small>}
          </span>
          <LikeButton answer={answer} onLike={onLike} />
        </footer>
      </div>
    </article>
  );
}
