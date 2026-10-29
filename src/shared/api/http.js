/**
 * Реализация API поверх fetch. Включается переменной VITE_API_MODE=http (см. .env.example).
 * Адреса эндпоинтов и формы ответов описаны в README. Сессия — cookie (credentials: 'include').
 */
import { mockApi } from './mock';
import { toUser } from './progress';

const BASE = import.meta.env.VITE_API_URL ?? '/api';
const LOCAL_SHOP_KEY = 'shop';
const LOCAL_COOKIE_KEY = 'cookies';

class ApiError extends Error {
  status;
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** Сколько ждать ответа сервера, мс: дольше — кнопка не должна висеть в «Секунду…» */
const TIMEOUT_MS = 20000;

async function request(path, init = {}) {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(BASE + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
      ...init,
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
  try {
    const [stores, statsRes] = await Promise.all([
      httpApi.getShops(),
      request('/stats').catch((err) => {
        console.warn('Эндпоинт /stats недоступен:', err);
        return { participants: [] };
      }),
    ]);

    const participants = statsRes?.data?.participants || statsRes?.participants || [];

    httpApi.stores = stores;
    httpApi.participants = participants;

    return { stores, participants };
  } catch (error) {
    console.error('Критическая ошибка при загрузке справочников:', error);
    httpApi.stores = [];
    httpApi.participants = [];
    return { stores: [], participants: [] };
  }
}


export const httpApi = {

  stores: [],
  participants: [],

  async me() {
    try {
      const res = await request('/users/me');
      if (!res || res.data === null || res.data === undefined) return null;

      const data = res.data;

      const mappedUser = {
        ...data,
        name: data.user?.fio || 'Гость',
        phone: String(data.user?.phone_number || ''),
        shops_id: data.shop?.id ? String(data.shop.id) : null,
        partnerStops: [4, 8, 12, 16, 24, 28],
        receipts: (data.receipts || []).map(r => ({
          id: String(r.id || Math.random()),
          last4: r.last4 || '0000',
          at: r.created_at || new Date().toISOString(),
          steps: r.steps || 0,
          status: r.status === 'done' ? 'done' : 'processing'
        })),
      };

      const finalUser = toUser(mappedUser);

      finalUser.token = data.token;
      finalUser.steps_count = data.steps_count || 0;
      finalUser.checks_count = data.checks_count || 0;

      return finalUser;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },

  sample() {
    console.log("mok")
    return mockApi.sample();
  },

  async login(phone_number) {
    await request('/auth/login', { method: 'POST', body: JSON.stringify({ phone_number }) });
    return this.me();
  },

  async register(input) {
    await request('/auth/signup', { method: 'POST', body: JSON.stringify(input) });
    return this.me();
  },

  async logout() {
    await request('/auth/logout', { method: 'POST' });
  },

  async getShops() {
    try {
      const res = await request('/shops', { method: 'GET' });
      const shopsList = res.data || res;

      this.stores = shopsList.map(s => ({
        id: String(s.id),
        name: s.name,
        address: s.address,
        district: s.district || '',
        max: s.link_max || s.max || ''
      }));
      return this.stores;
    } catch (error) {
      console.error('Не удалось загрузить магазины', error);
      return [];
    }
  },

  registerReceipt(number, channel) {
    return request('/receipts', { method: 'POST', body: JSON.stringify({ number, channel }) });
  },

  // ЗАГЛУШКА (согласовать с бэкендом): тот же адрес, что в QR-коде на чеке, но POST — GET этого адреса открывает сайт (README, «Чек по QR-коду»)
  registerReceiptQr(qr) {
    return request(`/add_code_from_qr?qr=${encodeURIComponent(qr)}`, { method: 'POST' });
  },

  async selectStore(store) {
    writeLocal(LOCAL_SHOP_KEY, store);
    try {
      await request('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({ shops_id: store.id })
      });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) throw e;
    }
  },

  selectedStore() {
    return readLocal(LOCAL_SHOP_KEY) ?? null;
  },

  cookieConsent(value) {
    if (value !== undefined) writeLocal(LOCAL_COOKIE_KEY, value);
    return readLocal(LOCAL_COOKIE_KEY);
  },
};
