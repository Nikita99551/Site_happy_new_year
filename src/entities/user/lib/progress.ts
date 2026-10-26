import { CAMPAIGN, nextMilestone } from '@/shared/config/campaign';
import { formatRub, plural } from '@/shared/lib/text';
import type { User } from '@/shared/api';

/** Что ждёт участника на следующей вехе и сколько до неё. Используется на маршруте, открытке главной и в окнах чека. */
export interface Progress {
  step: number;
  next: 10 | 20 | 30;
  left: number;
  /** «3 шага» */
  leftText: string;
  /** Покупки на столько рублей до вехи: «1 800 ₽» */
  leftRub: string;
  /** Номинал сертификата на вехе, если это 10 или 20 */
  certRub: string;
  /** «сертификата Аникс» или «билета на розыгрыш» (родительный падеж) */
  goalGen: string;
  /** «каждый 30‑й получает сертификат Аникс на 1 500 ₽» или «билет на розыгрыш призов» */
  goalText: string;
}

export function getProgress(step: number): Progress {
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
    goalGen: next === 30 ? 'билета на розыгрыш' : 'сертификата Аникс',
    goalText: next === 30 ? 'билет на розыгрыш призов' : `каждый ${every}‑й получает сертификат Аникс на ${certRub}`,
  };
}

/** Шаг для показа: у гостя — пример маршрута */
export function displayStep(user: User | null, sample: User): number {
  return (user ?? sample).step;
}
