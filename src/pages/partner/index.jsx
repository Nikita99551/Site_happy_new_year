import { Link, Navigate, useParams } from 'react-router-dom';
import { getPartner, PartnerLogo, PARTNERS, partnerPath } from '@/entities/partner';
import { useSession } from '@/entities/user';
import { OpenModalButton } from '@/features/modal';
import { CAMPAIGN, isTaskOpen, taskOfPartner } from '@/shared/config/campaign';
import { PartnerBox } from '@/shared/ui/lights';
import { PageLayout } from '@/widgets/page-layout/PageLayout';
import { TaskSection } from './ui/TaskSection';
import './PartnerPage.scss';

const d = (ms) => ({ '--d': `${ms}ms` });

/**
 * Значение в блоке цифр «О компании». Длинное слово («Боголюбово») на телефоне не помещалось в свою колонку
 * и уходило за экран: слова длиннее 7 букв уменьшаются ровно настолько, чтобы занять то же место, что 7 букв (13.11).
 */
function FactValue({ value }) {
  const longest = Math.max(...String(value).split(/\s+/).map((w) => w.length));
  return <span style={longest > 7 ? { fontSize: `${(7 / longest).toFixed(3)}em` } : undefined}>{value}</span>;
}
const N = CAMPAIGN.partnerItemsPerStep;

/**
 * Страница партнёра (поставщика) акции: /partner/<slug>. Макет — Figma «16 Площадка партнёра» (2818:4685).
 * Видео поставщики не прислали — справа на первом экране крупное фото товара. Цен нет: на сайте только фото и название.
 * Данные — entities/partner (генерируются скриптом из поставщики/готово/партнёры-для-сайта.json).
 */
export default function PartnerPage() {
  const { slug } = useParams();
  const { user, ready } = useSession();
  const partner = getPartner(slug);
  if (!partner) return <Navigate to="/#partners" replace />;

  const hero = partner.products.find((p) => p.key === partner.hero);
  const others = PARTNERS.filter((p) => p.slug !== partner.slug);
  // Задание партнёра (правка 08.11): есть не у всех — только у тех, чья коробка стоит на ёлке
  const task = taskOfPartner(partner.slug);
  // Задание и ответы видят только дошедшие до шага с коробкой (правка 08.11)
  const taskOpen = Boolean(task) && isTaskOpen(user, task.step);

  return (
    <PageLayout title={`${partner.title} · Партнёр новогодней акции Аникс 2027`} adNote revealDeps={[slug, ready, taskOpen]}>
      {/* ===== Первый экран ===== */}
      <section className="section section--cream partner-hero">
        <div className="container partner-hero__grid">
          <div className="partner-hero__text">
            <Link className="link link--green tap-area partner-hero__back reveal" to="/#partners">← Все партнёры</Link>
            <div className="partner-hero__logo reveal" style={d(40)}><PartnerLogo partner={partner} lazy={false} /></div>
            <span className="ribbon ribbon--green reveal" style={d(80)}>Партнёр новогодней акции</span>
            {/* --longest — букв в самом длинном слове: по нему CSS уменьшает заголовок, чтобы слово не рвалось (10.11) */}
            <h1 className="reveal" style={{ ...d(120), '--longest': Math.max(...partner.title.split(/\s+/).map((w) => w.length)) }}>{partner.title}</h1>
            <p className="lead reveal" style={d(160)}>{partner.company}. Товары партнёра есть на&nbsp;полках магазинов Аникс&nbsp;— и&nbsp;они помогают быстрее пройти маршрут.</p>
            <div className="partner-rule ticket reveal" style={d(200)}>
              <span className="partner-rule__eq num">{N}&nbsp;=&nbsp;1</span>
              <span className="partner-rule__text">
                {/* Правка 05.11 (Никита): шаг даётся за КОЛИЧЕСТВО товаров и это бонус от партнёра (правила акции, п. 5.5) */}
                <b>Каждые {N}&nbsp;товаров партнёров в&nbsp;чеке&nbsp;— ещё 1&nbsp;шаг</b>
                <small>Шаг от&nbsp;партнёра даётся за&nbsp;количество товаров, а&nbsp;не&nbsp;за&nbsp;сумму. Он&nbsp;добавляется к&nbsp;шагам за&nbsp;покупку.</small>
              </span>
            </div>
            {task && (
              <Link className="partner-hero__task reveal" style={d(240)} to="#task">
                <svg className="partner-hero__task-box" viewBox="0 0 48 48" aria-hidden="true"><PartnerBox x={24} y={24} s={44} /></svg>
                {taskOpen
                  ? <span><b>Задание партнёра: «{task.title}»</b><small>{task.hiddenAnswers ? <>Задание открыто. Ответить можно ниже&nbsp;↓</> : <>Задание открыто. Смотрите ответы участников&nbsp;↓</>}</small></span>
                  : <span><b>Задание партнёра на&nbsp;{task.step}‑м шаге</b><small>Откроется, когда вы дойдёте до&nbsp;{task.step}‑го шага&nbsp;↓</small></span>}
              </Link>
            )}
          </div>
          {hero ? (
            <figure className="partner-photo reveal" style={d(160)}>
              <img className="partner-photo__branch" src="/img/branch.webp" alt="" width={200} height={214} decoding="async" />
              <span className="partner-photo__tape" aria-hidden="true" />
              <span className="partner-photo__pic">
                <img src={hero.img.src} width={hero.img.w} height={hero.img.h} alt={hero.title} fetchPriority="high" />
              </span>
              <figcaption>{hero.title}{hero.weight && <>, {hero.weight}</>}</figcaption>
            </figure>
          ) : (
            <div className="partner-photo partner-photo--logo reveal" style={d(160)}>
              <PartnerLogo partner={partner} lazy={false} />
            </div>
          )}
        </div>
      </section>

      {/* ===== О компании: только то, что прислал поставщик ===== */}
      {partner.about.length > 0 && (
        <section className="section section--white torn-top partner-about">
          <div className="container partner-about__grid">
            <div className="reveal">
              <h2>О компании</h2>
              {partner.about.map((t) => <p className="lead" key={t.slice(0, 24)}>{t}</p>)}
              {partner.site && (
                <p className="partner-about__site">
                  <a className="link" href={partner.site} target="_blank" rel="noopener noreferrer">Сайт производителя&nbsp;→</a>
                </p>
              )}
            </div>
            {partner.facts.length > 0 && (
              <div className="facts partner-about__facts reveal" style={d(120)}>
                {partner.facts.map((f) => (
                  <div className="fact" key={f.label}><span className="num num-red"><FactValue value={f.value} /></span><small>{f.label}</small></div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== Товары ===== */}
      <section className="section section--red torn-top partner-goods" id="goods">
        <div className="container">
          <div className="section-head reveal">
            <span className="ribbon ribbon--cream">Что купить</span>
            <h2>Товары партнёра в&nbsp;Аникс</h2>
            {partner.products.length > 0 && <p className="lead">Ищите на&nbsp;полках своего магазина. Каждые {N}&nbsp;товаров партнёров в&nbsp;чеке&nbsp;— ещё 1&nbsp;шаг.</p>}
          </div>
          {partner.products.length > 0 ? (
            <ul className="goods">
              {partner.products.map((p, i) => (
                <li className="good reveal" key={p.key} style={d(Math.min(i, 8) * 40)}>
                  <span className={`good__pic${p.img ? '' : ' good__pic--empty'}${p.photo ? ' good__pic--photo' : ''}`}>
                    {p.img
                      ? <img src={p.img.src} width={p.img.w} height={p.img.h} alt="" loading="lazy" decoding="async" />
                      : <><PartnerLogo partner={partner} /><small>Фото скоро</small></>}
                  </span>
                  {p.isNew && <span className="good__badge">Новинка</span>}
                  <span className="good__title">{p.title}</span>
                  {p.weight && <span className="good__weight">{p.weight}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="partner-goods__soon reveal">Список товаров партнёра скоро появится.</p>
          )}
          <div className="partner-cta reveal">
            <span className="partner-cta__star" aria-hidden="true" />
            <p>Купили {N}&nbsp;товаров партнёров? Зарегистрируйте чек&nbsp;— шаг засчитается сам.</p>
            <OpenModalButton modal="receipt">Зарегистрировать чек</OpenModalButton>
          </div>
        </div>
      </section>

      {/* ===== Задание партнёра и ответы участников ===== */}
      {task && ready && <TaskSection partner={partner} task={task} canSee={taskOpen} />}

      {/* ===== Другие партнёры ===== */}
      <section className="section section--plaid torn-top partner-others">
        <div className="container">
          <div className="partner-others__paper-wrap reveal"><div className="partner-others__paper">
            <h2>Другие партнёры акции</h2>
            <p className="lead">Нажмите на&nbsp;логотип, чтобы открыть страницу партнёра.</p>
            <ul className="partner-tiles partner-tiles--small">
              {others.map((p) => (
                <li key={p.slug}><Link className="partner-tile" to={partnerPath(p.slug)} aria-label={p.title}><PartnerLogo partner={p} compact /></Link></li>
              ))}
            </ul>
          </div></div>
        </div>
      </section>
    </PageLayout>
  );
}
