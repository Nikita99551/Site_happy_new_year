/**
 * Чек по QR-коду. На чеке ссылка …/api/add_code_from_qr?qr=НОМЕР (пример: ?qr=7Y8KYAIALAL507L2cd);
 * сайт понимает и любую свою страницу с ?qr=НОМЕР (если бэкенд перенаправит туда, см. README «Чек по QR-коду»).
 * Номер ждёт во вкладке (sessionStorage), пока чек не зарегистрирован: переживает F5, вход и регистрацию.
 */

const KEY = 'anix_qr_pending';

/** Адрес из QR-кода на чеке — от корня сайта */
export const QR_PATH = 'api/add_code_from_qr';

/** Сколько помнить отсканированный чек, если человек так и не вошёл */
const TTL_MS = 24 * 60 * 60 * 1000;

/** Номер чека из QR-кода: латиница, цифры, «-» и «_» */
const QR_RE = /^[0-9A-Za-z_-]{4,64}$/;

/**
 * Отсканированный, но ещё не зарегистрированный чек
 * @typedef {Object} PendingQr
 * @property {string} code — Номер из ?qr=
 * @property {number} at — Когда отсканировали, мс
 */

/** Приватный режим без sessionStorage: номер живёт в памяти вкладки */
let memory = null;

/** Что открыли при этой загрузке страницы: 'valid' — ссылку с номером, 'invalid' — ссылку с битым номером. Окно — один раз */
let freshScan = null;

/** @returns {PendingQr | null} */
export function readPending() {
  let p;
  try {
    p = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
  } catch {
    p = memory;
  }
  if (!p || typeof p.code !== 'string' || !QR_RE.test(p.code) || Date.now() - (p.at ?? 0) > TTL_MS) return null;
  return p;
}

/** @param {PendingQr | null} p */
export function writePending(p) {
  memory = p;
  try {
    if (p) sessionStorage.setItem(KEY, JSON.stringify(p));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* приватный режим: хватит памяти */
  }
}

/** Ссылку с чека открыли при этой загрузке? Отвечает один раз, дальше null (F5 окно не повторяет) */
export function takeFreshScan() {
  const s = freshScan;
  freshScan = null;
  return s;
}

/**
 * Вызывается в main.jsx ДО запуска роутера: забирает номер из адреса и убирает его оттуда.
 * С /api/add_code_from_qr уходим на главную — роутер такой страницы не знает (была бы 404).
 * Номера нет в адресе — «Назад» и F5 не отправят тот же чек второй раз.
 */
export function captureQrFromUrl() {
  const base = import.meta.env.BASE_URL; // '/' на сервере, '/Site_happy_new_year/' в показе на GitHub Pages
  const onQrPath = location.pathname.replace(/\/+$/, '') === base + QR_PATH;
  const params = new URLSearchParams(location.search);
  if (!onQrPath && !params.has('qr')) return;
  const code = (params.get('qr') ?? '').trim();
  freshScan = QR_RE.test(code) ? 'valid' : 'invalid';
  if (freshScan === 'valid') writePending({ code, at: Date.now() });
  // Остальные параметры (?noanim, ?demo-reset) остаются как были
  const query = location.search.slice(1).split('&').filter((p) => p && !/^qr(=|$)/.test(p)).join('&');
  history.replaceState(history.state, '', (onQrPath ? base : location.pathname) + (query ? `?${query}` : '') + location.hash);
}
