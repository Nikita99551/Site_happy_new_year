import { CONSENT } from './data/consent';
import { PRIVACY } from './data/privacy';
import { PUBLISH } from './data/publish';
import { RULES } from './data/rules';
import { DocumentPage } from './ui/DocumentPage';

export function RulesPage() {
  return <DocumentPage doc={RULES} title="Правила проведения акции · Новогодняя акция Аникс 2027" />;
}

export function PolicyPage() {
  return <DocumentPage doc={CONSENT} title="Согласие на обработку персональных данных · Новогодняя акция Аникс 2027" />;
}

/** Политика обработки ПДн (правила, вариант 3, п. 14.5): должна открываться со страницы, где собирают данные — ссылка в подвале */
export function PrivacyPage() {
  return <DocumentPage doc={PRIVACY} title="Политика обработки персональных данных · Новогодняя акция Аникс 2027" />;
}

/** Согласие на распространение ПДн (п. 7.4 согласия): текст доступен по отдельной ссылке до галочки — ссылка в третьей галочке регистрации */
export function PublishConsentPage() {
  return <DocumentPage doc={PUBLISH} title="Согласие на распространение персональных данных · Новогодняя акция Аникс 2027" />;
}
