/** Призы акции: еженедельные — примеры (состав публикуется перед каждой неделей). */
export interface Prize {
  id: string;
  title: string;
  /** Бренд и модель мельче под названием (еженедельные призы: крупно «Аэрогриль», ниже «Kitfort КТ‑2250») */
  model?: string;
  /** Подпись под названием: модель или дата розыгрыша */
  note: string;
  image: string;
  alt: string;
  /** Картинка — вырезка на прозрачном фоне: показывается целиком, на светлой подложке */
  cutout?: boolean;
}

/**
 * Еженедельные призы по неделям: в каждом розыгрыше 5 победителей (п. 8.2 правил). Картинки — вырезки на прозрачном фоне,
 * носят иллюстративный характер (цвет не указываем). Источники — `призы-еженедельные/` рядом с сайтом, макет Figma 3410:5182.
 */
export const WEEKLY_PRIZES: Prize[] = [
  { id: 'w1', title: 'Умная колонка', model: 'Яндекс Станция Лайт 2', note: 'Розыгрыш 24 ноября', image: '/img/prize-w1-yandex-station.webp', alt: 'Умная колонка Яндекс Станция Лайт 2', cutout: true },
  { id: 'w2', title: 'Аэрогриль', model: 'Kitfort КТ‑2250', note: 'Розыгрыш 1 декабря', image: '/img/prize-w2-airfryer-kitfort.webp', alt: 'Аэрогриль Kitfort КТ-2250', cutout: true },
  { id: 'w3', title: 'Гриль', model: 'Tefal Optigrill+ GC712834', note: 'Розыгрыш 8 декабря', image: '/img/prize-w3-grill-tefal.webp', alt: 'Гриль Tefal Optigrill+ GC712834', cutout: true },
  { id: 'w4', title: 'Рожковая кофеварка', model: 'DeLonghi Dedica EC 685', note: 'Розыгрыш 15 декабря', image: '/img/prize-w4-coffee-delonghi.webp', alt: 'Рожковая кофеварка DeLonghi Dedica EC 685', cutout: true },
  { id: 'w5', title: 'Отпариватель', model: 'Kitfort КТ‑937', note: 'Розыгрыш 22 декабря', image: '/img/prize-w5-steamer-kitfort.webp', alt: 'Отпариватель Kitfort КТ-937', cutout: true },
  { id: 'w6', title: 'Моющий пылесос', model: 'Polaris PVCW 5070', note: 'Розыгрыш 29 декабря', image: '/img/prize-w6-vacuum-polaris.webp', alt: 'Моющий пылесос Polaris PVCW 5070', cutout: true },
  { id: 'w7', title: 'Робот‑пылесос', model: 'Dreame D20 Pro', note: 'Розыгрыш 5 января', image: '/img/prize-w7-robot-dreame.webp', alt: 'Робот-пылесос Dreame D20 Pro', cutout: true },
];
