export type PrizeKind = 'washer' | 'tv' | 'fridge' | 'phone' | 'console' | 'vacuum';

export interface Winner {
  name: string;
  store: string;
  ticket: string;
  prize: string;
  kind: PrizeKind;
}

/**
 * Победители прошлой акции (прислал Никита 24.10.2026). Имя и первая буква фамилии — полные данные на сайт не выводим.
 * У шестого победителя имя не указано. Номер — номер билета участника.
 */
export const WINNERS: Winner[] = [
  { name: 'Александр Б.', store: 'Аникс «Христенко»', ticket: '161', prize: 'Стиральная машина', kind: 'washer' },
  { name: 'Елена Ч.', store: 'Аникс «Оптимал 4»', ticket: '173', prize: 'Телевизор', kind: 'tv' },
  { name: 'Раиса Т.', store: 'Аникс «Матросова»', ticket: '444', prize: 'Холодильник', kind: 'fridge' },
  { name: 'Елена Ч.', store: 'Аникс «Усть-Кокса»', ticket: '227', prize: 'iPhone 16', kind: 'phone' },
  { name: 'Вера К.', store: 'Аникс «Кулунда 2»', ticket: '482', prize: 'Игровая консоль', kind: 'console' },
  { name: 'Покупатель Аникс', store: 'Аникс «Оптимал 5»', ticket: '404', prize: 'Пылесос Dyson', kind: 'vacuum' },
];
