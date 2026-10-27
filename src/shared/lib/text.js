/** Склонение по числу: plural(3, 'шаг', 'шага', 'шагов') → 'шага' */
export function plural(n, one, few, many) {
  const m = n % 10;
  const h = n % 100;
  if (h >= 11 && h <= 14) return many;
  if (m === 1) return one;
  if (m >= 2 && m <= 4) return few;
  return many;
}

/** Число с неразрывными пробелами между разрядами: 1800 → '1 800' */
export function formatNumber(n) {
  return n.toLocaleString('ru-RU').replace(/\s/g, ' ');
}

/** Сумма в рублях: 1800 → '1 800 ₽' */
export function formatRub(n) {
  return `${formatNumber(n)} ₽`;
}

/** Порядковое числительное круга: 1 → 'первый' */
export function circleName(n) {
  return ['первый', 'второй', 'третий', 'четвёртый'][n - 1] ?? `${n}‑й`;
}

/** «в первом круге», «во втором круге», «в 5‑м круге» */
export function inCircle(n) {
  const w = ['первом', 'втором', 'третьем', 'четвёртом'][n - 1] ?? `${n}‑м`;
  return `${n === 2 ? 'во' : 'в'} ${w} круге`;
}

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

/** Время регистрации чека для истории: «Только что», «5 минут назад», «Сегодня · 14:05», «Вчера · 09:31», «20 декабря · 18:42» */
export function formatWhen(iso, now = new Date()) {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return '';
  const min = Math.floor((now.getTime() - t.getTime()) / 60000);
  if (min < 1) return 'Только что';
  if (min < 60) return `${min} ${plural(min, 'минуту', 'минуты', 'минут')} назад`;
  const hm = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  const day = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((day(now) - day(t)) / 86400000);
  if (diffDays === 0) return `Сегодня · ${hm}`;
  if (diffDays === 1) return `Вчера · ${hm}`;
  return `${t.getDate()} ${MONTHS[t.getMonth()]} · ${hm}`;
}
