/** Геометрия ёлки из утверждённого макета Figma (860×1260). */

/** Координаты шаров [индекс, cx, cy]. Путь идёт СНИЗУ ВВЕРХ: первый элемент — позиция шага 29 у верхушки, последний — шага 1 у подножия (шаг = 30 − индекс). */
export const BALLS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 345, 300], [2, 430, 300], [3, 515, 300], [4, 590, 420], [5, 480, 420], [6, 370, 420], [7, 260, 420],
  [8, 270, 600], [9, 350, 600], [10, 430, 600], [11, 510, 600], [12, 590, 600], [13, 660, 730], [14, 545, 730], [15, 430, 730], [16, 315, 730], [17, 200, 730],
  [18, 215, 910], [19, 301, 910], [20, 387, 910], [21, 473, 910], [22, 559, 910], [23, 645, 910], [24, 760, 1040], [25, 628, 1040], [26, 496, 1040], [27, 364, 1040], [28, 232, 1040], [29, 100, 1040],
];

export const TIERS = [
  { x: 200, y: 140, d: 'M 230 0 L 460 330 C 306.7 352.7 153.3 352.7 0 330 Z', fill: '#163c2a' },
  { x: 100, y: 360, d: 'M 330 0 L 660 430 C 440 452.7 220 452.7 0 430 Z', fill: '#1a4430' },
  { x: 10, y: 660, d: 'M 420 0 L 840 450 C 560 472.7 280 472.7 0 450 Z', fill: '#1e4a31' },
] as const;

export const GLINTS = [
  { x: 303.5, y: 140, d: 'M 126.5 0 L 0 324 C 38.3 333.3 74.4 339.3 108.1 342 Z' },
  { x: 248.5, y: 360, d: 'M 181.5 0 L 0 424 C 55 433.3 106.7 439.3 155.1 442 Z' },
  { x: 199, y: 660, d: 'M 231 0 L 0 444 C 70 453.3 135.8 459.3 197.4 462 Z' },
] as const;

export const GARLAND = 'M 430 150 C 401.7 227.3 373.3 266 345 266 C 373.3 280.7 401.7 280.7 430 266 C 458.3 280.7 486.7 280.7 515 266 C 540 346 565 386 590 386 C 553.3 400.7 516.7 400.7 480 386 C 443.3 400.7 406.7 400.7 370 386 C 333.3 400.7 296.7 400.7 260 386 C 263.3 506 266.7 566 270 566 C 296.7 580.7 323.3 580.7 350 566 C 376.7 580.7 403.3 580.7 430 566 C 456.7 580.7 483.3 580.7 510 566 C 536.7 580.7 563.3 580.7 590 566 C 613.3 652.7 636.7 696 660 696 C 621.7 710.7 583.3 710.7 545 696 C 506.7 710.7 468.3 710.7 430 696 C 391.7 710.7 353.3 710.7 315 696 C 276.7 710.7 238.3 710.7 200 696 C 205 816 210 876 215 876 C 243.7 890.7 272.3 890.7 301 876 C 329.7 890.7 358.3 890.7 387 876 C 415.7 890.7 444.3 890.7 473 876 C 501.7 890.7 530.3 890.7 559 876 C 587.7 890.7 616.3 890.7 645 876 C 683.3 962.7 721.7 1006 760 1006 C 716 1020.7 672 1020.7 628 1006 C 584 1020.7 540 1020.7 496 1006 C 452 1020.7 408 1020.7 364 1006 C 320 1020.7 276 1020.7 232 1006 C 188 1020.7 144 1020.7 100 1006';

/** Всё, что нужно ёлке для рисования: шары, ярусы, гирлянда, подписи. Две версии — макет (компьютер) и вытянутая для телефона. */
export interface TreeGeo {
  w: number;
  h: number;
  /** [шаг, cx, cy] */
  balls: ReadonlyArray<readonly [number, number, number]>;
  /** Ярусы сверху вниз; x, y — сдвиг пути */
  tiers: ReadonlyArray<{ x: number; y: number; d: string; fill: string }>;
  glints: ReadonlyArray<{ x: number; y: number; d: string }>;
  garland: string;
  /** Масштаб шаров, цифр и значков относительно макета */
  k: number;
  star: { x: number; y: number; r: number; fs: number };
  finish: { x: number; y: number; w: number; fs: number };
  start: { x: number; y: number; w: number; fs: number };
  trunk: { x: number; y: number; w: number; h: number };
  snow: { cx: number; cy: number; rx: number; ry: number };
  /** Подписи под подарком и «Вы здесь»: шрифт, ширина, отступ вниз от центра шара */
  gift: { fs: number; w: number; dy: number };
  here: { fs: number; w: number; dy: number };
}

/** Ёлка из макета Figma 860×1260 (компьютер и планшет) */
export const DESKTOP_TREE: TreeGeo = {
  w: 860,
  h: 1260,
  balls: BALLS.map(([idx, cx, cy]) => [30 - idx, cx, cy] as const),
  tiers: TIERS,
  glints: GLINTS,
  garland: GARLAND,
  k: 1,
  star: { x: 430, y: 80, r: 58, fs: 30 },
  finish: { x: 600, y: 80, w: 190, fs: 24 },
  start: { x: 110, y: 1105, w: 130, fs: 20 },
  trunk: { x: 387, y: 1100, w: 86, h: 80 },
  snow: { cx: 430, cy: 1195, rx: 280, ry: 27 },
  gift: { fs: 20, w: 220, dy: 72 },
  here: { fs: 14, w: 96, dy: 62 },
};

/**
 * Ёлка для телефона (правка 24.10): вытянута вверх, 6 ярусов по 3 + 2 шара (верхний ярус 3 + 1), поэтому шары и цифры
 * в 1,7 раза крупнее, чем в макете. Путь — змейкой снизу вверх: нижний ряд яруса слева направо, верхний справа налево.
 */
function buildMobileTree(): TreeGeo {
  const cx = 430;
  const fills = ['#1e4a31', '#1a4430', '#163c2a'];
  const rows: [number, number, number][] = [];
  const tiers: { x: number; y: number; d: string; fill: string }[] = [];
  const glints: { x: number; y: number; d: string }[] = [];
  let n = 1;
  for (let t = 0; t < 6; t++) {
    // Между рядами яруса 190: под подарком помещается подпись «Розыгрыш · Сертификат …», не задевая шары ниже
    const yL = 520 + (5 - t) * 370;
    const yU = yL - 190;
    const s = 200 - 12 * t;
    const apex = yU - 220;
    const bottom = yL + 90;
    const hb = s + 140;
    for (let j = -1; j <= 1; j++) rows.push([n++, cx + j * s, yL]);
    const upper = t === 5 ? [0] : [s / 2, -s / 2];
    for (const dx of upper) rows.push([n++, cx + dx, yU]);
    tiers.unshift({ x: 0, y: 0, d: `M ${cx} ${apex} L ${cx + hb} ${bottom} C ${cx + hb / 3} ${bottom + 26} ${cx - hb / 3} ${bottom + 26} ${cx - hb} ${bottom} Z`, fill: fills[t % 3] });
    glints.unshift({ x: 0, y: 0, d: `M ${cx} ${apex} L ${cx - hb * 0.42} ${bottom + 12} L ${cx - hb * 0.12} ${bottom + 20} Z` });
  }
  // Гирлянда: провисающие дуги между соседями в ряду, плавный подъём на следующий ряд, от 29‑го шага к звезде
  const pts = rows.map(([, x, y]) => [x, y - 44] as const);
  let garland = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    garland += ay === by ? ` Q ${(ax + bx) / 2} ${ay + 34} ${bx} ${by}` : ` C ${ax} ${ay - 60} ${bx} ${by + 60} ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  garland += ` L ${cx} ${last[1] - 110}`;
  return {
    w: 860,
    h: 2620,
    balls: rows,
    tiers,
    glints,
    garland,
    k: 1.67,
    star: { x: cx, y: 120, r: 82, fs: 42 },
    finish: { x: 690, y: 120, w: 250, fs: 32 },
    start: { x: 140, y: 2500, w: 190, fs: 30 },
    trunk: { x: 378, y: 2450, w: 104, h: 100 },
    snow: { cx, cy: 2570, rx: 310, ry: 32 },
    gift: { fs: 22, w: 252, dy: 93 },
    here: { fs: 24, w: 160, dy: 80 },
  };
}

export const MOBILE_TREE: TreeGeo = buildMobileTree();
