import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button/Button';
import { useGarlandSway } from '@/shared/ui/lights';
import { Snow } from '@/shared/ui/snow/Snow';
import { PageLayout } from '@/widgets/page-layout/PageLayout';
import './NotFoundPage.scss';

/**
 * Своя страница 404 (переделана 28.10): в стиле сайта — шапка и подвал, первый блок на весь экран.
 * «4 0 4» — бумажные бирки на верёвке (как календарь на «Подарках»), качаются от мыши; коза с фонариком «искала страницу».
 */
export default function NotFoundPage() {
  const tagsRef = useRef(null);
  useGarlandSway(tagsRef, { selector: '.nf-tag', reach: 140, maxAngle: 6, yWeight: 0.25 });
  return (
    <PageLayout title="Страница не найдена · Новогодняя акция Аникс" noindex>
      <section className="section section--green on-dark nf">
        <Snow />
        <div className="container nf__inner">
          <div className="nf__text">
            <span className="ribbon">Ошибка 404</span>
            <div className="nf__tags" ref={tagsRef} aria-hidden="true">
              <svg className="nf__wire" viewBox="0 0 400 40" preserveAspectRatio="none"><path d="M0 6 C 110 44 290 44 400 6" fill="none" stroke="#e2b24a" strokeWidth={2.5} /></svg>
              {['4', '0', '4'].map((digit, i) => (
                <span key={i} className="nf-tag"><span className="nf-tag__hole" /><span className="num">{digit}</span></span>
              ))}
            </div>
            <h1>Такой страницы&nbsp;нет</h1>
            <p className="lead">Коза обошла с&nbsp;фонариком весь маршрут, но&nbsp;этой страницы не&nbsp;нашла. Возможно, в&nbsp;адресе опечатка или страница переехала.</p>
            <div className="nf__actions">
              <Button to="/">На главную</Button>
              <Button variant="light" to="/route">Мой маршрут</Button>
              <span className="nf__more">Как участвовать&nbsp;— <Link className="link" to="/conditions">условия акции</Link></span>
            </div>
          </div>
          <img className="nf__goat" src="/img/goat-lantern.webp" alt="" width={688} height={1024} />
        </div>
      </section>
    </PageLayout>
  );
}
