import { PARTNERS } from './model/partners.data';

export { PARTNERS };
export { PartnerLogo } from './ui/PartnerLogo';

/** Адрес страницы партнёра */
export const partnerPath = (slug) => `/partner/${slug}`;

/** Партнёр по адресу страницы или undefined */
export const getPartner = (slug) => PARTNERS.find((p) => p.slug === slug);
