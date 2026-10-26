/**
 * ДЕМО-реализация API: отвечает сама, состояние хранит в localStorage (ключ anix_demo).
 * Персональные данные никуда не отправляются. Сброс: открыть сайт с ?demo-reset в адресе.
 */
import { CAMPAIGN } from '@/shared/config/campaign';
import { toUser } from './progress';
import type { AnixApi, MeResponse, Receipt, ReceiptResult, RegisterInput, Store, User } from './types';

const STORAGE_KEY = 'anix_demo';

/** Глубокая копия без structuredClone (его нет в Safari до 15.4) */
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** Состояние в памяти вкладки: если localStorage недоступен (приватный режим), демо всё равно работает до перезагрузки */
let memory: DemoState | null = null;

/** Чек в демо-хранилище: чек «в обработке» через пару минут сам становится зачисленным (как на сервере) */
interface DemoReceipt extends Receipt {
  /** Сколько шагов даст чек после обработки */
  pendingSteps?: number;
  /** Когда обработка закончится, ISO */
  readyAt?: string;
}

/** Профиль одного участника в демо (у каждого номера свой) */
interface DemoProfile {
  user?: Partial<Pick<User, 'name' | 'phone' | 'storeId'>>;
  /** Чеки, зарегистрированные в демо (у примера-участника — сверх его готовой истории) */
  extraReceipts?: DemoReceipt[];
  /** Устарело: шаги считаются только из чеков. Поле осталось в старых сохранениях и игнорируется */
  extraSteps?: number;
  /** Новый участник (после регистрации): начинает с нуля — первый круг, 0 шагов, без чеков */
  fresh?: boolean;
}

interface DemoState {
  /** Телефон вошедшего участника; нет — гость */
  phone?: string;
  /** Профили по номеру телефона: выйти и войти другим номером — другой профиль (правка 24.10) */
  profiles?: Record<string, DemoProfile>;
  selectedStore?: string;
  cookies?: boolean;
  // Поля старой демо-версии (один профиль на браузер) — переносятся в profiles при чтении
  loggedIn?: boolean;
  user?: DemoProfile['user'];
  extraReceipts?: DemoProfile['extraReceipts'];
  extraSteps?: number;
  fresh?: boolean;
}

/** Пример магазинов. ЗАПОЛНИТЬ: полный список и ссылки на группы MAX. */
const STORES: Store[] = [
  { id: 'slav', name: 'Аникс «Славянский»', address: 'Бийск, ул. Васильева, 30', max: '' },
  { id: 's02', name: 'Аникс «Магазин 02»', address: 'Город · улица · номер дома', max: '' },
  { id: 's03', name: 'Аникс «Магазин 03»', address: 'Город · улица · номер дома', max: '' },
  { id: 's04', name: 'Аникс «Магазин 04»', address: 'Город · улица · номер дома', max: '' },
];

/** Дата для примера: days дней назад; minutes — время суток в минутах, а для сегодняшнего дня — сколько минут назад */
function ago(days: number, minutes: number): string {
  const d = new Date();
  if (days === 0) return new Date(d.getTime() - minutes * 60000).toISOString();
  d.setDate(d.getDate() - days);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d.toISOString();
}

/**
 * Пример участника (то, что отдаёт GET /me): 12 чеков, из них 11 зачислены на 37 шагов, один в обработке.
 * 37 шагов = пройден первый круг (1 билет) + 7 шагов во втором. Цифры на сайте сайт считает сам из этих чеков.
 */
const DEMO_ME: MeResponse = {
  name: 'Анна Сергеевна',
  phone: '9134567890',
  storeId: 'slav',
  partnerStops: [...CAMPAIGN.partnerStops],
  receipts: [
    { id: 'r1', last4: '2716', at: ago(0, 35), steps: 0, status: 'processing' },
    { id: 'r2', last4: '8421', at: ago(2, 18 * 60 + 42), steps: 1, status: 'done' },
    { id: 'r3', last4: '5176', at: ago(7, 12 * 60 + 8), steps: 3, status: 'done' },
    { id: 'r4', last4: '0943', at: ago(13, 9 * 60 + 31), steps: 2, status: 'done' },
    { id: 'r5', last4: '6630', at: ago(17, 19 * 60 + 20), steps: 2, status: 'done' },
    { id: 'r6', last4: '1187', at: ago(21, 11 * 60 + 47), steps: 1, status: 'done' },
    { id: 'r7', last4: '3092', at: ago(26, 17 * 60 + 5), steps: 1, status: 'done' },
    { id: 'r8', last4: '4458', at: ago(28, 13 * 60 + 14), steps: 6, status: 'done' },
    { id: 'r9', last4: '7731', at: ago(30, 18 * 60 + 2), steps: 5, status: 'done' },
    { id: 'r10', last4: '2290', at: ago(31, 10 * 60 + 45), steps: 6, status: 'done' },
    { id: 'r11', last4: '9014', at: ago(33, 16 * 60 + 37), steps: 5, status: 'done' },
    { id: 'r12', last4: '5562', at: ago(35, 12 * 60 + 20), steps: 5, status: 'done' },
  ],
};

/** Счётчик участников по неделям (пример). */
const PARTICIPANTS = [2140, 4860, 7320, 9950, 12480];

function load(): DemoState {
  if (memory) return memory;
  let s: DemoState;
  try {
    s = (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as DemoState | null) ?? {};
  } catch {
    return {};
  }
  // Старая версия хранила один профиль без номера — переносим его под номер (или под номер примера)
  if (s.loggedIn !== undefined || s.user || s.extraReceipts || s.extraSteps !== undefined) {
    const phone = s.user?.phone ?? DEMO_ME.phone;
    s.profiles = { ...s.profiles, [phone]: { user: s.user, extraReceipts: s.extraReceipts, extraSteps: s.extraSteps, fresh: s.fresh } };
    if (s.loggedIn) s.phone = phone;
    delete s.loggedIn; delete s.user; delete s.extraReceipts; delete s.extraSteps; delete s.fresh;
  }
  memory = s;
  return s;
}
function save(state: DemoState) {
  memory = state;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* приватный режим: состояние живёт только в памяти вкладки */
  }
}
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const PHONE_RE = /^9\d{9}$/;

/** Номер примера-участника: в демо им можно войти сразу, без регистрации */
const isDemoPhone = (phone: string) => phone === DEMO_ME.phone;

/** Демо-чек в том виде, в каком его отдал бы сервер: обработанный — зачислен, служебные поля убраны */
function settle(r: DemoReceipt, now: number): Receipt {
  const { pendingSteps, readyAt, ...rest } = r;
  // Чеки из старых демо-версий хранили готовую подпись вместо даты — показываем их как сегодняшние
  const base: Receipt = { ...rest, at: rest.at ?? new Date(now).toISOString() };
  if (base.status === 'processing' && readyAt && Date.parse(readyAt) <= now) return { ...base, status: 'done', steps: pendingSteps ?? 0 };
  return base;
}

/** Ответ «GET /me» в демо: профиль + все чеки. Шаги, круг и билеты считает toUser — так же, как с сервером */
function currentMe(): MeResponse | null {
  const s = load();
  if (!s.phone) return null;
  const p = s.profiles?.[s.phone] ?? {};
  const now = Date.now();
  const own = (p.extraReceipts ?? []).map((r) => settle(r, now));
  const base = clone(DEMO_ME);
  return {
    ...base,
    ...p.user,
    phone: s.phone,
    // Новый участник начинает с нуля; пример-участник — со своей готовой историей
    receipts: p.fresh ? own : [...own, ...base.receipts],
  };
}

function currentUser(): User | null {
  const me = currentMe();
  return me ? toUser(me) : null;
}

/** Профиль вошедшего участника для изменения (создаётся при первом обращении) */
function profileOf(s: DemoState): DemoProfile {
  s.profiles ??= {};
  return (s.profiles[s.phone as string] ??= {});
}

export const mockApi: AnixApi = {
  stores: STORES,
  participants: PARTICIPANTS,

  async me() {
    return currentUser();
  },

  sample() {
    return toUser(clone(DEMO_ME));
  },

  async login(phone) {
    await delay(500);
    if (!PHONE_RE.test(phone)) throw new Error('Введите 10 цифр номера, начиная с 9');
    const s = load();
    if (!s.profiles?.[phone] && !isDemoPhone(phone)) {
      throw new Error('Участник с этим номером не найден. Зарегистрируйтесь (в демо есть пример: 913 456-78-90)');
    }
    s.phone = phone;
    // Магазин в шапке — магазин этого участника
    s.selectedStore = s.profiles?.[phone]?.user?.storeId ?? (isDemoPhone(phone) ? DEMO_ME.storeId ?? undefined : s.selectedStore);
    save(s);
    return currentUser() as User;
  },

  async register(input: RegisterInput) {
    await delay(700);
    if (input.fullName.trim().length < 5) throw new Error('Введите фамилию, имя и отчество');
    if (!PHONE_RE.test(input.phone)) throw new Error('Введите 10 цифр номера, начиная с 9');
    if (!input.storeId) throw new Error('Выберите свой магазин');
    const s = load();
    if (s.profiles?.[input.phone] || isDemoPhone(input.phone)) throw new Error('Этот номер уже зарегистрирован. Нажмите «Войти»');
    // В профиле храним «Имя Отчество» для приветствия (как отдаёт GET /me), а не ФИО целиком
    const words = input.fullName.trim().split(/\s+/);
    const name = words.length >= 3 ? words.slice(1, 3).join(' ') : input.fullName.trim();
    s.profiles = { ...s.profiles, [input.phone]: { fresh: true, user: { name, phone: input.phone, storeId: input.storeId } } };
    s.phone = input.phone;
    s.selectedStore = input.storeId;
    save(s);
    return currentUser() as User;
  },

  async logout() {
    const s = load();
    delete s.phone;
    save(s);
  },

  async registerReceipt(number, channel): Promise<ReceiptResult> {
    await delay(900);
    const digits = String(number).replace(/\D/g, '');
    if (digits.length < 4) throw new Error('Введите номер чека полностью');
    const s = load();
    if (!s.phone) throw new Error('Сначала войдите или зарегистрируйтесь');
    const p = profileOf(s);
    const last = parseInt(digits[digits.length - 1] ?? '0', 10);
    const processing = last % 3 === 0; // демо: каждый третий чек «в обработке»
    const steps = processing ? 0 : 1 + (last % 3);
    const now = Date.now();
    const receipt: DemoReceipt = { id: `x${now}`, last4: digits.slice(-4), at: new Date(now).toISOString(), steps, status: processing ? 'processing' : 'done', channel };
    // Чек «в обработке» через 2 минуты зачисляется на 2 шага — видно после обновления страницы
    if (processing) Object.assign(receipt, { pendingSteps: 2, readyAt: new Date(now + 2 * 60000).toISOString() });
    p.extraReceipts = [receipt, ...(p.extraReceipts ?? [])];
    delete p.extraSteps;
    save(s);
    return processing ? { status: 'processing' } : { status: 'done', steps };
  },

  async selectStore(storeId) {
    const s = load();
    if (s.phone) {
      const p = profileOf(s);
      p.user = { ...p.user, storeId };
    }
    s.selectedStore = storeId;
    save(s);
  },

  selectedStore() {
    const s = load();
    return s.selectedStore ?? (s.phone ? s.profiles?.[s.phone]?.user?.storeId : undefined) ?? null;
  },

  cookieConsent(value) {
    const s = load();
    if (value !== undefined) {
      s.cookies = value;
      save(s);
    }
    return s.cookies;
  },
};
