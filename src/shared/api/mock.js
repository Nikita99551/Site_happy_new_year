/**
 * ДЕМО-реализация API: отвечает сама, состояние хранит в localStorage (ключ anix_demo).
 * Персональные данные никуда не отправляются. Сброс: открыть сайт с ?demo-reset в адресе.
 */
import { CAMPAIGN, isTaskOpen, PARTNER_TASKS } from '@/shared/config/campaign';
import { MEDIA_LIMITS, readVideo, shrinkPhoto } from '@/shared/lib/media';
import { demoAnswers } from './answers.demo';
import { toUser } from './progress';
import { STORES } from './stores.data';

const STORAGE_KEY = 'anix_demo';

/** Глубокая копия без structuredClone (его нет в Safari до 15.4) */
const clone = (v) => JSON.parse(JSON.stringify(v));

/** Состояние в памяти вкладки: если localStorage недоступен (приватный режим), демо всё равно работает до перезагрузки */
let memory = null;

/**
 * Чек в демо-хранилище: чек «в обработке» через пару минут сам становится зачисленным (как на сервере)
 * Все поля Receipt, а также:
 * @typedef {Object} DemoReceipt
 * @property {number} [pendingSteps] — Сколько шагов даст чек после обработки
 * @property {string} [readyAt] — Когда обработка закончится, ISO
 * @property {string} [qr] — Номер из QR-кода: второй раз тот же чек не регистрируется
 */

/**
 * Профиль одного участника в демо (у каждого номера свой)
 * @typedef {Object} DemoProfile
 * @property {Partial<Pick<User, 'name' | 'phone' | 'storeId'>>} [user]
 * @property {DemoReceipt[]} [extraReceipts] — Чеки, зарегистрированные в демо (у примера-участника — сверх его готовой истории)
 * @property {number} [extraSteps] — Устарело: шаги считаются только из чеков. Поле осталось в старых сохранениях и игнорируется
 * @property {boolean} [fresh] — Новый участник (после регистрации): начинает с нуля — первый круг, 0 шагов, без чеков
 */

/** Дата для примера: days дней назад; minutes — время суток в минутах, а для сегодняшнего дня — сколько минут назад */
function ago(days, minutes) {
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
const DEMO_ME = {
  name: 'Анна Сергеевна',
  phone: '9134567890',
  storeId: '11', // «Славянский», Бийск
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

function load() {
  if (memory) return memory;
  let s;
  try {
    s = (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')) ?? {};
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
function save(state) {
  memory = state;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* приватный режим: состояние живёт только в памяти вкладки */
  }
}
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const PHONE_RE = /^9\d{9}$/;
/** Номер чека из QR-кода: латиница и цифры (пример: 7Y8KYAIALAL507L2cd) */
const QR_RE = /^[0-9A-Za-z_-]{4,64}$/;

/** Номер примера-участника: в демо им можно войти сразу, без регистрации */
const isDemoPhone = (phone) => phone === DEMO_ME.phone;

/** Демо-чек в том виде, в каком его отдал бы сервер: обработанный — зачислен, служебные поля убраны */
function settle(r, now) {
  const { pendingSteps, readyAt, qr: _qr, ...rest } = r;
  // Чеки из старых демо-версий хранили готовую подпись вместо даты — показываем их как сегодняшние
  const base = { ...rest, at: rest.at ?? new Date(now).toISOString() };
  if (base.status === 'processing' && readyAt && Date.parse(readyAt) <= now) return { ...base, status: 'done', steps: pendingSteps ?? 0 };
  return base;
}

/** Ответ «GET /me» в демо: профиль + все чеки. Шаги, круг и билеты считает toUser — так же, как с сервером */
function currentMe() {
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

function currentUser() {
  const me = currentMe();
  return me ? toUser(me) : null;
}

/** Профиль вошедшего участника для изменения (создаётся при первом обращении) */
function profileOf(s) {
  s.profiles ??= {};
  return (s.profiles[s.phone] ??= {});
}

/* ---------- Ответы на задания партнёров (правка 08.11) ---------- */

/** Сколько демо-ответ «на проверке»: потом публикуется сам (на сервере — когда его проверит модератор) */
const ANSWER_REVIEW_MS = 60000;
/** Видео, выбранные в этой вкладке. Файл в localStorage не помещается: в демо видео играет до перезагрузки страницы */
const demoVideos = new Map();
const answerKind = (a) => (a.video ? 'video' : a.photo ? 'photo' : 'text');
const byNew = (a, b) => Date.parse(b.at) - Date.parse(a.at);
const byPopular = (a, b) => b.likes - a.likes || byNew(a, b);
const slugStep = (slug) => CAMPAIGN.partnerStops.find((n) => PARTNER_TASKS[n]?.slug === slug);

/** Подпись ответа: имя и первая буква фамилии («Анна К.») и город магазина */
function authorOf(s, phone) {
  const p = s.profiles?.[phone];
  const name = (p?.user?.name ?? (isDemoPhone(phone) ? DEMO_ME.name : 'Участник')).split(/\s+/)[0];
  const initial = p?.initial ?? (isDemoPhone(phone) ? 'К' : '');
  const storeId = p?.user?.storeId ?? (isDemoPhone(phone) ? DEMO_ME.storeId : null);
  const address = STORES.find((st) => st.id === storeId)?.address ?? '';
  return { author: initial ? `${name} ${initial}.` : name, place: address.split(',')[0].trim() };
}

/** Ответ из демо-хранилища в том виде, в каком его отдал бы сервер: через минуту «на проверке» становится опубликованным */
function settleAnswer(a, now) {
  const { readyAt, ...rest } = a;
  const out = { ...rest };
  if (out.status === 'review' && readyAt && Date.parse(readyAt) <= now) out.status = 'published';
  if (out.video) out.video = { ...out.video, src: demoVideos.get(out.id) ?? '' };
  return out;
}

/** Все ответы на задание: готовые демо + отправленные в демо (у каждого номера свой), с сердечками и пометкой «мой» */
function allAnswers(s, slug, now) {
  const likes = s.likes ?? {};
  const own = Object.entries(s.answers?.[slug] ?? {}).map(([phone, a]) => ({ ...settleAnswer(a, now), likes: 0, owner: phone }));
  return [...own, ...demoAnswers(slug)].map(({ owner, ...a }) => {
    const by = likes[a.id] ?? [];
    return { ...a, likes: a.likes + by.length, liked: Boolean(s.phone) && by.includes(s.phone), mine: Boolean(s.phone) && owner === s.phone };
  });
}

/** Сколько сердечек у ответа без голосов, поставленных в демо */
function baseLikes(id) {
  for (const t of Object.values(PARTNER_TASKS)) {
    const a = demoAnswers(t.slug).find((x) => x.id === id);
    if (a) return a.likes;
  }
  return 0;
}

export const mockApi = {

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
    return currentUser();
  },

  async register(raw) {
    await delay(700);
    // Форма шлёт поля сервера (fio, phone_number «900 555 44 33», shops_id числом) — демо приводит их к своим (правка 06.11)
    const input = {
      fullName: String(raw.fullName ?? raw.fio ?? ''),
      phone: String(raw.phone ?? raw.phone_number ?? '').replace(/\D/g, '').slice(-10),
      storeId: raw.storeId ?? (raw.shops_id != null ? String(raw.shops_id) : undefined),
    };
    if (input.fullName.trim().length < 5) throw new Error('Введите фамилию, имя и отчество');
    if (!PHONE_RE.test(input.phone)) throw new Error('Введите 10 цифр номера, начиная с 9');
    if (!input.storeId) throw new Error('Выберите свой магазин');
    const s = load();
    if (s.profiles?.[input.phone] || isDemoPhone(input.phone)) throw new Error('Этот номер уже зарегистрирован. Нажмите «Войти»');
    // В профиле храним «Имя Отчество» для приветствия (как отдаёт GET /me), а не ФИО целиком
    const words = input.fullName.trim().split(/\s+/);
    const name = words.length >= 3 ? words.slice(1, 3).join(' ') : input.fullName.trim();
    // Первая буква фамилии — для подписи ответов на задания («Анна К.»); сервер собирает подпись так же
    const initial = words.length >= 2 ? words[0][0].toUpperCase() : '';
    s.profiles = { ...s.profiles, [input.phone]: { fresh: true, user: { name, phone: input.phone, storeId: input.storeId }, initial } };
    s.phone = input.phone;
    s.selectedStore = input.storeId;
    save(s);
    return currentUser();
  },

  async logout() {
    const s = load();
    delete s.phone;
    save(s);
  },

  async registerReceipt(number, channelOrTornado) {
    await delay(900);
    // Форма шлёт is_tornado (true/false) вместо 'store'/'delivery' (правка 06.11)
    const channel = channelOrTornado === true ? 'delivery' : channelOrTornado === false ? 'store' : channelOrTornado;
    // Код с чека — латиница и цифры (правка 29.10), номер заказа доставки — цифры
    const code = String(number).replace(/[^0-9A-Za-z]/g, '');
    if (code.length < 4) throw new Error('Введите номер чека полностью');
    const s = load();
    if (!s.phone) throw new Error('Сначала войдите или зарегистрируйтесь');
    const p = profileOf(s);
    // Демо: шаги по последнему знаку — цифра как раньше (4 → 2 шага), буква — по её коду
    const end = code[code.length - 1];
    const last = /\d/.test(end) ? Number(end) : end.charCodeAt(0) % 10;
    const processing = last % 3 === 0; // демо: каждый третий чек «в обработке»
    const steps = processing ? 0 : 1 + (last % 3);
    const now = Date.now();
    const receipt = { id: `x${now}`, last4: code.slice(-4).toUpperCase(), at: new Date(now).toISOString(), steps, status: processing ? 'processing' : 'done', channel };
    // Чек «в обработке» через 2 минуты зачисляется на 2 шага — видно после обновления страницы
    if (processing) Object.assign(receipt, { pendingSteps: 2, readyAt: new Date(now + 2 * 60000).toISOString() });
    p.extraReceipts = [receipt, ...(p.extraReceipts ?? [])];
    delete p.extraSteps;
    save(s);
    return processing ? { status: 'processing' } : { status: 'done', steps };
  },

  async registerReceiptQr(qr) {
    await delay(900);
    const code = String(qr).trim();
    if (!QR_RE.test(code)) throw new Error('Не получилось прочитать QR-код. Введите номер чека вручную');
    const s = load();
    if (!s.phone) throw new Error('Сначала войдите или зарегистрируйтесь');
    // Один чек — один раз, даже если его отсканирует другой участник
    const taken = Object.values(s.profiles ?? {}).some((p) => (p.extraReceipts ?? []).some((r) => r.qr === code));
    if (taken) throw new Error('Этот чек уже зарегистрирован');
    const p = profileOf(s);
    const now = Date.now();
    // Чек по QR всегда сначала «в обработке» (данные из кассы приходят не сразу), через 2 минуты — 2 шага
    const receipt = {
      id: `q${now}`, last4: code.slice(-4).toUpperCase(), at: new Date(now).toISOString(), steps: 0, status: 'processing', channel: 'store',
      qr: code, pendingSteps: 2, readyAt: new Date(now + 2 * 60000).toISOString(),
    };
    p.extraReceipts = [receipt, ...(p.extraReceipts ?? [])];
    save(s);
    return { status: 'processing' };
  },

  async selectStore(storeOrId) {
    // Окно магазинов передаёт магазин целиком, остальные места — номер (правка 06.11)
    const storeId = storeOrId && typeof storeOrId === 'object' ? storeOrId.id : storeOrId;
    const store = STORES.find((s) => s.id === storeId);
    const s = load();
    if (s.phone) {
      const p = profileOf(s);
      p.user = { ...p.user, storeId };
    }
    s.selectedStore = storeId;
    s.selectedStoreObject = store || null;
    save(s);
  },

  selectedStore() {
    const s = load();
    return s.selectedStore ?? (s.phone ? s.profiles?.[s.phone]?.user?.storeId : undefined) ?? null;
  },

  selectedStoreObject() {
    const s = load();
    return s.selectedStoreObject ?? null;
  },

  cookieConsent(value) {
    const s = load();
    if (value !== undefined) {
      s.cookies = value;
      save(s);
    }
    return s.cookies;
  },

  async answers(slug, { sort = 'popular', type = 'all', cursor = null, limit = 20 } = {}) {
    await delay(cursor ? 400 : 250);
    // Ответы видят только дошедшие до шага с коробкой (правка 08.11); сервер в этом случае отвечает 403
    const step = slugStep(slug);
    if (!isTaskOpen(currentUser(), step)) throw new Error(`Ответы видны тем, кто дошёл до ${step}‑го шага`);
    const s = load();
    const all = allAnswers(s, slug, Date.now());
    const pub = all.filter((a) => a.status === 'published');
    const counts = { all: pub.length, text: 0, photo: 0, video: 0 };
    for (const a of pub) counts[answerKind(a)] += 1;
    const list = (type === 'all' ? pub : pub.filter((a) => answerKind(a) === type)).sort(sort === 'new' ? byNew : byPopular);
    const from = Number(cursor) || 0;
    return {
      items: clone(list.slice(from, from + limit)),
      next: from + limit < list.length ? String(from + limit) : null,
      counts,
      mine: clone(all.find((a) => a.mine) ?? null),
    };
  },

  async sendAnswer(slug, input) {
    await delay(900);
    const s = load();
    if (!s.phone) throw new Error('Сначала войдите или зарегистрируйтесь');
    const step = slugStep(slug);
    const task = PARTNER_TASKS[step];
    if (!task) throw new Error('У этого партнёра нет задания');
    if (!isTaskOpen(currentUser(), step)) throw new Error(`Задание откроется, когда вы дойдёте до ${step}‑го шага`);
    const prev = s.answers?.[slug]?.[s.phone];
    if (prev && prev.status !== 'rejected') throw new Error('Вы уже ответили на это задание');
    const text = String(input.text ?? '').trim().slice(0, MEDIA_LIMITS.textMax);
    const { accepts } = task;
    if (accepts.text === 'required' && !text) throw new Error('Напишите ответ');
    if (accepts.photo === 'required' && !input.photo) throw new Error('Добавьте фото');
    if (accepts.video === 'required' && !input.video) throw new Error('Добавьте видео');
    if (!text && !input.photo && !input.video) throw new Error('Добавьте фото, видео или напишите пару слов');
    const now = Date.now();
    const id = `my-${slug}-${now}`;
    const a = { id, ...authorOf(s, s.phone), at: new Date(now).toISOString(), likes: 0, status: 'review', readyAt: new Date(now + ANSWER_REVIEW_MS).toISOString() };
    if (text) a.text = text;
    if (input.photo) {
      try {
        a.photo = await shrinkPhoto(input.photo);
      } catch {
        // На сервере подойдёт и HEIC с iPhone; в демо браузер не всё умеет открыть
        throw new Error('Не получилось открыть фото. Попробуйте JPEG или PNG');
      }
    }
    if (input.video) {
      const v = await readVideo(input.video);
      demoVideos.set(id, URL.createObjectURL(input.video));
      a.video = { src: '', poster: v.poster, duration: Number.isFinite(v.duration) ? Math.round(v.duration) : 0 };
    }
    s.answers = { ...s.answers, [slug]: { ...s.answers?.[slug], [s.phone]: a } };
    save(s);
    return { ...settleAnswer(a, now), liked: false, mine: true };
  },

  async likeAnswer(id, like) {
    await delay(150);
    const s = load();
    if (!s.phone) throw new Error('Войдите, чтобы ставить сердечки');
    const own = Object.values(s.answers ?? {}).some((m) => m[s.phone]?.id === id);
    if (own) throw new Error('За свой ответ голосовать нельзя');
    const by = new Set(s.likes?.[id] ?? []);
    if (like) by.add(s.phone);
    else by.delete(s.phone);
    s.likes = { ...s.likes, [id]: [...by] };
    save(s);
    return { likes: baseLikes(id) + by.size, liked: like };
  },
};
