import { useState } from 'react';
import { AnswerCard, MediaViewer, toggleLike, useAnswers } from '@/entities/answer';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { TaskAction } from '@/features/partner-answer';
import { formatNumber } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { IconPhoto, IconVideo } from '@/shared/ui/icons/Icons';
import { PartnerBox } from '@/shared/ui/lights';

const ON_PAGE = 3;
const IconText = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true" {...p}><path d="M5 7h14M5 12h14M5 17h9" /></svg>
);
const IconLock = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><rect x={5} y={11} width={14} height={10} rx={2} /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
const KINDS = {
  text: { icon: IconText, label: 'Текст' },
  photo: { icon: IconPhoto, label: 'Фото' },
  video: { icon: IconVideo, label: 'Видео до 1 минуты' },
};

/**
 * Задание партнёра на его странице (правка 08.11, вариант Никиты «лучшие на странице + окно»).
 * Сверху бумажная карточка: задание, что можно прислать, приз и кнопка (ответить / войти / сколько шагов осталось).
 * Ниже три самых любимых ответа (по сердечкам) и кнопка «Все ответы» — остальное в окне с фильтрами и прокруткой внутри,
 * чтобы страница не превращалась в бесконечную ленту.
 * Правка 08.11 (Никита): задание и ответы видят только те, кто дошёл до шага с коробкой (canSee). Гость и тот, кто не дошёл,
 * видят закрытую коробку с замком: на каком шаге откроется и сколько осталось — без текста задания и без ответов.
 */
export function TaskSection({ partner, task, canSee }) {
  const { user } = useSession();
  const { open } = useModal();
  // Берём на один больше: свой ответ на странице не повторяем (он в строке статуса), а лучших всё равно три.
  // Не дошёл до шага — ответы не загружаем вовсе
  const { items, counts, mine, status } = useAnswers(partner.slug, { sort: 'popular', limit: ON_PAGE + 1, viewer: user?.phone ?? '', enabled: canSee });
  const [viewing, setViewing] = useState(null);

  if (!canSee) {
    return (
      <section className="section section--green torn-top ptask ptask--locked" id="task">
        <div className="container">
          <div className="section-head ptask__head reveal">
            <span className="ribbon ribbon--cream">Задание партнёра · {task.step}‑й шаг</span>
            <h2>Задание откроется на&nbsp;{task.step}‑м шаге</h2>
          </div>
          <div className="ptask__card ptask__lock reveal">
            <span className="ptask__lock-pic" aria-hidden="true">
              <svg viewBox="0 0 48 48"><PartnerBox x={24} y={24} s={44} /></svg>
              <span className="ptask__lock-badge"><IconLock /></span>
            </span>
            <div className="ptask__lock-text">
              <p className="ptask__text">Партнёр «{partner.title}» приготовил задание для&nbsp;участников акции. Дойдите до&nbsp;{task.step}‑го шага маршрута&nbsp;— и&nbsp;здесь откроются задание и&nbsp;ответы других участников.</p>
              <TaskAction slug={partner.slug} step={task.step} mine={null} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const top = items.filter((a) => !a.mine).slice(0, ON_PAGE);
  const total = counts?.all ?? 0;
  const nothingRequired = !Object.values(task.accepts).includes('required');
  const kinds = ['text', 'photo', 'video'].filter((k) => task.accepts[k]);
  const openAll = (focus) => open('answers', { slug: partner.slug, focus });
  const onLike = (a) => (user ? toggleLike(a).catch(() => {}) : open('auth'));

  return (
    <section className="section section--green torn-top ptask" id="task">
      <div className="container">
        <div className="section-head ptask__head reveal">
          <span className="ribbon ribbon--cream">Задание партнёра · {task.step}‑й шаг</span>
          <h2>{task.title}</h2>
          <p className="lead">Вы дошли до&nbsp;{task.step}‑го шага, и&nbsp;задание открыто. Выполнять не&nbsp;обязательно: выполнили&nbsp;— участвуете в&nbsp;розыгрыше приза партнёра.</p>
        </div>

        <div className="ptask__card reveal">
          <div className="ptask__main">
            <small className="ptask__kicker">Задание от&nbsp;«{partner.title}»</small>
            <p className="ptask__text">{task.task}</p>
            <ul className="ptask__accepts" aria-label="Что можно прислать">
              {kinds.map((k) => {
                const { icon: Icon, label } = KINDS[k];
                return (
                  <li key={k}>
                    <Icon />{label}
                    {task.accepts[k] === 'optional' && !nothingRequired && <i>по&nbsp;желанию</i>}
                  </li>
                );
              })}
              {nothingRequired && <li className="ptask__any">хватит чего-то одного</li>}
            </ul>
          </div>
          <div className="ptask__side">
            <p className="ptask__prize"><small>Разыгрывает партнёр</small>{task.prize ?? 'Приз партнёр объявит позже'}</p>
            <TaskAction slug={partner.slug} step={task.step} mine={mine} />
          </div>
        </div>

        <div className="ptask__answers">
          <div className="ptask__answers-head">
            <h3>Ответы участников{total > 0 && <span className="ptask__count">{formatNumber(total)}</span>}</h3>
            {total > 0 && <p>Здесь самые любимые. Понравился ответ&nbsp;— нажмите на&nbsp;сердечко.</p>}
          </div>
          {top.length > 0 && (
            <ul className="ptask__list">
              {top.map((a) => (
                <li key={a.id}>
                  <AnswerCard answer={a} lines={a.photo || a.video ? 5 : 11} onExpand={() => openAll(a.id)} onLike={onLike} onMedia={setViewing} />
                </li>
              ))}
            </ul>
          )}
          {status === 'ready' && top.length === 0 && (
            <p className="ptask__empty">Пока никто не&nbsp;ответил. Ваш ответ может стать первым!</p>
          )}
          {status === 'error' && <p className="ptask__empty">Не получилось загрузить ответы. Обновите страницу.</p>}
          {total > top.length && (
            <div className="ptask__all">
              <Button variant="light" onClick={() => openAll()}>Все ответы · {formatNumber(total)}</Button>
            </div>
          )}
        </div>
      </div>
      <MediaViewer answer={viewing} onClose={() => setViewing(null)} />
    </section>
  );
}
