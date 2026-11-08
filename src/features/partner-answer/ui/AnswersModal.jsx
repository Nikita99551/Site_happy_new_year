import { useEffect, useRef, useState } from 'react';
import { AnswerCard, MediaViewer, toggleLike, useAnswers } from '@/entities/answer';
import { getPartner } from '@/entities/partner';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { isTaskOpen, taskOfPartner } from '@/shared/config/campaign';
import { formatNumber, plural } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { Modal } from '@/shared/ui/modal/Modal';
import { TaskAction } from './TaskAction';
import './PartnerAnswers.scss';

const PAGE = 20;
const SORTS = [['popular', 'Популярные'], ['new', 'Новые']];
const TYPES = { all: 'Все', photo: 'С фото', video: 'С видео', text: 'Только текст' };

/**
 * Окно «Все ответы» на задание партнёра (правка 08.11, вариант Никиты «лучшие на странице + окно»).
 * Сверху — порядок (популярные / новые) и, если ответы разные, вид (с фото, с видео, только текст). Список прокручивается
 * только внутри окна; ответы приходят по 20, следующие — кнопкой «Показать ещё», бесконечной ленты нет.
 * Свой ответ — первым, в золотой рамке. payload: { slug, focus } — focus: id ответа или 'mine', к нему окно прокрутится само.
 */
export function AnswersModal({ open }) {
  const { state, close, open: openModal } = useModal();
  const { user } = useSession();
  const payload = state?.name === 'answers' ? state.payload : undefined;

  // Окно остаётся в DOM и после закрытия: партнёра запоминаем, чтобы список не пропадал, пока окно гаснет.
  // Открыли для другого партнёра — порядок и вид снова «популярные / все»
  const [slug, setSlug] = useState(payload?.slug ?? '');
  const [sort, setSort] = useState('popular');
  const [type, setType] = useState('all');
  const [expanded, setExpanded] = useState(() => new Set());
  const [focus, setFocus] = useState(null);
  if (payload?.slug && payload.slug !== slug) {
    setSlug(payload.slug);
    setSort('popular');
    setType('all');
    setExpanded(new Set());
  }
  const [lastPayload, setLastPayload] = useState(payload);
  if (payload !== lastPayload) {
    setLastPayload(payload);
    setFocus(payload?.focus ?? null);
    if (payload?.focus && payload.focus !== 'mine') setExpanded((s) => new Set(s).add(payload.focus));
  }

  const task = taskOfPartner(slug);
  const partner = getPartner(slug);
  // Ответы видят только дошедшие до шага с коробкой (правка 08.11): иначе не загружаем
  const canSee = Boolean(task) && isTaskOpen(user, task.step);
  const { items, next, counts, mine, status, error, more, moreBusy, retry } = useAnswers(slug, {
    sort, type, limit: PAGE, viewer: user?.phone ?? '', enabled: open && canSee,
  });
  const [viewing, setViewing] = useState(null);
  const listRef = useRef(null);

  // Новый порядок или вид — список снова сверху
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [sort, type, slug]);

  // Открыли окно с конкретным ответом («Читать полностью» на странице) — прокручиваем к нему
  // Прокрутка — один раз на каждое открытие (lastPayload меняется при каждом open), а не при каждой смене фильтра
  const focused = useRef(null);
  useEffect(() => {
    if (!open || !focus || status !== 'ready' || focused.current === lastPayload) return;
    focused.current = lastPayload;
    const box = listRef.current;
    const el = focus === 'mine' ? box?.querySelector('.answer--mine') : box?.querySelector(`#answer-${CSS.escape(focus)}`);
    if (box && el) box.scrollTo({ top: Math.max(0, el.offsetTop - box.offsetTop - 8) });
  }, [open, focus, status, lastPayload]);

  if (!task) return null;
  if (!canSee) {
    return (
      <Modal id="m-answers" open={open} onClose={close} ribbon="Ответы участников" width={640} title={<>Задание откроется на&nbsp;{task.step}‑м шаге</>}
        lead={<>Задание партнёра «{partner?.title}» и&nbsp;ответы участников видны тем, кто дошёл до&nbsp;{task.step}‑го шага маршрута.</>}>
        <TaskAction slug={slug} step={task.step} mine={null} compact />
      </Modal>
    );
  }

  const onLike = (a) => {
    if (!user) {
      // Гость: сначала вход (сердечки ставят только участники)
      openModal('auth');
      return;
    }
    toggleLike(a).catch(() => {});
  };
  const onExpand = (a) => setExpanded((s) => {
    const n = new Set(s);
    if (n.has(a.id)) n.delete(a.id);
    else n.add(a.id);
    return n;
  });

  // Виды ответов для фильтра: показываем, только если ответы разные (у видеопоздравлений все — видео, фильтр не нужен)
  const kinds = counts ? ['photo', 'video', 'text'].filter((k) => counts[k] > 0) : [];
  const total = counts?.all ?? 0;
  const shown = type === 'all' ? total : counts?.[type] ?? 0;
  const others = items.filter((a) => !a.mine);
  const left = Math.max(0, shown - items.length);

  return (
    <>
      <Modal
        id="m-answers"
        open={open}
        onClose={close}
        ribbon="Ответы участников"
        width={880}
        title={task.title}
        lead={<>Задание партнёра «{partner?.title}» · {counts ? `${formatNumber(total)} ${plural(total, 'ответ', 'ответа', 'ответов')}` : 'загружаем…'}</>}
      >
        <div className="answers-tools">
          <div className="tabs answers-tools__sort" role="tablist" aria-label="Порядок ответов">
            {SORTS.map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={sort === key} onClick={() => setSort(key)}>{label}</button>
            ))}
          </div>
          {kinds.length > 1 && (
            <div className="answers-tools__types" role="group" aria-label="Какие ответы показать">
              {['all', ...kinds].map((k) => (
                <button key={k} type="button" className={`chip${type === k ? ' is-on' : ''}`} aria-pressed={type === k} onClick={() => setType(k)}>
                  {TYPES[k]} <span className="chip__n">{formatNumber(k === 'all' ? total : counts[k])}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`answers-list${status === 'loading' ? ' is-loading' : ''}`} ref={listRef} tabIndex={-1} aria-busy={status === 'loading'}>
          {mine && (
            <div className="answers-list__mine">
              <AnswerCard answer={mine} layout="row" lines={6} expanded={expanded.has(mine.id)} onExpand={onExpand} onMedia={setViewing} />
            </div>
          )}
          {status === 'error' && !items.length ? (
            <div className="answers-empty">
              <p>{error || 'Не получилось загрузить ответы'}</p>
              <Button variant="secondary" small onClick={retry}>Попробовать ещё раз</Button>
            </div>
          ) : status !== 'loading' && !others.length ? (
            <p className="answers-empty">{total ? 'Таких ответов пока нет.' : 'Пока никто не ответил. Ваш ответ может стать первым!'}</p>
          ) : (
            <ul className="answers-list__items">
              {others.map((a) => (
                <li key={a.id}>
                  <AnswerCard answer={a} layout="row" lines={6} expanded={expanded.has(a.id)} onExpand={onExpand} onLike={onLike} onMedia={setViewing} />
                </li>
              ))}
            </ul>
          )}
          {next && (
            <div className="answers-list__more">
              <Button variant="secondary" small onClick={more} disabled={moreBusy}>
                {moreBusy ? 'Загружаем…' : `Показать ещё ${Math.min(PAGE, left)}`}
              </Button>
              <small>Показано {formatNumber(items.length)} из&nbsp;{formatNumber(shown)}</small>
            </div>
          )}
          {!next && others.length > 3 && <p className="answers-list__end">Это все ответы</p>}
        </div>

        <TaskAction slug={slug} step={task.step} mine={mine} compact />
      </Modal>
      <MediaViewer answer={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
