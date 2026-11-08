import { useEffect, useId, useRef, useState } from 'react';
import { formatDuration, MEDIA_LIMITS, mediaKind, readVideo } from '@/shared/lib/media';
import { IconPhoto, IconVideo } from '@/shared/ui/icons/Icons';

const ACCEPT = { photo: 'image/jpeg,image/png,image/webp,image/heic,image/heif', video: 'video/mp4,video/quicktime,video/*' };
const mb = (bytes) => `${(bytes / 1048576).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} МБ`;

/**
 * Выбор фото или видео для ответа (правка 08.11). kinds — что принимает задание: ['photo'], ['video'] или оба.
 * Сразу проверяет вид файла, размер и длину видео и показывает превью; ошибку — понятной фразой под полем.
 * value: { file, kind, url, poster?, duration? } | null. Ссылки на превью (blob:) освобождаются сами.
 */
export function MediaPick({ kinds, value, onChange, required, error, onError }) {
  const id = useId();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => {
    if (value?.url) URL.revokeObjectURL(value.url);
  }, [value]);

  const both = kinds.length > 1;
  const label = both ? 'Фото или видео' : kinds[0] === 'photo' ? 'Фото' : 'Видео';
  const hint = [
    kinds.includes('photo') && `фото JPEG или PNG до ${MEDIA_LIMITS.photoMb} МБ`,
    kinds.includes('video') && `видео до 1 минуты и до ${MEDIA_LIMITS.videoMb} МБ`,
  ].filter(Boolean).join(', ');

  const pick = async (file) => {
    if (!file) return;
    const kind = mediaKind(file);
    if (!kind || !kinds.includes(kind)) {
      onError(both ? 'Этот файл не подходит. Выберите фото или видео' : kinds[0] === 'photo' ? 'Это не фото. Выберите снимок JPEG или PNG' : 'Это не видео. Выберите видео MP4 или MOV');
      return;
    }
    const limit = (kind === 'photo' ? MEDIA_LIMITS.photoMb : MEDIA_LIMITS.videoMb) * 1048576;
    if (file.size > limit) {
      onError(`Файл слишком большой (${mb(file.size)}). Можно до ${kind === 'photo' ? MEDIA_LIMITS.photoMb : MEDIA_LIMITS.videoMb} МБ`);
      return;
    }
    if (kind === 'photo') {
      onChange({ file, kind, url: URL.createObjectURL(file) });
      return;
    }
    setBusy(true);
    const v = await readVideo(file);
    setBusy(false);
    if (v.duration > MEDIA_LIMITS.videoSec + 0.5) {
      onError(`Видео длиннее минуты (${formatDuration(v.duration)}). Обрежьте его в телефоне и выберите снова`);
      return;
    }
    onChange({ file, kind, url: URL.createObjectURL(file), poster: v.poster, duration: v.duration });
  };

  const accept = kinds.map((k) => ACCEPT[k]).join(',');
  return (
    <div className={`field media-pick${error ? ' field--error' : ''}`}>
      <span className="field__label" id={`${id}-l`}>
        {label}{!required && <span className="check__opt">по&nbsp;желанию</span>}
      </span>
      <input
        ref={input} id={id} className="media-pick__input" type="file" accept={accept} aria-labelledby={`${id}-l`}
        onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }}
      />
      {value ? (
        <div className="media-pick__chosen">
          <span className="media-pick__thumb">
            {value.kind === 'photo' ? <img src={value.url} alt="" /> : value.poster ? <img src={value.poster} alt="" /> : <IconVideo />}
            {value.kind === 'video' && Number.isFinite(value.duration) && <span className="media-pick__dur">{formatDuration(value.duration)}</span>}
          </span>
          <span className="media-pick__info">
            <b>{value.kind === 'photo' ? 'Фото выбрано' : 'Видео выбрано'}</b>
            <small>{value.file.name} · {mb(value.file.size)}</small>
            <span className="media-pick__actions">
              <button type="button" className="link" onClick={() => input.current?.click()}>Заменить</button>
              <button type="button" className="link link--green" onClick={() => onChange(null)}>Убрать</button>
            </span>
          </span>
        </div>
      ) : (
        <button type="button" className="media-pick__add" onClick={() => input.current?.click()} disabled={busy}>
          <span className="media-pick__icons" aria-hidden="true">{kinds.includes('photo') && <IconPhoto />}{kinds.includes('video') && <IconVideo />}</span>
          <span>
            <b>{busy ? 'Проверяем видео…' : both ? 'Добавить фото или видео' : kinds[0] === 'photo' ? 'Добавить фото' : 'Добавить видео'}</b>
            <small>{hint}</small>
          </span>
        </button>
      )}
      <span className="field__error" aria-live="polite">{error}</span>
    </div>
  );
}
