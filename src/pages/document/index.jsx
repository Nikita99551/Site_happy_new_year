import { CONSENT } from './data/consent';
import { RULES } from './data/rules';
import { DocumentPage } from './ui/DocumentPage';

export function RulesPage() {
  return <DocumentPage doc={RULES} title="Правила проведения акции · Новогодняя акция Аникс 2027" />;
}

export function PolicyPage() {
  return <DocumentPage doc={CONSENT} title="Согласие на обработку персональных данных · Новогодняя акция Аникс 2027" />;
}
