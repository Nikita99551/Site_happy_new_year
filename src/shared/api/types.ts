/**
 * Контракт между фронтендом и бэкендом. Бэкенд должен отдавать данные ровно в этих формах.
 * Реализации: mock.ts (демо, localStorage) и http.ts (fetch к API).
 */

export type ReceiptStatus = 'done' | 'processing';
export type ReceiptChannel = 'store' | 'delivery';

export interface Receipt {
  id: string;
  /** Последние 4 цифры номера чека для показа в истории */
  last4: string;
  /** Когда чек зарегистрирован, ISO 8601 («2026-12-20T18:42:00+07:00»). Подпись («Только что», «5 минут назад»,
   *  «Сегодня · 14:05», «20 декабря · 18:42») сайт считает сам и обновляет каждую минуту */
  at: string;
  steps: number;
  status: ReceiptStatus;
  channel?: ReceiptChannel;
}

/**
 * Что сервер отдаёт в GET /me, POST /auth/login и POST /auth/register: профиль и ВСЕ чеки участника.
 * Шаг, круг, билеты сервер НЕ присылает: сайт считает их сам из чеков (shared/api/progress.ts),
 * поэтому история чеков и ёлка всегда совпадают.
 */
export interface MeResponse {
  /** Имя и отчество для приветствия */
  name: string;
  /** 10 цифр без +7 */
  phone: string;
  storeId: string | null;
  /** Шаги с площадкой партнёра в круге */
  partnerStops: number[];
  /** Все чеки участника за акцию (в обработке тоже). Порядок любой — сайт сортирует сам */
  receipts: Receipt[];
}

/** Участник для интерфейса: ответ сервера + прогресс, посчитанный из чеков (toUser в progress.ts) */
export interface User extends MeResponse {
  /** Все шаги за акцию = сумма шагов по зачисленным чекам */
  totalSteps: number;
  /** Текущий круг (1 — первый) */
  circle: number;
  /** Шаг в текущем круге, 0…30 */
  step: number;
  /** Пройденных кругов */
  circlesDone: number;
  /** Чеков всего (вместе с чеками в обработке) */
  receiptsTotal: number;
  /** Билетов на розыгрыши = пройденных кругов */
  chances: number;
  /** Все чеки, новые первыми */
  receipts: Receipt[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  /** Район или часть города, по нему тоже ищут («Зелёный клин», «Майминский район»). Может быть пустым */
  district?: string;
  /** Ссылка на группу MAX магазина. Пустая строка — чата нет или ссылку ещё проверяют: кнопка серая */
  max: string;
}

export interface RegisterInput {
  fullName: string;
  phone: string;
  storeId: string;
  consents: { pd: true; rules: true };
}

export type ReceiptResult = { status: 'done'; steps: number } | { status: 'processing' };

export interface AnixApi {
  /** Справочник магазинов. GET /stores */
  stores: Store[];
  /** Участников по неделям (для графика на главной). GET /stats */
  participants: number[];
  /** Текущий пользователь или null. GET /me */
  me(): Promise<User | null>;
  /** Пример маршрута для гостя (показывается до входа). Бэкенду не нужен. */
  sample(): User;
  /** Вход по телефону без SMS. POST /auth/login { phone } */
  login(phone: string): Promise<User>;
  /** Регистрация. POST /auth/register */
  register(input: RegisterInput): Promise<User>;
  /** Выход. POST /auth/logout */
  logout(): Promise<void>;
  /** Регистрация чека или заказа доставки. POST /receipts { number, channel } */
  registerReceipt(number: string, channel: ReceiptChannel): Promise<ReceiptResult>;
  /** Выбор магазина (и до входа тоже). PATCH /me { storeId } */
  selectStore(storeId: string): Promise<void>;
  /** Выбранный магазин: из профиля или сохранённый локально до входа */
  selectedStore(): string | null;
  /** Согласие на cookie: undefined — ещё не отвечал */
  cookieConsent(value?: boolean): boolean | undefined;
}
