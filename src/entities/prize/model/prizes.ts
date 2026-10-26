/** Призы акции: еженедельные — примеры (состав публикуется перед каждой неделей). */
export interface Prize {
  id: string;
  title: string;
  /** Подпись под названием: модель или «пример приза» */
  note: string;
  image: string;
  alt: string;
}

/** Примеры еженедельных призов (до 15 000 ₽) */
export const WEEKLY_PRIZES: Prize[] = [
  { id: 'kettle', title: 'Чайник', note: 'пример приза', image: '/img/prize-kettle.webp', alt: 'Чайник' },
  { id: 'blender', title: 'Блендер', note: 'пример приза', image: '/img/prize-blender.webp', alt: 'Блендер' },
  { id: 'headphones', title: 'Наушники', note: 'пример приза', image: '/img/prize-headphones.webp', alt: 'Наушники' },
  { id: 'speaker', title: 'Колонка', note: 'пример приза', image: '/img/prize-speaker.webp', alt: 'Колонка' },
  { id: 'iron', title: 'Утюг', note: 'пример приза', image: '/img/prize-iron.webp', alt: 'Утюг' },
];

export const WEEKLY_PRIZE_PRICE = 'до 15 000 ₽';
