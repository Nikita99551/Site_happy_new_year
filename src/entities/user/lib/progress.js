import { CAMPAIGN, nextMilestone } from '@/shared/config/campaign';
import { formatRub, plural } from '@/shared/lib/text';

/**
 * Что ждёт участника на следующей вехе и сколько до неё. Используется на маршруте, открытке главной и в окнах чека.
 * @typedef {Object} Progress
 * @property {number} step
 * @property {10 | 20 | 30} next
 * @property {number} left
 * @property {string} leftText — «3 шага»
 * @property {string} leftRub — Покупки на столько рублей до вехи: «1 800 ₽»
 * @property {string} certRub — Номинал сертификата на вехе, если это 10 или 20
 * @property {string} goalGen — «розыгрыша сертификата» или «билета на розыгрыш» (родительный падеж)
 * @property {string} goalText — «каждый 30‑й получает сертификат Аникс на 1 500 ₽» или «билет на розыгрыш призов»
 */

export function getProgress(step) {
  const next = nextMilestone(step);
  const left = next - step;
  const certRub = formatRub(CAMPAIGN.milestones[next] ?? 0);
  const every = CAMPAIGN.milestoneEvery[next];
  return {
    step,
    next,
    left,
    leftText: `${left} ${plural(left, 'шаг', 'шага', 'шагов')}`,
    leftRub: formatRub(left * CAMPAIGN.stepRub),
    certRub,
    goalGen: next === 30 ? 'билета на розыгрыш' : 'розыгрыша сертификата',
    goalText: next === 30 ? 'билет на розыгрыш призов' : `каждый ${every}‑й получает сертификат Аникс на ${certRub}`,
  };
}

/** Шаг для показа: у гостя — пример маршрута */
export function displayStep(user, sample) {
  return (user ?? sample).step;
}
