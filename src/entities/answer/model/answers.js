import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/shared/api';
import { errorText } from '@/shared/lib/errors';

/**
 * Ответы участников на задания партнёров (правка 08.11). Списков на странице бывает два — три лучших ответа на странице партнёра
 * и окно «Все ответы»: сердечко меняет ответ сразу в обоих, а новый ответ заставляет оба списка перечитаться.
 * Ленты без конца нет: ответы приходят порциями, следующая — только по кнопке «Показать ещё».
 */
const subs = new Set();
const emit = (e) => subs.forEach((f) => f(e));

/** Ответ отправлен или изменился статус — списки задания перечитываются */
export function answersChanged(slug) {
  emit({ type: 'reload', slug });
}

/** Отправить ответ на задание партнёра; после ответа сервера списки перечитываются */
/** Фото ответа списком: сервер отдаёт photos (до 3, правка 13.11); старый ответ с одним photo тоже понимаем */
export const answerPhotos = (a) => (a?.photos?.length ? a.photos : a?.photo ? [a.photo] : []);

export async function sendAnswer(slug, input) {
  const answer = await api.sendAnswer(slug, input);
  answersChanged(slug);
  return answer;
}

/** Сердечко: сразу меняем на экране, после ответа сервера ставим его цифры; ошибка — возвращаем как было и пробрасываем */
export async function toggleLike(answer) {
  const like = !answer.liked;
  emit({ type: 'patch', id: answer.id, patch: { liked: like, likes: Math.max(0, answer.likes + (like ? 1 : -1)) } });
  try {
    const res = await api.likeAnswer(answer.id, like);
    emit({ type: 'patch', id: answer.id, patch: res });
  } catch (e) {
    emit({ type: 'patch', id: answer.id, patch: { liked: answer.liked, likes: answer.likes } });
    throw e;
  }
}

const EMPTY = { items: [], next: null, counts: null, mine: null };

/**
 * Ответы на задание партнёра slug.
 * viewer — кто смотрит (телефон или ''): сменился (вход, выход) — список перечитывается, ведь меняются «мой ответ» и сердечки.
 * enabled: false — не загружать (окно ещё не открывали).
 * @returns {{ items: TaskAnswer[], next: string | null, counts: AnswersPage['counts'] | null, mine: TaskAnswer | null,
 *   status: 'loading' | 'ready' | 'error', error: string, more: () => Promise<void>, moreBusy: boolean, retry: () => void }}
 */
export function useAnswers(slug, { sort = 'popular', type = 'all', limit = 20, viewer = '', enabled = true } = {}) {
  const [reload, setReload] = useState(0);
  // Что сейчас нужно показать. Пока ответ на этот запрос не пришёл — status 'loading', а на экране прежний список (без мигания)
  const key = `${slug}|${sort}|${type}|${limit}|${viewer}|${reload}`;
  const [res, setRes] = useState({ key: '', page: EMPTY, error: '' });
  const [moreBusy, setMoreBusy] = useState(false);
  // Ключ последнего запроса: порцию «Показать ещё» для старого фильтра не добавляем
  const req = useRef('');

  useEffect(() => {
    const on = (e) => {
      if (e.type === 'reload' && e.slug === slug) setReload((n) => n + 1);
      if (e.type === 'patch') {
        setRes((r) => ({
          ...r,
          page: {
            ...r.page,
            items: r.page.items.map((a) => (a.id === e.id ? { ...a, ...e.patch } : a)),
            mine: r.page.mine?.id === e.id ? { ...r.page.mine, ...e.patch } : r.page.mine,
          },
        }));
      }
    };
    subs.add(on);
    return () => {
      subs.delete(on);
    };
  }, [slug]);

  useEffect(() => {
    if (!enabled || !slug) return;
    req.current = key;
    let alive = true;
    api.answers(slug, { sort, type, limit }).then(
      (page) => alive && setRes({ key, page, error: '' }),
      (e) => alive && setRes((r) => ({ key, page: r.page, error: errorText(e, 'Не получилось загрузить ответы') })),
    );
    return () => {
      alive = false;
    };
  }, [key, slug, sort, type, limit, enabled]);

  const data = res.page;
  const status = res.key !== key ? 'loading' : res.error ? 'error' : 'ready';

  const more = useCallback(async () => {
    if (!data.next || moreBusy) return;
    const asked = req.current;
    setMoreBusy(true);
    try {
      const page = await api.answers(slug, { sort, type, limit, cursor: data.next });
      if (asked !== req.current) return;
      setRes((r) => {
        const seen = new Set(r.page.items.map((a) => a.id));
        return { ...r, page: { ...page, items: [...r.page.items, ...page.items.filter((a) => !seen.has(a.id))] } };
      });
    } catch {
      // Не догрузилось — кнопка «Показать ещё» остаётся, можно нажать снова
    } finally {
      setMoreBusy(false);
    }
  }, [data.next, moreBusy, slug, sort, type, limit]);

  const retry = useCallback(() => setReload((n) => n + 1), []);

  return { ...data, status, error: res.error, more, moreBusy, retry };
}
