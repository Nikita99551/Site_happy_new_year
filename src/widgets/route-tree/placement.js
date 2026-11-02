/**
 * Расстановка подписей на ёлке (правка 02.11): «Вы здесь» у текущего шага и купоны промокодов — в свободные места,
 * не на подписи «Розыгрыш · Сертификат», «Старт», коробки партнёров и соседние шары.
 * Без React и псевдонимов путей: проверку всех шагов можно гонять в Node.
 */

/** Прямоугольник по центру и размерам: [лево, верх, право, низ] */
export const box = (x, y, w, h) => [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
export const overlaps = (a, b, pad = 0) => a[0] < b[2] + pad && b[0] < a[2] + pad && a[1] < b[3] + pad && b[1] < a[3] + pad;
/** Площадь пересечения: когда свободного места нет, выбираем место, где наложение меньше всего */
const area = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));

export const isGiftStep = (n) => n === 10 || n === 20;

/** Шар без подписей: круг (текущий крупнее) или подарок 10/20, и ушко с ниткой сверху — отдельно, оно тонкое */
export function ballParts(n, cx, cy, k, step) {
  const body = isGiftStep(n) ? box(cx, cy + 4 * k, 70 * k, 70 * k) : box(cx, cy, (n === step ? 72 : 60) * k, (n === step ? 72 : 60) * k);
  return [body, box(cx, cy - 36 * k, 12 * k, 16 * k)];
}
/** Купон повёрнут на −14°: занимает рамку чуть больше своих 46×34 */
export const couponBox = (x, y, k) => box(x, y, 52 * k, 42 * k);
/** Коробка партнёра справа снизу от шара */
export const partnerBox = (cx, cy, k) => box(cx + 26 * k, cy + 26 * k, 40 * k, 40 * k);
/** Подпись «Розыгрыш · Сертификат» под подарком и «Старт» */
export const giftLabelBox = (tg, cx, cy) => box(cx, cy + tg.gift.dy, tg.gift.w, tg.gift.fs * 2.95);
export const startBox = (tg) => box(tg.start.x, tg.start.y, tg.start.w, tg.start.fs * 2.15);

/** Подписи и коробки — их нельзя задевать совсем */
function solidBusy(tg, k, partnerStops) {
  const out = [startBox(tg)];
  for (const [n, x, y] of tg.balls) {
    if (partnerStops.includes(n)) out.push(partnerBox(x, y, k));
    if (isGiftStep(n)) out.push(giftLabelBox(tg, x, y));
  }
  return out;
}

/**
 * «Вы здесь» у текущего шага: под шаром; если там коробка партнёра — левее неё; если подпись соседнего подарка или «Старт» —
 * со сдвигом вбок, ниже или над ушком шара.
 * @returns {{ x: number, y: number, box: number[] } | null}
 */
export function placeHere(tg, k, partnerStops, step) {
  const ball = tg.balls.find(([n]) => n === step);
  if (!ball || isGiftStep(step) || step >= 30) return null;
  const [, cx, cy] = ball;
  const h = tg.here.fs * 2.15;
  const w = tg.here.w;
  const solid = solidBusy(tg, k, partnerStops);
  const balls = tg.balls.filter(([n]) => n !== step).flatMap(([n, x, y]) => ballParts(n, x, y, k, step));
  // Свой шар: плашка может касаться низа шара (так задумано на телефоне), но не закрывать его и не стоять на ушке
  const own = [box(cx, cy, 60 * k, 60 * k), box(cx, cy - 36 * k, 12 * k, 16 * k)];
  const below = cy + tg.here.dy;
  const top = cy - 44 * k - h / 2 - 4 * k;
  const side = w / 2 - 4 * k;
  const spots = [
    [cx, below],
    [cx + 3 * k - w / 2, below], // левее коробки партнёра (она справа снизу от шара)
    [cx - side, below],
    [cx + side, below],
    [cx, below + h * 0.55],
    [cx, top],
    [cx - side, top],
    [cx + side, top],
  ];
  const fits = ([x, y]) => {
    const b = box(x, y, w, h);
    return !solid.some((s) => overlaps(b, s, 1 * k)) && !balls.some((s) => overlaps(b, s)) && !own.some((s) => overlaps(b, s));
  };
  const cost = ([x, y]) => {
    const b = box(x, y, w, h);
    return solid.reduce((s, o) => s + 10 * area(b, o), 0) + [...balls, ...own].reduce((s, o) => s + area(b, o), 0);
  };
  const [x, y] = spots.find(fits) ?? spots.reduce((a, c) => (cost(c) < cost(a) ? c : a));
  return { x, y, box: box(x, y, w, h) };
}

/**
 * Купон у каждого шага с промокодом: первое свободное место у шара — слева снизу, справа снизу, сбоку чуть выше, сверху по углам,
 * сбоку посередине, ровно под шаром, над ушком, выше по диагонали. Не на подписях, коробках, «Вы здесь», других купонах
 * и соседних шарах; если места нет совсем (верх ёлки на телефоне) — где наложение меньше, подписи важнее шаров.
 * @param {(n: number) => boolean} hasPromo — есть ли промокод у шага
 * @returns {[number, number, number][]} [шаг, x, y] центра купона
 */
export function placeCoupons(tg, k, partnerStops, step, here, hasPromo) {
  const solid = solidBusy(tg, k, partnerStops);
  for (const [n, x, y] of tg.balls) if (isGiftStep(n)) solid.push(box(x, y + 4 * k, 70 * k, 70 * k));
  if (here) solid.push(here.box);
  const spots = [[-32, 28], [32, 28], [36, 18], [-36, 18], [-40, -24], [40, -24], [54, -4], [-54, -4], [0, 54], [0, -70], [-58, -50], [58, -50]];
  const out = [];
  for (const [n, cx, cy] of tg.balls) {
    if (!hasPromo(n)) continue;
    const near = tg.balls.filter(([m]) => m !== n).flatMap(([m, x, y]) => ballParts(m, x, y, k, step));
    const at = spots.map(([dx, dy]) => [cx + dx * k, cy + dy * k]);
    const fits = ([x, y]) => !solid.some((s) => overlaps(couponBox(x, y, k), s, 2 * k)) && !near.some((s) => overlaps(couponBox(x, y, k), s, 1 * k));
    const cost = ([x, y]) => solid.reduce((s, o) => s + 10 * area(couponBox(x, y, k), o), 0) + near.reduce((s, o) => s + area(couponBox(x, y, k), o), 0);
    const free = at.find(fits) ?? at.reduce((a, c) => (cost(c) < cost(a) ? c : a));
    solid.push(couponBox(free[0], free[1], k));
    out.push([n, free[0], free[1]]);
  }
  return out;
}
