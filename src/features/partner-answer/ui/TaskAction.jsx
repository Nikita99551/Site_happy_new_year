import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { isTaskOpen, stepsCostText } from '@/shared/config/campaign';
import { plural } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { IconHeart } from '@/shared/ui/icons/Icons';

/**
 * Что может сделать участник с заданием партнёра (правка 08.11): одна строка пояснения и одна кнопка.
 * Гость — войти; не дошёл до шага — сколько осталось и «Зарегистрировать чек»; дошёл — «Ответить»;
 * уже ответил — статус своего ответа и «Посмотреть». compact — для окна «Все ответы» (кнопка поменьше, без «чека»).
 */
export function TaskAction({ slug, step, mine, compact = false }) {
  const { user, ready } = useSession();
  const { open } = useModal();
  if (!ready) return null;
  const small = compact || undefined;

  let text;
  let action = null;
  if (!user) {
    text = <>Войдите, чтобы видеть свои шаги.</>;
    action = <Button small={small} onClick={() => open('auth')}>Войти или зарегистрироваться</Button>;
  } else if (mine && mine.status !== 'rejected') {
    text = mine.status === 'review'
      ? <>Ваш ответ на&nbsp;проверке. После проверки его увидят все участники.</>
      : <>Ваш ответ опубликован <span className="task-action__likes"><IconHeart /> {mine.likes}</span></>;
    if (!compact) action = <Button variant="secondary" onClick={() => open('answers', { slug, focus: 'mine' })}>Посмотреть мой ответ</Button>;
  } else if (!isTaskOpen(user, step)) {
    const left = step - user.step;
    text = <>До&nbsp;{step}‑го шага осталось {left}&nbsp;{plural(left, 'шаг', 'шага', 'шагов')}: это {stepsCostText(left)}.</>;
    if (!compact) action = <Button onClick={() => open('receipt')}>Зарегистрировать чек</Button>;
  } else {
    text = mine?.status === 'rejected'
      ? <>Ответ не&nbsp;прошёл проверку. Можно отправить другой.</>
      : <>Задание открыто. Ответ увидят все участники после проверки.</>;
    action = <Button small={small} onClick={() => open('answer', { slug })}>{mine ? 'Ответить ещё раз' : 'Ответить на задание'}</Button>;
  }

  return (
    <div className={`task-action${compact ? ' task-action--compact' : ''}`}>
      <p className="task-action__text">{text}</p>
      {action}
    </div>
  );
}
