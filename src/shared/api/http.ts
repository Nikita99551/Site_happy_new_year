/**
 * Реализация API поверх fetch. Включается переменной VITE_API_MODE=http (см. .env.example).
 * Адреса эндпоинтов и формы ответов описаны в README. Сессия — cookie (credentials: 'include').
 */
import type { AnixApi, MeResponse, ReceiptResult, RegisterInput, Store } from './types';
import { mockApi } from './mock';
import { toUser } from './progress';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';
const LOCAL_STORE_KEY = 'anix_store';
const LOCAL_COOKIE_KEY = 'anix_cookies';

class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Сколько ждать ответа сервера, мс: дольше — кнопка не должна висеть в «Секунду…» */
const TIMEOUT_MS = 20000;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res: Response;
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
  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => null)) as { message?: string } | T | null;
  if (!res.ok) {
    const message = (body as { message?: string } | null)?.message ?? 'Что-то пошло не так, попробуйте ещё раз';
    throw new ApiError(message, res.status);
  }
  return body as T;
}

function readLocal<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}
function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватный режим */
  }
}

/** Справочники загружаются один раз при старте приложения (см. app/providers/SessionProvider). */
export async function loadDictionaries(): Promise<{ stores: Store[]; participants: number[] }> {
  const [stores, stats] = await Promise.all([
    request<Store[]>('/stores'),
    request<{ participants: number[] }>('/stats'),
  ]);
  httpApi.stores = stores;
  httpApi.participants = stats.participants;
  return { stores, participants: stats.participants };
}

export const httpApi: AnixApi = {
  stores: [],
  participants: [],

  async me() {
    try {
      return toUser(await request<MeResponse>('/me'));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },

  sample() {
    return mockApi.sample();
  },

  async login(phone) {
    return toUser(await request<MeResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ phone }) }));
  },

  async register(input: RegisterInput) {
    return toUser(await request<MeResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) }));
  },

  logout() {
    return request<void>('/auth/logout', { method: 'POST' });
  },

  registerReceipt(number, channel) {
    return request<ReceiptResult>('/receipts', { method: 'POST', body: JSON.stringify({ number, channel }) });
  },

  async selectStore(storeId) {
    writeLocal(LOCAL_STORE_KEY, storeId);
    try {
      await request<void>('/me', { method: 'PATCH', body: JSON.stringify({ storeId }) });
    } catch (e) {
      // Гость тоже может выбрать магазин: до входа храним выбор локально
      if (!(e instanceof ApiError && e.status === 401)) throw e;
    }
  },

  selectedStore() {
    return readLocal<string>(LOCAL_STORE_KEY) ?? null;
  },

  cookieConsent(value) {
    if (value !== undefined) writeLocal(LOCAL_COOKIE_KEY, value);
    return readLocal<boolean>(LOCAL_COOKIE_KEY);
  },
};
