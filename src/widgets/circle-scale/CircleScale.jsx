import { CAMPAIGN, PARTNER_LABEL, PARTNER_STEPS_TEXT } from '@/shared/config/campaign';
import { IconCert, IconCrate, IconTicket } from '@/shared/ui/icons/Icons';
import { StepGarland, StepRow } from '@/shared/ui/lights';
import './CircleScale.scss';

/** Вехи круга: подписи под гирляндой «Один круг — 30 шагов» */
const MILESTONES = [
  { n: 10, Icon: IconCert, title: <>10‑й шаг</>, text: <>Розыгрыш сертификата Аникс на&nbsp;1&nbsp;500&nbsp;₽: получит каждый 30‑й</> },
  { n: 20, Icon: IconCert, title: <>20‑й шаг</>, text: <>Розыгрыш сертификата Аникс на&nbsp;3&nbsp;000&nbsp;₽: получит каждый 100‑й</> },
  { n: 30, Icon: IconTicket, title: <>30‑й шаг&nbsp;— финиш</>, text: <>Билет в&nbsp;финальный розыгрыш главного приза. Дальше круг начинается заново</> },
];

/**
 * «Один круг — 30 шагов»: заголовок, гирлянда круга с вехами 10/20/30 и подпись про партнёров.
 * На «Условиях» под ней карточки шансов и промокодов, на главной — только этот блок (правка 02.11).
 */
export function CircleScale() {
  const partners = [...CAMPAIGN.partnerStops];
  return (
    <>
      <div className="section-head reveal">
        <span className="ribbon ribbon--green">Один круг</span>
        <h2>Один круг&nbsp;— 30&nbsp;шагов</h2>
        <p className="lead">На&nbsp;10‑м и&nbsp;20‑м шагах разыгрываем сертификаты Аникс. На&nbsp;30‑м вы получаете билет в&nbsp;финальный розыгрыш 12&nbsp;января, где главный приз&nbsp;— отдых на&nbsp;курорте «Манжерок».</p>
      </div>
      <div className="scale reveal">
        <div className="scale__lights"><StepGarland step={30} labels={false} partners={partners} partnerLabel={PARTNER_LABEL} wire="#173f2a" textColor="#173f2a" startSolid /></div>
        <div className="scale__labels">
          {MILESTONES.map((m) => <div key={m.n}><b><m.Icon className="scale__ic" />{m.title}</b><p>{m.text}</p></div>)}
        </div>
        {/* Телефон: гирлянда тремя рядами по 10 шагов, под каждым рядом — его веха (правка 24.10) */}
        <div className="scale__rows">
          {MILESTONES.map((m, i) => (
            <div key={m.n} className="scale__row">
              <StepRow row={i} step={30} labels={false} partners={partners} partnerLabel={PARTNER_LABEL} wire="#173f2a" textColor="#173f2a" />
              <div><b><m.Icon className="scale__ic" />{m.title}</b><p>{m.text}</p></div>
            </div>
          ))}
        </div>
        <p className="scale__legend"><IconCrate /><span>На&nbsp;{PARTNER_STEPS_TEXT}‑м шагах&nbsp;— задания партнёров. Выполнили задание&nbsp;— участвуете в&nbsp;розыгрыше призов партнёра.</span></p>
      </div>
    </>
  );
}
