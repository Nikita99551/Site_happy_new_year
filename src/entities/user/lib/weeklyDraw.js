import { CAMPAIGN } from '@/shared/config/campaign';

/** Время организатора — Бийск, UTC+7: расчётные недели считаются по нему */
const TZ_MS = 7 * 3600 * 1000;

/** День по времени организатора, «2026-11-23»; null — дату не разобрать */
function dayOf(ms) {
  return Number.isFinite(ms) ? new Date(ms + TZ_MS).toISOString().slice(0, 10) : null;
}

/**
 * Статус участника в еженедельном розыгрыше (п. 8.3 правил, вариант 3 от 11.11 вечер): участвует тот, кто сделал
 * хотя бы один шаг в расчётную неделю розыгрыша — с понедельника по воскресенье перед вторником розыгрыша.
 * Личный статус — только когда известны даты засчитанных чеков (сервер может присылать лишь общее число шагов).
 * @param {import('@/shared/api/types').User | null} user
 * @param {number} [now]
 * @returns {{ state: 'general' | 'before' | 'after' | 'in' | 'out', draw?: string }}
 *   general — гость или даты чеков неизвестны; before — акция ещё не началась; after — расчётные недели закончились;
 *   in — на этой неделе шаг есть; out — шага на этой неделе пока нет. draw — дата ближайшего розыгрыша, «24 ноября».
 */
export function weeklyDrawStatus(user, now = Date.now()) {
  const periods = CAMPAIGN.weeklyPeriods;
  const today = dayOf(now);
  if (today < periods[0].from) return { state: 'before' };
  const cur = periods.find((p) => today >= p.from && today <= p.to);
  if (!cur) return { state: 'after' };
  if (!user) return { state: 'general' };
  const done = (user.receipts ?? []).filter((r) => r.status === 'done');
  const days = done.map((r) => dayOf(Date.parse(r.at)));
  if ((done.length === 0 && user.totalSteps > 0) || days.includes(null)) return { state: 'general' };
  const steps = done.reduce((sum, r, i) => (days[i] >= cur.from && days[i] <= cur.to ? sum + Math.max(0, r.steps) : sum), 0);
  return { state: steps > 0 ? 'in' : 'out', draw: cur.draw };
}
