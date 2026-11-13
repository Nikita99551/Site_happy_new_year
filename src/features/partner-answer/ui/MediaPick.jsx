import { useEffect, useId, useRef, useState } from 'react';
import { formatDuration, MEDIA_LIMITS, mediaKind, readVideo } from '@/shared/lib/media';
import { IconPhoto, IconVideo } from '@/shared/ui/icons/Icons';

const ACCEPT = { photo: 'image/jpeg,image/png,image/webp,image/heic,image/heif', video: 'video/mp4,video/quicktime,video/*' };
const mb = (bytes) => (bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} КБ` : `${(bytes / 1048576).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} МБ`);

/**
 * Выбор фото или видео для ответа (правка 08.11; 13.11 — до MEDIA_LIMITS.photosMax фото в одном ответе).
 * kinds — что принимает задание: ['photo'], ['video'] или оба. Видео — одно и без фото; фото — от одного до max.
 * Сразу проверяет вид файла, размер и длину видео и показывает превью; ошибку — понятной фразой под полем.
 * value: [{ file, kind, url, poster?, duration? }] — выбранные файлы по порядку. Ссылки на превью (blob:) освобождаются сами.
 * label — подпись поля (у задания бывает своя: «Фото продуктов и готового блюда»), min — сколько фото нужно самое малое.
 */
export function MediaPick({ kinds, value, onChange, required, error, onError, label, min = 1, max = MEDIA_LIMITS.photosMax }) {
  const id = useId();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  // Превью убранных файлов освобождаем сразу, остальные — когда окно закроется насовсем
  const urls = useRef(new Set());
  useEffect(() => {
    const now = new Set(value.map((m) => m.url));
    for (const u of urls.current) if (!now.has(u)) URL.revokeObjectURL(u);
    urls.current = now;
  }, [value]);
  useEffect(() => () => {
    for (const u of urls.current) URL.revokeObjectURL(u);
  }, []);

  const both = kinds.length > 1;
  const photos = value.filter((m) => m.kind === 'photo');
  const hasVideo = value.some((m) => m.kind === 'video');
  const many = kinds.includes('photo') && max > 1;
  const left = max - photos.length;
  // Уже выбрано фото — добавить можно только фото; выбрано видео — больше ничего
  const canAdd = !hasVideo && (photos.length === 0 || left > 0);
  const pickKinds = photos.length ? ['photo'] : kinds;
  const title = label ?? (both ? 'Фото или видео' : kinds[0] === 'photo' ? 'Фото' : 'Видео');
  const howMany = min > 1 ? `нужно ${min}–${max} фото` : many ? `до ${max} фото` : '';
  const hint = [
    kinds.includes('photo') && `фото JPEG или PNG до ${MEDIA_LIMITS.photoMb} МБ${howMany ? `, ${howMany}` : ''}`,
    kinds.includes('video') && `видео до 1 минуты и до ${MEDIA_LIMITS.videoMb} МБ`,
  ].filter(Boolean).join(', ');

  const checkOne = async (file, allowed) => {
    const kind = mediaKind(file);
    if (!kind || !allowed.includes(kind)) {
      return { error: allowed.length > 1 ? 'Этот файл не подходит. Выберите фото или видео' : allowed[0] === 'photo' ? 'Это не фото. Выберите снимок JPEG или PNG' : 'Это не видео. Выберите видео MP4 или MOV' };
    }
    const limitMb = kind === 'photo' ? MEDIA_LIMITS.photoMb : MEDIA_LIMITS.videoMb;
    if (file.size > limitMb * 1048576) return { error: `Файл слишком большой (${mb(file.size)}). Можно до ${limitMb} МБ` };
    if (kind === 'photo') return { item: { file, kind, url: URL.createObjectURL(file) } };
    const v = await readVideo(file);
    if (v.duration > MEDIA_LIMITS.videoSec + 0.5) return { error: `Видео длиннее минуты (${formatDuration(v.duration)}). Обрежьте его в телефоне и выберите снова` };
    return { item: { file, kind, url: URL.createObjectURL(file), poster: v.poster, duration: v.duration } };
  };

  const pick = async (files) => {
    if (!files.length) return;
    setBusy(true);
    const next = [...value];
    let problem = '';
    for (const file of files) {
      const nowPhotos = next.filter((m) => m.kind === 'photo').length;
      const allowed = nowPhotos ? ['photo'] : kinds;
      const res = await checkOne(file, allowed);
      if (res.error) {
        problem ||= res.error;
        continue;
      }
      if (res.item.kind === 'video') {
        // Видео — только одно и без фото: оно заменяет всё выбранное
        next.splice(0, next.length, res.item);
        break;
      }
      if (nowPhotos >= max) {
        URL.revokeObjectURL(res.item.url);
        problem ||= `Можно приложить не больше ${max} фото`;
        break;
      }
      next.push(res.item);
    }
    setBusy(false);
    if (next.length !== value.length || next.some((m, i) => m !== value[i])) onChange(next);
    if (problem) onError(problem);
  };

  const accept = pickKinds.map((k) => ACCEPT[k]).join(',');
  return (
    <div className={`field media-pick${error ? ' field--error' : ''}`}>
      <span className="field__label" id={`${id}-l`}>
        {title}{!required && <span className="check__opt">по&nbsp;желанию</span>}
      </span>
      <input
        ref={input} id={id} className="media-pick__input" type="file" accept={accept} multiple={many && left > 1 && !hasVideo}
        aria-labelledby={`${id}-l`}
        onChange={(e) => { pick([...(e.target.files ?? [])]); e.target.value = ''; }}
      />
      {value.length > 0 && (
        <ul className={`media-pick__list${value.length > 1 ? ' media-pick__list--grid' : ''}`}>
          {value.map((m, i) => (
            <li className="media-pick__chosen" key={m.url}>
              <span className="media-pick__thumb">
                {m.kind === 'photo' ? <img src={m.url} alt="" /> : m.poster ? <img src={m.poster} alt="" /> : <IconVideo />}
                {m.kind === 'video' && Number.isFinite(m.duration) && <span className="media-pick__dur">{formatDuration(m.duration)}</span>}
              </span>
              <span className="media-pick__info">
                <b>{m.kind === 'video' ? 'Видео выбрано' : value.length > 1 ? `Фото ${i + 1}` : 'Фото выбрано'}</b>
                <small>{m.file.name} · {mb(m.file.size)}</small>
                <span className="media-pick__actions">
                  <button type="button" className="link link--green" onClick={() => onChange(value.filter((x) => x !== m))}>Убрать</button>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {canAdd && (
        <button type="button" className={`media-pick__add${value.length ? ' media-pick__add--more' : ''}`} onClick={() => input.current?.click()} disabled={busy}>
          <span className="media-pick__icons" aria-hidden="true">{pickKinds.includes('photo') && <IconPhoto />}{pickKinds.includes('video') && <IconVideo />}</span>
          <span>
            <b>{busy ? 'Проверяем файл…' : value.length ? 'Добавить ещё фото' : both ? 'Добавить фото или видео' : kinds[0] === 'photo' ? 'Добавить фото' : 'Добавить видео'}</b>
            <small>{value.length ? `Можно ещё ${left} фото` : hint}</small>
          </span>
        </button>
      )}
      <span className="field__error" aria-live="polite">{error}</span>
    </div>
  );
}
