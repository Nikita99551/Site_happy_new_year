import { SoonLink } from '@/shared/ui/soon-link/SoonLink';

const d = (ms) => ({ '--d': `${ms}ms` });

const RULES = [
  { title: <>Не более 5&nbsp;чеков в&nbsp;день</>, text: <>Каждый чек&nbsp;— от&nbsp;600&nbsp;₽, регистрируется один раз. Один номер телефона&nbsp;— один участник.</>, num: '5', unit: 'чеков в день' },
  { title: <>Чек&nbsp;— на&nbsp;кассе, КСО или на&nbsp;сайте</>, text: <>Назовите номер телефона: 10&nbsp;цифр, без&nbsp;8 и&nbsp;+7. На&nbsp;кассе самообслуживания введите его сами.</>, num: '10', unit: 'цифр телефона' },
  { title: <>Храните чеки до&nbsp;24&nbsp;января</>, text: <>Организатор может запросить оригинал чека для проверки до&nbsp;конца акции&nbsp;— 24&nbsp;января 2027&nbsp;года.</>, num: '24.01', unit: 'храните до' },
  { title: <>Розыгрыши&nbsp;— по&nbsp;вторникам</>, text: <>7&nbsp;еженедельных розыгрышей по&nbsp;5&nbsp;призов: 24.11, 01.12, 08.12, 15.12, 22.12, 29.12 и&nbsp;05.01. Финал с&nbsp;суперпризами&nbsp;— 12&nbsp;января.</>, num: '7×5', unit: 'недель × призов' },
  { title: <>Участвуют с&nbsp;18&nbsp;лет</>, text: <>Участники&nbsp;— жители России от&nbsp;18&nbsp;лет. Сотрудники Аникс и&nbsp;те, кто готовит акцию, не&nbsp;участвуют.</>, num: '18+', unit: 'лет и старше' },
];

const IconReceipt = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z" /><path d="M9 8h6M9 12h6" /></svg>;
const IconClock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><circle cx={12} cy={12} r={9} /><path d="M12 7v5l3 2" /></svg>;
const IconPin = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M12 22s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" /><circle cx={12} cy={10} r={2.6} /></svg>;
const IconShield = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5.5-3.5 9.5-8 11-4.5-1.5-8-5.5-8-11V5z" /><path d="M9 12l2 2 4-5" /></svg>;

const TAGS = [
  { icon: <IconReceipt />, title: <>Ваш телефон&nbsp;— на&nbsp;чеке</>, text: <>Если чек зарегистрирован, на&nbsp;нём будет напечатан ваш номер телефона.</> },
  { icon: <IconClock />, title: <>Шаги могут прийти не&nbsp;сразу</>, text: <>Сразу после покупки чек бывает в&nbsp;обработке. Шаги появятся, как только он обработается.</> },
  { icon: <IconPin />, title: <>Выберите свой магазин</>, text: <>В&nbsp;нём вы получите приз и&nbsp;сможете вступить в&nbsp;чат своего магазина.</> },
  { icon: <IconShield />, title: <>Победителей проверяют</>, text: <>Организатор проверяет чеки и&nbsp;может запросить оригинал чека и&nbsp;документы победителя.</> },
];

/** Секция «Что важно знать»: пять правил-строк и четыре бирки */
export function ImportantRules() {
  return (
    <section className="section section--green torn-top rules on-dark" id="important">
      <div className="container">
        <div className="section-head reveal">
          <span className="ribbon">Правила</span>
          <h2>Что важно знать</h2>
          <p className="lead">Девять правил, которые стоит запомнить. Полный текст правил&nbsp;— <SoonLink className="link" style={{ color: '#e2b24a' }}>на&nbsp;отдельной странице</SoonLink>.</p>
        </div>
        {/* На компьютере правила в две колонки, чтобы блок помещался в экран (правка 27.10) */}
        <div className="rules__list">
          {RULES.map((r, i) => (
            <div key={r.num} className="rule reveal" style={d(i * 60)}>
              <div><b>{r.title}</b><p>{r.text}</p></div>
              <div className="rule__val"><span className="num">{r.num}</span><small>{r.unit}</small></div>
            </div>
          ))}
        </div>
        <div className="tags">
          {TAGS.map((t, i) => (
            <div key={i} className="tag-card reveal" style={d(i * 70)}>
              <span className="tag-card__hole" /><span className="tag-card__ic">{t.icon}</span><b>{t.title}</b><p>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
