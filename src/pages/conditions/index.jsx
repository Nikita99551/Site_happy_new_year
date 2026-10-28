import { Link } from 'react-router-dom';
import { SoonLink } from '@/shared/ui/soon-link/SoonLink';
import { OpenModalButton } from '@/features/modal';
import { CAMPAIGN, DELIVERY_PROMOS } from '@/shared/config/campaign';
import { formatRub, plural } from '@/shared/lib/text';
import { IconBox, IconClose, IconCoupon, IconCrate } from '@/shared/ui/icons/Icons';
import { StepGarland, StepRow } from '@/shared/ui/lights';
import { CtaBanner } from '@/widgets/cta-banner/CtaBanner';
import { PageLayout } from '@/widgets/page-layout/PageLayout';
import { StopsMap } from './ui/StopsMap';
import { ImportantRules } from './ui/ImportantRules';
import './ConditionsPage.scss';

/** Вехи круга: подписи под гирляндой «Один круг — 30 шагов» */
const MILESTONES = [
  { n: 10, title: <>10‑й шаг</>, text: <>Розыгрыш сертификата Аникс на&nbsp;1&nbsp;500&nbsp;₽: получит каждый 30‑й</> },
  { n: 20, title: <>20‑й шаг</>, text: <>Розыгрыш сертификата Аникс на&nbsp;3&nbsp;000&nbsp;₽: получит каждый 100‑й</> },
  { n: 30, title: <>30‑й шаг&nbsp;— финиш</>, text: <>Билет на&nbsp;розыгрыш и&nbsp;новый круг</> },
];

const d = (ms) => ({ '--d': `${ms}ms` });

/** Примеры чеков в блоке «По сумме чека»: диапазон, шаги, отступ сверху (лесенка, как в макете) */
const RECEIPT_EXAMPLES = [
  { range: '600–1 199 ₽', steps: 1, pad: 0 },
  { range: '1 200–1 799 ₽', steps: 2, pad: 46 },
  { range: '1 800–2 399 ₽', steps: 3, pad: 66 },
];

const Boxes = ({ n }) => <div className="boxes-card__row">{Array.from({ length: n }, (_, i) => <IconBox key={i} />)}</div>;
const Dots = ({ n }) => <div className={`dots dots--${n}`} aria-hidden="true">{Array.from({ length: n }, (_, i) => <i key={i} />)}</div>;

export default function ConditionsPage() {
  return (
    <PageLayout title="Условия акции · Новогодняя акция Аникс 2027">
      {/* ===== Вступление ===== */}
      <section className="section section--cream cond-hero">
        <img className="cond-hero__goat reveal" src="/img/goat-scroll.webp" alt="" width={330} height={690} />
        <img className="cond-hero__branch" src="/img/branch.webp" alt="" width={180} height={193} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="ribbon reveal">«Год козы — лови призы»</span>
          <h1 className="reveal" style={d(60)}>Условия новогодней акции</h1>
          <p className="lead reveal" style={d(120)}>Покупайте, регистрируйте чеки и&nbsp;проходите круг из&nbsp;30&nbsp;шагов.</p>
          <div className="facts reveal" style={d(200)}>
            <div className="fact"><span className="num">16.11–10.01</span><small>покупки и&nbsp;чеки</small></div>
            <div className="fact"><span className="num num-red">600&nbsp;₽</span><small>= 1&nbsp;шаг</small></div>
            <div className="fact"><span className="num">30</span><small>шагов в&nbsp;одном круге</small></div>
            <div className="fact"><span className="num">5</span><small>чеков в&nbsp;день&nbsp;— максимум</small></div>
          </div>
        </div>
      </section>

      {/* ===== Как участвовать: маршрут из четырёх остановок ===== */}
      <section className="section section--white torn-top map-sec" id="how">
        <div className="container">
          <div className="section-head reveal">
            <span className="ribbon ribbon--green">Как участвовать</span>
            <h2>Маршрут из&nbsp;четырёх остановок</h2>
            <p className="lead">Регистрировать можно каждый чек от&nbsp;600&nbsp;₽.</p>
          </div>
          <StopsMap />
        </div>
      </section>

      {/* ===== Как начисляются шаги ===== */}
      <section className="section section--green torn-top calc on-dark" id="calc">
        <div className="container">
          <div className="section-head reveal">
            <span className="ribbon">Шаги</span>
            <h2>Как начисляются шаги</h2>
            <p className="lead">Шаги считаются по&nbsp;каждому чеку и&nbsp;складываются: по&nbsp;сумме обычных покупок и&nbsp;по&nbsp;числу товаров партнёров.</p>
          </div>
          <div className="calc__grid">
            <div className="reveal calc__sum">
              <h3>По сумме чека</h3>
              <div className="receipts">
                {RECEIPT_EXAMPLES.map((ex) => (
                  <div key={ex.range} className="mini-receipt-wrap">
                    <div className="mini-receipt" style={ex.pad ? { paddingTop: ex.pad } : undefined}>
                      <small>Чек на сумму</small><span className="num">{ex.range}</span>
                      <div className="mini-receipt__line" />
                      <div className="mini-receipt__bulbs">{Array.from({ length: ex.steps }, (_, i) => <i key={i} />)}</div>
                      <div className="mini-receipt__res">{ex.steps}&nbsp;{plural(ex.steps, 'шаг', 'шага', 'шагов')}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="calc__note calc__note--big">Каждые следующие полные 600&nbsp;₽&nbsp;— ещё один шаг.</p>
            </div>
            {/* Исключения отдельной плашкой: покупатель должен их заметить (правка 24.10). Отдельная колонка сетки:
                на ноутбуке под чеками, на Full HD — третьей колонкой (правка 27.10) */}
            <div className="reveal calc__ex" style={d(60)}>
              <div className="exclude">
                <span className="exclude__ic" aria-hidden="true"><IconClose /></span>
                <div>
                  <b>Не входят в&nbsp;сумму чека</b>
                  <ul className="exclude__list">
                    <li>Алкоголь</li>
                    <li>Табачные изделия</li>
                  </ul>
                  <p>Алкоголь и&nbsp;табачные изделия в&nbsp;акции не&nbsp;участвуют.</p>
                  {/* Товары партнёров тоже не входят в сумму, но дают свои шаги — это видно сразу, без чтения мелкого текста (правка 24.10) */}
                  <p className="exclude__partner"><IconCrate /><span><b>Товары партнёров</b> считаются отдельно: <em>5&nbsp;товаров = 1&nbsp;шаг</em></span></p>
                </div>
              </div>
            </div>
            <div className="reveal calc__partners" style={d(120)}>
              <h3>По товарам партнёров</h3>
              <div className="boxes-card"><Boxes n={5} /><div className="boxes-card__res"><span className="seal seal--red"><span className="num">1</span></span><br />1&nbsp;шаг</div><span className="boxes-card__label">5&nbsp;товаров</span></div>
              <div className="boxes-card"><Boxes n={10} /><div className="boxes-card__res"><span className="seal seal--red"><span className="num">2</span></span><br />2&nbsp;шага</div><span className="boxes-card__label">10&nbsp;товаров</span></div>
              <p className="calc__note">Цена этих товаров не&nbsp;важна: они считаются отдельно от&nbsp;суммы чека. Партнёры акции&nbsp;— <Link className="link" style={{ color: '#e2b24a' }} to="/#partners">на&nbsp;главной странице</Link>.</p>
            </div>
          </div>
          <div className="no-sum reveal">
            <div><b>Шаги в&nbsp;одном чеке складываются</b><p>Обычные товары дают шаги по&nbsp;сумме, товары партнёров&nbsp;— по&nbsp;количеству. Один чек может дать и&nbsp;те, и&nbsp;другие.</p></div>
            <div className="no-sum__ex"><b>Чек на&nbsp;1&nbsp;200&nbsp;₽</b><small>только обычные товары</small><span className="num">2&nbsp;шага</span></div>
            <div className="no-sum__ex"><b>Чек на&nbsp;1&nbsp;500&nbsp;₽</b><small>1&nbsp;200&nbsp;₽ обычных + 5&nbsp;товаров партнёров</small><span className="num">3&nbsp;шага</span></div>
          </div>
          <p className="calc__tip reveal">Не хватает немного до&nbsp;следующего шага? На&nbsp;кассе подскажут, сколько добавить.</p>
        </div>
      </section>

      {/* ===== Один круг — 30 шагов ===== */}
      <section className="section section--cream torn-top circle-sec" id="circle">
        <div className="container">
          <div className="section-head reveal">
            <span className="ribbon ribbon--green">Один круг</span>
            <h2>Один круг&nbsp;— 30&nbsp;шагов</h2>
            <p className="lead">На&nbsp;пути вас ждут розыгрыши сертификатов Аникс на&nbsp;10‑м и&nbsp;20‑м шагах, площадки партнёров и&nbsp;финиш с&nbsp;розыгрышем призов.</p>
          </div>
          <div className="scale reveal">
            <div className="scale__lights"><StepGarland step={30} labels={false} partners={[...CAMPAIGN.partnerStops]} wire="#173f2a" textColor="#173f2a" startSolid /></div>
            <div className="scale__labels">
              {MILESTONES.map((m) => <div key={m.n}><b>{m.title}</b><p>{m.text}</p></div>)}
            </div>
            {/* Телефон: гирлянда тремя рядами по 10 шагов, под каждым рядом — его веха (правка 24.10) */}
            <div className="scale__rows">
              {MILESTONES.map((m, i) => (
                <div key={m.n} className="scale__row">
                  <StepRow row={i } step={30} labels={false} partners={[...CAMPAIGN.partnerStops]} wire="#173f2a" textColor="#173f2a" />
                  <div><b>{m.title}</b><p>{m.text}</p></div>
                </div>
              ))}
            </div>
            <p className="scale__legend"><IconCrate />Каждый 4‑й шаг&nbsp;— площадка партнёра: видео, рассказ о&nbsp;компании и&nbsp;отзывы</p>
          </div>
          <div className="odds">
            <div className="odds__card reveal">
              <h3>Кто получает сертификаты</h3>
              <div className="odds__grid">
                <div><span className="odds__big">1 из 30</span><p className="odds__txt">Сертификат на&nbsp;1&nbsp;500&nbsp;₽&nbsp;— каждому 30‑му, дошедшему до&nbsp;10‑го шага за&nbsp;неделю.</p><Dots n={30} /></div>
                <div><span className="odds__big">1 из 100</span><p className="odds__txt">Сертификат на&nbsp;3&nbsp;000&nbsp;₽&nbsp;— каждому 100‑му, дошедшему до&nbsp;20‑го шага за&nbsp;неделю.</p><Dots n={100} /></div>
              </div>
            </div>
            <div className="more-circles reveal" style={d(100)}>
              <h3>Больше кругов&nbsp;— больше шансов</h3>
              <p>За&nbsp;каждый пройденный круг&nbsp;— билет на&nbsp;розыгрыш. Кругов может быть сколько угодно: ёлка начинается заново, а&nbsp;билеты копятся.</p>
              <div className="more-circles__row"><div><span className="num">1&nbsp;круг</span><small>30 шагов</small></div><span className="ticket ticket--gold">билет</span></div>
              <div className="more-circles__row"><div><span className="num">2&nbsp;круга</span><small>60 шагов</small></div><span className="ticket ticket--gold">билет</span><span className="ticket ticket--gold">билет</span></div>
            </div>
          </div>
          {/* Промокоды доставки «Торнадо» — каждому, без розыгрыша (правка 27.10). Сами коды здесь не показываем: они открываются на «Моём маршруте» */}
          <div className="promo-strip reveal">
            <IconCoupon className="promo-strip__icon" />
            <div className="promo-strip__text">
              <b>Промокоды на&nbsp;доставку «Торнадо»&nbsp;— каждому</b>
              <p>Каждый второй шаг&nbsp;— промокод на&nbsp;заказ в&nbsp;приложении «Торнадо». Это не&nbsp;розыгрыш: дошли до&nbsp;шага&nbsp;— код ваш, он&nbsp;появится на&nbsp;странице <Link className="link" to="/route">«Мой маршрут»</Link>.</p>
            </div>
            <ul className="promo-strip__deals">
              {DELIVERY_PROMOS.map((p) => (
                <li key={p.code}><span className="num">−{formatRub(p.discount)}</span><small>на&nbsp;заказ от&nbsp;{formatRub(p.minOrder)}<br />шаги {p.steps.join(', ')}</small></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Что важно знать ===== */}
      <ImportantRules />

      {/* ===== Полные правила ===== */}
      <section className="section section--cream torn-top rules-full" id="rules">
        <div className="container reveal">
          <h2>Полные правила акции</h2>
          <p className="lead">Организатор&nbsp;— ООО&nbsp;«Торговая сеть Аникс». Покупки и&nbsp;регистрация чеков&nbsp;— с&nbsp;16&nbsp;ноября 2026 по&nbsp;10&nbsp;января 2027&nbsp;года, выдача призов&nbsp;— до&nbsp;24&nbsp;января.</p>
          <p style={{ marginTop: 18 }}><SoonLink className="link">Читать полные правила&nbsp;→</SoonLink></p>
        </div>
      </section>

      <CtaBanner
        title={<>Начните свой новогодний маршрут</>}
        lead={<>Сохраните чек&nbsp;— и&nbsp;сделайте первый шаг к&nbsp;подаркам.</>}
        actions={<OpenModalButton modal="receipt">Зарегистрировать чек</OpenModalButton>}
        goat={{ src: '/img/goat-branch.webp', width: 600, height: 963 }}
      />
    </PageLayout>
  );
}
