import { useEffect, useRef, useState } from 'react';
import { CAMPAIGN } from '@/shared/config/campaign';
import { useReducedMotion } from '@/shared/lib/hooks';

/**
 * Анимация прохождения шагов на «Моём маршруте» (ёлка и гирлянда).
 * Бэкенду ничего дополнительно не нужно: сайт сам помнит в браузере, какой шаг человек видел в прошлый раз,
 * и при следующем открытии маршрута зажигает новые шары по очереди. Нужны только поля circle и step из GET /me.
 */

/**
 * Положение на маршруте: круг и шаг в нём (0…30)
 * @typedef {Object} RoutePos
 * @property {number} circle
 * @property {number} step
 */

const SEEN_KEY = 'anix_route_seen';
const LAST = CAMPAIGN.circleSteps;

/**
 * Где показан прогресс: у главной и «Маршрута» своя память, чтобы анимация сыграла на обеих страницах
 * @typedef {'route' | 'home'} SeenPlace
 */

/** Что человек видел в прошлый раз (по телефону: на одном компьютере может быть несколько участников) */
export function readSeen(phone, place) {
  try {
    const all = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}');
    return all[`${place}:${phone}`] ?? null;
  } catch {
    return null;
  }
}

export function writeSeen(phone, place, pos) {
  try {
    const all = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}');
    all[`${place}:${phone}`] = { circle: pos.circle, step: pos.step };
    localStorage.setItem(SEEN_KEY, JSON.stringify(all));
  } catch {
    /* приватный режим: анимация просто не повторится, ничего страшного */
  }
}

const isBefore = (a, b) => a.circle < b.circle || (a.circle === b.circle && a.step < b.step);

/** Кадры анимации от from до to. Между кругами — пауза на зажжённой звезде и сброс ёлки на старт. */
function buildFrames(from, to) {
  const frames = [];
  let { circle, step } = from;
  // Если пропущено несколько кругов целиком, показываем только последний переход
  if (to.circle - circle > 1) {
    circle = to.circle - 1;
    step = Math.min(step, LAST - 1);
  }
  const count = (to.circle - circle) * LAST + to.step - step;
  const tick = Math.max(110, Math.min(260, 2600 / Math.max(1, count)));
  while (circle < to.circle || step < to.step) {
    if (step < LAST && (circle < to.circle || step < to.step)) {
      step += 1;
      const finish = step === LAST;
      frames.push({ pos: { circle, step }, wait: finish ? 1400 : tick, finish });
    } else {
      circle += 1;
      step = 0;
      frames.push({ pos: { circle, step }, wait: 500 });
    }
  }
  return frames;
}

/**
 * Возвращает положение для показа: пока анимация идёт, оно догоняет настоящее по одному шагу.
 * moving = true, пока шары загораются (для класса «только что зажёгся»).
 */
export function useStepAnimation({ from, to, run, onFinish }) {
  const reduced = useReducedMotion();
  // ?noanim читаем из адреса сразу: класс no-anim ставится на кадр позже, и первый кадр показал бы «0»
  const still = reduced || (typeof location !== 'undefined' && /noanim/.test(location.search));
  const startPos = () => (from && !still && isBefore(from, to) ? from : to);
  const [pos, setPos] = useState(startPos);
  const [moving, setMoving] = useState(false);
  // Отправная точка появилась позже (данные пользователя загрузились после первого показа) — начинаем с неё
  const fromKey = from ? `${from.circle}:${from.step}` : '';
  const [seenKey, setSeenKey] = useState(fromKey);
  if (seenKey !== fromKey) {
    setSeenKey(fromKey);
    setPos(startPos());
  }
  const finishRef = useRef(onFinish);
  const posRef = useRef(pos);
  useEffect(() => {
    finishRef.current = onFinish;
    posRef.current = pos;
  });

  useEffect(() => {
    const begin = posRef.current;
    if (still || !run || !isBefore(begin, to)) {
      setMoving(false);
      return;
    }
    // Шаг вне 0…30 (ошибка данных) не должен зациклить кадры
    const frames = buildFrames(begin, { circle: to.circle, step: Math.min(LAST, Math.max(0, to.step)) });
    let i = 0;
    let timer = 0;
    const next = () => {
      const f = frames[i++];
      if (!f) {
        setMoving(false);
        return;
      }
      setMoving(true);
      setPos(f.pos);
      posRef.current = f.pos;
      if (f.finish) finishRef.current?.();
      timer = window.setTimeout(next, f.wait);
    };
    timer = window.setTimeout(next, 350);
    return () => {
      window.clearTimeout(timer);
      setMoving(false);
    };
  }, [to.circle, to.step, run, still, fromKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Без анимации (или если данные «откатились» назад) показываем настоящее положение сразу
  const shown = still || !isBefore(pos, to) ? to : pos;
  return { pos: shown, moving: moving && !still };
}

/**
 * Отправная точка анимации для вошедшего участника: что он видел здесь в прошлый раз
 * (в первый раз — старт текущего круга). Настоящее положение сразу запоминается, чтобы анимация не повторялась.
 */
export function useSeenStart(user, place) {
  const phone = user?.phone ?? '';
  const [start, setStart] = useState(() => ({ phone, pos: user ? readSeen(phone, place) ?? { circle: user.circle, step: 0 } : null }));
  if (start.phone !== phone) setStart({ phone, pos: user ? readSeen(phone, place) ?? { circle: user.circle, step: 0 } : null });
  useEffect(() => {
    if (user) writeSeen(user.phone, place, { circle: user.circle, step: user.step });
  }, [user, place]);
  return start.phone === phone ? start.pos : null;
}
