import { formatRub } from '@/shared/lib/text';

/** Параметры акции «Год Козы — лови призы». Единственное место, где меняются цифры механики. */
export const CAMPAIGN = {
  /** Период покупок и регистрации чеков */
  start: '2026-11-16',
  end: '2027-01-10',
  /** Выдача призов заканчивается */
  prizesUntil: '2027-01-24',
  /** Каждые полные 600 ₽ в чеке = 1 шаг (алкоголь, табачные изделия и товары партнёров в сумму не входят) */
  stepRub: 600,
  /** 5 товаров партнёров = ещё 1 шаг, прибавляется к шагам за сумму */
  partnerItemsPerStep: 5,
  maxReceiptsPerDay: 5,
  /** Один круг маршрута */
  circleSteps: 30,
  /** Вехи круга: шаг → номинал сертификата Аникс, ₽ */
  milestones: { 10: 1500, 20: 3000 },
  /** Каждый N-й участник недели, дошедший до вехи, получает сертификат */
  milestoneEvery: { 10: 30, 20: 100 },
  /** Шаги с заданием партнёра (коробка на ёлке и гирлянде) */
  partnerStops: [4, 8, 12, 16, 24, 28],
  /** Даты еженедельных розыгрышей и финала */
  weeklyDraws: ['24.11', '01.12', '08.12', '15.12', '22.12', '29.12', '05.01'],
  finalDraw: '12.01.2027',
};

/**
 * Промокоды доставки «Торнадо» (правка 27.10): не розыгрыш — каждому, кто дошёл до шага.
 * Код показывается на «Моём маршруте», когда шаг пройден; вводится в приложении «Торнадо».
 * Шаги (правка 30.10): все 15 кодов на нечётных шагах 1–29 — подарки ёлки (площадки партнёров partnerStops, сертификаты 10 и 20,
 * финиш 30) все на чётных, поэтому промокод с подарком не совпадает никогда. На 30-м промокода нет. Скидка растёт к концу круга.
 * ЗАПОЛНИТЬ: срок действия кодов и сколько раз действует один код (уточнить у «Торнадо»).
 */
export const DELIVERY_PROMOS = [
  { code: 'ЕЛКА', discount: 300, minOrder: 2000, steps: [1, 3, 5, 7, 9] },
  { code: '27ГОД', discount: 500, minOrder: 3000, steps: [11, 13, 15, 17, 19, 21] },
  { code: 'БАРАШКА', discount: 750, minOrder: 5000, steps: [23, 25, 27, 29] },
];
/** Все шаги с промокодом по порядку */
export const PROMO_STEPS = DELIVERY_PROMOS.flatMap((p) => p.steps);
/** Шаги для текстов: ровный шаг — «1, 3, 5 и так до 29», иначе списком «2, 6 и 14» */
export const PROMO_STEPS_TEXT = (() => {
  const s = PROMO_STEPS;
  const last = s[s.length - 1];
  const even = s.length > 4 && s.every((n, i) => i === 0 || n - s[i - 1] === s[1] - s[0]);
  return even ? `${s[0]}, ${s[1]}, ${s[2]} и так до ${last}` : `${s.slice(0, -1).join(', ')} и ${last}`;
})();
/**
 * Задания партнёров на шагах CAMPAIGN.partnerStops (правка 02.11, вместо «площадки партнёра: видео и отзывы»).
 * Дошёл до коробки — открывается задание партнёра; выполнять не обязательно; выполнил — участвует в розыгрыше призов партнёра.
 * ЗАПОЛНИТЬ: партнёр на каждом шаге, текст задания и приз. Пока у всех один партнёр-заглушка, задания и приза нет (null)
 */
// task — текст задания, prize — что разыгрывает партнёр («Корзина фермерских продуктов»), url — где выполнить; null — пока неизвестно
export const PARTNER_TASKS = Object.fromEntries(CAMPAIGN.partnerStops.map((n) => [n, { partner: 'С родной земли', task: null, prize: null, url: null }]));
/** Шаги с заданиями партнёров для текстов: «4, 8, 12, 16, 24 и 28» */
export const PARTNER_STEPS_TEXT = `${CAMPAIGN.partnerStops.slice(0, -1).join(', ')} и ${CAMPAIGN.partnerStops.at(-1)}`;
/** Подпись под коробками на гирлянде «Один круг», пока партнёр один на все шаги */
export const PARTNER_LABEL = PARTNER_TASKS[CAMPAIGN.partnerStops[0]].partner;

/** Приложение доставки «Торнадо»: там вводится промокод */
export const TORNADO_APP_URL = 'https://clck.ru/3ExQW2';

/**
 * Свой промокод за шаг (коды от Никиты, 29.10): в группе шагов одна скидка, но коды разные (группы — DELIVERY_PROMOS).
 * 30.10 коды в том же порядке сдвинуты с чётных шагов на нечётные (ЕЛКА была на 2-м — теперь на 1-м и т. д.).
 */
export const STEP_CODES = {
  1: 'ЕЛКА', 3: 'СНЕГ', 5: 'СНЕГОВИК', 7: 'ИГРУШКИ', 9: 'СНЕЖКИ',
  11: '27ГОД', 13: 'НОВЫЙГОД', 15: 'ОЛИВЬЕ', 17: 'САЛАТЫ', 19: 'ПРЯНИК', 21: 'ВОЛШЕБСТВО',
  23: 'БАРАШКА', 25: 'КОЗА', 27: 'СКАЗКА', 29: 'ВКУСНЯШКА',
};

/** Промокод (группа со скидкой) за шаг круга или undefined */
export function promoForStep(n) {
  return DELIVERY_PROMOS.find((p) => p.steps.includes(n));
}

/** Код за конкретный шаг: свой, а пока его нет — код группы */
export function codeForStep(n) {
  return STEP_CODES[n] ?? promoForStep(n)?.code;
}

/**
 * Во что обойдутся n шагов (правка 03.11): рубли — только для обычных покупок, а товары партнёров дают шаги отдельно,
 * поэтому сумма — верхняя граница. «покупки на 1 800 ₽, а с товарами партнёров — меньше: каждые 5 товаров дают ещё шаг»
 */
export function stepsCostText(n) {
  return `покупки на\u00a0${formatRub(n * CAMPAIGN.stepRub)}, а\u00a0с\u00a0товарами партнёров\u00a0— меньше: каждые ${CAMPAIGN.partnerItemsPerStep}\u00a0товаров дают ещё шаг`;
}

/** Следующая веха после текущего шага: 10, 20 или 30 */
export function nextMilestone(step) {
  return step < 10 ? 10 : step < 20 ? 20 : 30;
}

const MONTH_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTH_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

/**
 * Недели акции с датами для графика «Акция в цифрах» (правка 02.11: вместо номеров 1–8 — периоды).
 * days — «16–22», months — «ноя» или «ноя–дек» (две строки под столбиком), full — «16–22 ноября» или «30 ноя – 6 дек» (одной строкой на телефоне)
 */
export const CAMPAIGN_WEEKS = (() => {
  const start = new Date(`${CAMPAIGN.start}T00:00:00`);
  const end = new Date(`${CAMPAIGN.end}T00:00:00`);
  const count = Math.round((end - start) / 86400000 / 7);
  return Array.from({ length: count }, (_, i) => {
    const a = new Date(start);
    a.setDate(a.getDate() + i * 7);
    const b = new Date(a);
    b.setDate(b.getDate() + 6);
    const same = a.getMonth() === b.getMonth();
    return {
      days: `${a.getDate()}–${b.getDate()}`,
      months: same ? MONTH_SHORT[a.getMonth()] : `${MONTH_SHORT[a.getMonth()]}–${MONTH_SHORT[b.getMonth()]}`,
      full: same ? `${a.getDate()}–${b.getDate()} ${MONTH_GEN[a.getMonth()]}` : `${a.getDate()} ${MONTH_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTH_SHORT[b.getMonth()]}`,
      aria: same ? `${a.getDate()}–${b.getDate()} ${MONTH_GEN[a.getMonth()]}` : `${a.getDate()} ${MONTH_GEN[a.getMonth()]} – ${b.getDate()} ${MONTH_GEN[b.getMonth()]}`,
    };
  });
})();
