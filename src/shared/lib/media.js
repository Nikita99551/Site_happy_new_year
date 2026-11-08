/**
 * Фото и видео из ответов на задания партнёров (правка 08.11): проверки до отправки и подготовка превью.
 * Настоящие проверки и сжатие — на сервере; здесь только чтобы человек сразу увидел, что не так.
 */

/** Лимиты (такие же должен проверять сервер, см. README «Ответы на задания партнёров») */
export const MEDIA_LIMITS = {
  photoMb: 10,
  videoMb: 100,
  videoSec: 60,
  textMax: 1000,
};

const PHOTO_RE = /^image\/(jpeg|png|webp|heic|heif)$/i;
const PHOTO_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;
const VIDEO_RE = /^video\/(mp4|quicktime|x-m4v|3gpp|webm)$/i;
const VIDEO_EXT = /\.(mp4|mov|m4v|3gp|webm)$/i;

/** Что за файл выбрали: 'photo', 'video' или null (не подходит) */
export function mediaKind(file) {
  if (PHOTO_RE.test(file.type) || (!file.type && PHOTO_EXT.test(file.name))) return 'photo';
  if (VIDEO_RE.test(file.type) || (!file.type && VIDEO_EXT.test(file.name))) return 'video';
  return null;
}

/** Длительность видео и кадр-обложка (data:image/jpeg). Не получилось прочитать — duration NaN, poster '' */
export function readVideo(file, maxSide = 640) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    let done = false;
    const finish = (poster) => {
      if (done) return;
      done = true;
      const duration = v.duration;
      URL.revokeObjectURL(url);
      v.removeAttribute('src');
      resolve({ duration: Number.isFinite(duration) ? duration : NaN, poster });
    };
    const timer = window.setTimeout(() => finish(''), 8000);
    v.addEventListener('loadedmetadata', () => {
      // Обложка — кадр на полсекунде (первый кадр часто чёрный)
      v.currentTime = Math.min(0.5, (v.duration || 1) / 2);
    });
    v.addEventListener('seeked', () => {
      window.clearTimeout(timer);
      try {
        const k = Math.min(1, maxSide / Math.max(v.videoWidth, v.videoHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(v.videoWidth * k);
        c.height = Math.round(v.videoHeight * k);
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        finish(c.toDataURL('image/jpeg', 0.78));
      } catch {
        finish('');
      }
    });
    v.addEventListener('error', () => {
      window.clearTimeout(timer);
      finish('');
    });
    v.src = url;
  });
}

/** Уменьшенная копия фото (data:image/jpeg) для демо-режима: в localStorage помещается только небольшой файл */
export async function shrinkPhoto(file, maxSide = 1280) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return { src: c.toDataURL('image/jpeg', 0.8), w: c.width, h: c.height };
}

/** Длительность для подписи: «0:45», «1:00» */
export function formatDuration(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
