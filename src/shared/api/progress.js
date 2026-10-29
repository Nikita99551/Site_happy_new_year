/**
 * Прогресс участника считается ТОЛЬКО из его чеков — одна функция для демо и для настоящего сервера.
 * Поэтому история чеков, ёлка, гирлянда, «кругов пройдено» и «билетов» не могут разойтись:
 * всё это разные виды одного числа — суммы шагов по зачисленным чекам.
 */
import { CAMPAIGN } from '@/shared/config/campaign';

/** Сумма шагов по зачисленным чекам. Чеки «в обработке» шагов пока не дают. */
export function totalSteps(receipts) {
  return receipts.reduce((sum, r) => sum + (r.status === 'done' ? Math.max(0, r.steps) : 0), 0);
}

/**
 * Шаг, круг и билеты из общего числа шагов.
 * Ровно 30 (60, 90…): круг пройден, билет начислен, звезда горит — новый круг начнёт следующий чек.
 * 37 шагов = пройден 1 круг + 7 шагов во втором.
 */
export function progressFromSteps(total) {
  const n = CAMPAIGN.circleSteps;
  const done = Math.floor(Math.max(0, total) / n);
  if (total > 0 && total % n === 0) return { circle: done, step: n, circlesDone: done, chances: done };
  return { circle: done + 1, step: total % n, circlesDone: done, chances: done };
}

/** Ответ сервера (профиль + все чеки) → данные для интерфейса */
export function toUser(me) {
  if (!me) return null;
  const receipts = (me.receipts ?? []).slice().sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const total = totalSteps(receipts);
  return { ...me, receipts, totalSteps: total, receiptsTotal: receipts.length, ...progressFromSteps(total) };
}

/**
 * Где в истории чеков пройден круг: id чека → номера кругов, которые он закрыл
 * (обычно один; крупный чек теоретически может закрыть и два).
 */
export function circleMarks(receipts) {
  const marks = new Map();
  const n = CAMPAIGN.circleSteps;
  let sum = 0;
  // от старых к новым
  for (const r of [...receipts].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
    if (r.status !== 'done' || r.steps <= 0) continue;
    const before = Math.floor(sum / n);
    sum += r.steps;
    const after = Math.floor(sum / n);
    if (after > before) marks.set(r.id, Array.from({ length: after - before }, (_, i) => before + i + 1));
  }
  return marks;
}
