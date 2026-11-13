import { useRef, useState } from 'react';
import { getPartner, partnerPath } from '@/entities/partner';
import { useModal } from '@/features/modal';
import { CAMPAIGN, PARTNER_LABEL, PARTNER_STEPS_TEXT, PARTNER_TASKS, readyTask, stepsCostText } from '@/shared/config/campaign';
import { plural } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { IconCheck } from '@/shared/ui/icons/Icons';
import { PartnerBox } from '@/shared/ui/lights';

const STOPS = CAMPAIGN.partnerStops;

const Box = ({ className }) => <svg className={className} viewBox="0 0 48 48" aria-hidden="true"><PartnerBox x={24} y={24} s={44} /></svg>;
const IconLock = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><rect x={5} y={11} width={14} height={10} rx={2} /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;

/**
 * Задания партнёров на «Моём маршруте» (правка 03.11, переделано по просьбе Никиты: вместо шести бумажных карточек —
 * одна плашка с переключателем). Сверху коробки шагов 4, 8, 12…: нажал — ниже задание этого шага, партнёр и его приз.
 * Открыто: шаг пройден в этом круге или уже пройден целый круг. По умолчанию выбран последний открытый шаг с видимым партнёром, иначе первый.
 */
export function PartnerTasks({ step, circle, guest }) {
  const { open } = useModal();
  const isOpen = (n) => !guest && (circle > 1 || step >= n);
  const opened = STOPS.filter(isOpen);
  const [picked, setPicked] = useState(null);
  // По умолчанию — последнее открытое задание партнёра, чья страница есть на сайте (правка 08.11: в показе видны
  // не все партнёры, и на 28-м шаге стояло «скоро появится»)
  const shown = (n) => !!getPartner(PARTNER_TASKS[n]?.slug) && !!readyTask(n);
  const sel = picked ?? opened.filter(shown).pop() ?? opened[opened.length - 1] ?? STOPS.find(shown) ?? STOPS[0];
  // Партнёр шага известен, а задание ещё готовится (СПК, 13.11) — имя есть, задание «скоро появится»; страницы нет — ни того ни другого
  const who = getPartner(PARTNER_TASKS[sel]?.slug);
  const t = who ? readyTask(sel) : null;
  const partner = who?.title ?? PARTNER_LABEL;
  const prize = t?.prize;
  const on = isOpen(sel);
  const left = sel - step;
  const tabs = useRef(null);

  // Стрелки влево/вправо переключают шаги, как вкладки
  const onKey = (e) => {
    const i = STOPS.indexOf(sel);
    const next = e.key === 'ArrowRight' ? STOPS[(i + 1) % STOPS.length] : e.key === 'ArrowLeft' ? STOPS[(i - 1 + STOPS.length) % STOPS.length] : null;
    if (next === null) return;
    e.preventDefault();
    setPicked(next);
    tabs.current?.querySelector(`[data-step="${next}"]`)?.focus();
  };

  let body;
  let action = null;
  if (on) {
    body = t ? <><b>{t.title}</b><p>{t.task}</p></> : <><b>Скоро появится здесь</b><p>Партнёр готовит задание. Когда оно будет готово, здесь появится, что нужно сделать.</p></>;
    // Ответ — на странице партнёра (правка 08.11): там форма и ответы других участников
    action = t ? <Button to={`${partnerPath(t.slug)}#task`}>Выполнить задание</Button> : null;
  } else if (guest) {
    body = <><b>Откроется на&nbsp;{sel}‑м шаге</b><p>Войдите, чтобы видеть свои шаги и&nbsp;открытые задания.</p></>;
    action = <Button onClick={() => open('auth')}>Войти или зарегистрироваться</Button>;
  } else {
    body = <><b>Откроется на&nbsp;{sel}‑м шаге</b><p>Осталось {left}&nbsp;{plural(left, 'шаг', 'шага', 'шагов')}: это {stepsCostText(left)}.</p></>;
    action = <Button onClick={() => open('receipt')}>Зарегистрировать чек</Button>;
  }

  return (
    <section className="section section--white torn-top ptasks" id="tasks">
      <div className="container">
        <div className="section-head reveal">
          <span className="ribbon ribbon--green">Задания партнёров</span>
          <h2>Задания от&nbsp;партнёров</h2>
          <p className="lead">На&nbsp;{PARTNER_STEPS_TEXT}‑м шагах открываются задания от&nbsp;партнёров акции. Выполнять их не&nbsp;обязательно. За&nbsp;выполненное задание можно получить приз партнёра: кто его получит, написано в&nbsp;каждом задании.</p>
        </div>
        <div className="ptasks__panel reveal">
          <div className="ptasks__bar">
            <p className="ptasks__count">{guest ? 'Выберите шаг' : <>Открыто заданий: <b>{opened.length}</b> из&nbsp;{STOPS.length}</>}</p>
            <div className="ptasks__tabs" role="tablist" aria-label="Задания партнёров по шагам" ref={tabs} onKeyDown={onKey}>
              {STOPS.map((n) => (
                <button key={n} type="button" role="tab" data-step={n} id={`ptab-${n}`} aria-selected={n === sel} aria-controls="ptask-pane" tabIndex={n === sel ? 0 : -1}
                  className={`ptab${n === sel ? ' is-active' : ''}${isOpen(n) ? ' is-open' : ''}`} onClick={() => setPicked(n)}
                  aria-label={`Шаг ${n}, ${isOpen(n) ? 'задание открыто' : 'задание пока закрыто'}`}>
                  <Box className="ptab__box" />
                  <span className="ptab__n"><span className="ptab__word">Шаг </span>{n}</span>
                  <span className="ptab__mark">{isOpen(n) ? <IconCheck /> : <IconLock />}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="ptasks__pane" role="tabpanel" id="ptask-pane" aria-labelledby={`ptab-${sel}`}>
            <div className="ptasks__who">
              <Box className={`ptasks__big${on ? '' : ' is-locked'}`} />
              <div>
                <span className={`ptasks__state${on ? ' is-open' : ''}`}>{on ? 'Задание открыто' : 'Пока закрыто'}</span>
                <small>Партнёр · шаг {sel}</small>
                <b style={{ '--longest': Math.max(...String(partner).split(/\s+/).map((w) => w.length)) + 2 }}>«{partner}»</b>
              </div>
            </div>
            <div className="ptasks__info">
              <div className="ptasks__task"><small>Задание</small>{body}</div>
              <p className="ptasks__prize"><small>Приз</small>{prize ?? 'Приз партнёр объявит позже'}{t?.winners && <span className="ptasks__winners">{t.winners}</span>}</p>
              {action && <div className="ptasks__action">{action}</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
