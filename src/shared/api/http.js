/**
 * Реализация API поверх fetch. Включается переменной VITE_API_MODE=http (см. .env.example).
 * Адреса эндпоинтов и формы ответов описаны в README. Сессия — cookie (credentials: 'include').
 */
import { mockApi } from './mock';
import { toUser } from './progress';

const BASE = import.meta.env.VITE_API_URL ?? '/api';
const LOCAL_STORE_KEY = 'anix_store';
const LOCAL_COOKIE_KEY = 'anix_cookies';

class ApiError extends Error {
  status;
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** Сколько ждать ответа сервера, мс: дольше — кнопка не должна висеть в «Секунду…» */
const TIMEOUT_MS = 20000;

async function request(path, { timeout = TIMEOUT_MS, ...init } = {}) {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeout);
  // Файлы (ответы на задания) уходят как multipart/form-data: заголовок с границей частей браузер ставит сам
  const json = !(init.body instanceof FormData);
  let res;
  try {
    res = await fetch(BASE + path, {
      credentials: 'include',
      ...init,
      headers: { ...(json && { 'Content-Type': 'application/json' }), Accept: 'application/json', ...init.headers },
      signal: ctrl.signal,
    });
  } catch {
    // Нет интернета, сервер недоступен или не ответил вовремя: браузер даёт «Failed to fetch» — показываем понятный текст
    throw new ApiError(ctrl.signal.aborted ? 'Сервер долго не отвечает. Попробуйте ещё раз через минуту' : 'Нет связи с сервером. Проверьте интернет и попробуйте ещё раз', 0);
  } finally {
    window.clearTimeout(timer);
  }
  if (res.status === 204) return undefined;
  const body = (await res.json().catch(() => null));
  if (!res.ok) {
    const message = body?.message ?? 'Что-то пошло не так, попробуйте ещё раз';
    throw new ApiError(message, res.status);
  }
  return body;
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : (JSON.parse(raw));
  } catch {
    return undefined;
  }
}
function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватный режим */
  }
}

/** Справочники загружаются один раз при старте приложения (см. app/providers/SessionProvider). */
export async function loadDictionaries() {
  const [stores, stats] = await Promise.all([
    request('/stores'),
    request('/stats'),
  ]);
  httpApi.stores = stores;
  httpApi.participants = stats.participants;
  return { stores, participants: stats.participants };
}

export const httpApi = {
  stores: [],
  participants: [],

  async me() {
    try {
      return toUser(await request('/me'));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },

  sample() {
    return mockApi.sample();
  },

  async login(phone) {
    return toUser(await request('/auth/login', { method: 'POST', body: JSON.stringify({ phone }) }));
  },

  async register(input) {
    return toUser(await request('/auth/register', { method: 'POST', body: JSON.stringify(input) }));
  },

  logout() {
    return request('/auth/logout', { method: 'POST' });
  },

  registerReceipt(number, channel) {
    return request('/receipts', { method: 'POST', body: JSON.stringify({ number, channel }) });
  },

  // ЗАГЛУШКА (согласовать с бэкендом): тот же адрес, что в QR-коде на чеке, но POST — GET этого адреса открывает сайт (README, «Чек по QR-коду»)
  registerReceiptQr(qr) {
    return request(`/add_code_from_qr?qr=${encodeURIComponent(qr)}`, { method: 'POST' });
  },

  async selectStore(storeId) {
    writeLocal(LOCAL_STORE_KEY, storeId);
    try {
      await request('/me', { method: 'PATCH', body: JSON.stringify({ storeId }) });
    } catch (e) {
      // Гость тоже может выбрать магазин: до входа храним выбор локально
      if (!(e instanceof ApiError && e.status === 401)) throw e;
    }
  },

  selectedStore() {
    return readLocal(LOCAL_STORE_KEY) ?? null;
  },

  cookieConsent(value) {
    if (value !== undefined) writeLocal(LOCAL_COOKIE_KEY, value);
    return readLocal(LOCAL_COOKIE_KEY);
  },

  // Ответы на задания партнёров (правка 08.11, README «Ответы на задания партнёров»)
  answers(slug, { sort = 'popular', type = 'all', cursor = null, limit = 20 } = {}) {
    const q = new URLSearchParams({ sort, type, limit: String(limit) });
    if (cursor) q.set('cursor', cursor);
    return request(`/partners/${encodeURIComponent(slug)}/answers?${q}`);
  },

  sendAnswer(slug, input) {
    const form = new FormData();
    form.set('text', input.text ?? '');
    if (input.photo) form.set('photo', input.photo);
    if (input.video) form.set('video', input.video);
    form.set('consent', '1');
    // Видео до 100 МБ с телефона грузится долго: ждём до 5 минут
    return request(`/partners/${encodeURIComponent(slug)}/answers`, { method: 'POST', body: form, timeout: 5 * 60000 });
  },

  likeAnswer(id, like) {
    return request(`/answers/${encodeURIComponent(id)}/like`, { method: like ? 'PUT' : 'DELETE' });
  },
};
