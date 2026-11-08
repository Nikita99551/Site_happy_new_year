/**
 * Партнёры (поставщики) акции. Данные — partners.data.js: его пишет скрипт
 * `скрипты/партнёры/генератор-партнёров-сайта.py` из `поставщики/готово/партнёры-для-сайта.json`.
 *
 * @typedef {{ src: string, w: number, h: number }} Img
 * @typedef {{ key: string, title: string, weight: string, img: Img | null, isNew: boolean, photo: boolean }} PartnerProduct  // photo — фото без вырезки фона
 * @typedef {{ value: string, label: string }} PartnerFact
 * @typedef {{
 *   slug: string,            // адрес страницы: /partner/<slug>
 *   title: string,           // бренд с упаковки («Сальников», «Помидорка и 6 соток»)
 *   company: string,         // кто поставщик («Компания «Сальников»»)
 *   logos: Img[],            // логотипы брендов; пусто — показываем название текстом
 *   about: string[],         // абзацы «О компании» (только присланное поставщиком); пусто — блока нет
 *   facts: PartnerFact[],    // цифры у «О компании»
 *   site: string | null,     // сайт производителя
 *   hero: string | null,     // key товара для большого фото на первом экране
 *   products: PartnerProduct[],
 * }} Partner
 */
export {};
