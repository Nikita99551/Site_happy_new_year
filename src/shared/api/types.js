/**
 * Контракт между фронтендом и бэкендом. Бэкенд должен отдавать данные ровно в этих формах.
 * Реализации: mock.js (демо, localStorage) и http.js (fetch к API).
 */

/**
 * @typedef {'done' | 'processing'} ReceiptStatus
 */
/**
 * @typedef {'store' | 'delivery'} ReceiptChannel
 */

/**
 * @typedef {Object} Receipt
 * @property {string} id
 * @property {string} last4 — Последние 4 цифры номера чека для показа в истории
 * @property {string} at — Когда чек зарегистрирован, ISO 8601 («2026-12-20T18:42:00+07:00»). Подпись («Только что», «5 минут назад», «Сегодня · 14:05», «20 декабря · 18:42») сайт считает сам и обновляет каждую минуту
 * @property {number} steps
 * @property {ReceiptStatus} status
 * @property {ReceiptChannel} [channel]
 */

/**
 * Что сервер отдаёт в GET /me, POST /auth/login и POST /auth/register: профиль и ВСЕ чеки участника.
 * Шаг, круг, билеты сервер НЕ присылает: сайт считает их сам из чеков (shared/api/progress.js),
 * поэтому история чеков и ёлка всегда совпадают.
 * @typedef {Object} MeResponse
 * @property {string} name — Имя и отчество для приветствия
 * @property {string} phone — 10 цифр без +7
 * @property {string | null} storeId
 * @property {number[]} partnerStops — Шаги с площадкой партнёра в круге
 * @property {Receipt[]} receipts — Все чеки участника за акцию (в обработке тоже). Порядок любой — сайт сортирует сам
 */

/**
 * Участник для интерфейса: ответ сервера + прогресс, посчитанный из чеков (toUser в progress.js)
 * Все поля MeResponse, а также:
 * @typedef {Object} User
 * @property {number} totalSteps — Все шаги за акцию = сумма шагов по зачисленным чекам
 * @property {number} circle — Текущий круг (1 — первый)
 * @property {number} step — Шаг в текущем круге, 0…30
 * @property {number} circlesDone — Пройденных кругов
 * @property {number} receiptsTotal — Чеков всего (вместе с чеками в обработке)
 * @property {number} chances — Билетов на розыгрыши = пройденных кругов
 * @property {Receipt[]} receipts — Все чеки, новые первыми
 */

/**
 * @typedef {Object} Store
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {string} [district] — Район или часть города, по нему тоже ищут («Зелёный клин», «Майминский район»). Может быть пустым
 * @property {string} max — Ссылка на группу MAX магазина. Пустая строка — чата нет или ссылку ещё проверяют: кнопка серая
 */

/**
 * @typedef {Object} RegisterInput
 * @property {string} fullName
 * @property {string} phone
 * @property {string} storeId
 * @property {{ pd: true; rules: true }} consents
 */

/**
 * @typedef {{ status: 'done'; steps: number } | { status: 'processing' }} ReceiptResult
 */

/**
 * @typedef {Object} AnixApi
 * @property {Store[]} stores — Справочник магазинов. GET /stores
 * @property {number[]} participants — Участников по неделям (для графика на главной). GET /stats
 * @property {() => Promise<User | null>} me — Текущий пользователь или null. GET /me
 * @property {() => User} sample — Пример маршрута для гостя (показывается до входа). Бэкенду не нужен.
 * @property {(phone: string) => Promise<User>} login — Вход по телефону без SMS. POST /auth/login { phone }
 * @property {(input: RegisterInput) => Promise<User>} register — Регистрация. POST /auth/register
 * @property {() => Promise<void>} logout — Выход. POST /auth/logout
 * @property {(number: string, channel: ReceiptChannel) => Promise<ReceiptResult>} registerReceipt — Регистрация чека или заказа доставки. POST /receipts { number, channel }
 * @property {(storeId: string) => Promise<void>} selectStore — Выбор магазина (и до входа тоже). PATCH /me { storeId }
 * @property {() => string | null} selectedStore — Выбранный магазин: из профиля или сохранённый локально до входа
 * @property {(value?: boolean) => boolean | undefined} cookieConsent — Согласие на cookie: undefined — ещё не отвечал
 */
