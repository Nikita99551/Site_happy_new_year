/**
 * Призы акции: суперпризы финала (п. 9.2 правил) и еженедельные призы по неделям.
 * @typedef {Object} Prize
 * @property {string} id
 * @property {string} title
 * @property {string} [model] — Бренд и модель мельче под названием (еженедельные призы: крупно «Аэрогриль», ниже «Kitfort КТ‑2250»)
 * @property {string} [note] — Подпись под названием: дата розыгрыша
 * @property {string} image
 * @property {string} alt
 * @property {boolean} [cutout] — Картинка — вырезка на прозрачном фоне: показывается целиком, на светлой подложке
 */

/**
 * Суперпризы финала 12 января, кроме сертификата на 250 000 ₽ на курорт «Манжерок» (у него свой блок на «Подарках»). Картинки — вырезки
 * из макета Figma (страница «НОВЫЙ ГОД Сайт», над секцией «суперприза в финале»), цвет не указываем.
 */
export const FINAL_PRIZES = [
  { id: 'iphone', title: 'Смартфон', model: 'Apple iPhone 18 Pro 256 ГБ', image: '/img/final-iphone.webp', alt: 'Смартфон Apple iPhone 18 Pro', cutout: true },
  { id: 'dyson', title: 'Мультистайлер', model: 'Dyson Airwrap Co‑anda 2x HS09', image: '/img/final-dyson.webp', alt: 'Мультистайлер Dyson Airwrap Co-anda 2x HS09 с насадками', cutout: true },
  { id: 'tv', title: 'Телевизор', model: 'Xiaomi TV A Pro 65 2026, 65″ (163 см)', image: '/img/final-tv-xiaomi.webp', alt: 'Телевизор Xiaomi TV A Pro 65 дюймов', cutout: true },
  { id: 'ps5', title: 'Игровая консоль', model: 'PlayStation 5 Slim', image: '/img/final-ps5.webp', alt: 'Игровая консоль PlayStation 5 Slim с геймпадом', cutout: true },
];

/**
 * Еженедельные призы по неделям: в каждом розыгрыше 5 победителей (п. 8.2 правил). Картинки — вырезки на прозрачном фоне,
 * носят иллюстративный характер (цвет не указываем). Источники — `призы-еженедельные/` рядом с сайтом, макет Figma 3410:5182.
 */
export const WEEKLY_PRIZES = [
  { id: 'w1', title: 'Умная колонка', model: 'Яндекс Станция Лайт 2', note: 'Розыгрыш 24 ноября', image: '/img/prize-w1-yandex-station.webp', alt: 'Умная колонка Яндекс Станция Лайт 2', cutout: true },
  { id: 'w2', title: 'Аэрогриль', model: 'Kitfort КТ‑2250', note: 'Розыгрыш 1 декабря', image: '/img/prize-w2-airfryer-kitfort.webp', alt: 'Аэрогриль Kitfort КТ-2250', cutout: true },
  { id: 'w3', title: 'Гриль', model: 'Tefal Optigrill+ GC712834', note: 'Розыгрыш 8 декабря', image: '/img/prize-w3-grill-tefal.webp', alt: 'Гриль Tefal Optigrill+ GC712834', cutout: true },
  { id: 'w4', title: 'Рожковая кофеварка', model: 'DeLonghi Dedica EC 685', note: 'Розыгрыш 15 декабря', image: '/img/prize-w4-coffee-delonghi.webp', alt: 'Рожковая кофеварка DeLonghi Dedica EC 685', cutout: true },
  { id: 'w5', title: 'Отпариватель', model: 'Kitfort КТ‑937', note: 'Розыгрыш 22 декабря', image: '/img/prize-w5-steamer-kitfort.webp', alt: 'Отпариватель Kitfort КТ-937', cutout: true },
  { id: 'w6', title: 'Моющий пылесос', model: 'Polaris PVCW 5070', note: 'Розыгрыш 29 декабря', image: '/img/prize-w6-vacuum-polaris.webp', alt: 'Моющий пылесос Polaris PVCW 5070', cutout: true },
  { id: 'w7', title: 'Робот‑пылесос', model: 'Dreame D20 Pro', note: 'Розыгрыш 5 января', image: '/img/prize-w7-robot-dreame.webp', alt: 'Робот-пылесос Dreame D20 Pro', cutout: true },
];
