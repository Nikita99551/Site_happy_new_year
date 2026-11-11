import { weeklyDrawStatus } from '@/entities/user';
import { OpenModalButton } from '@/features/modal';

/**
 * Еженедельный розыгрыш на «Моём маршруте» (п. 8.3 правил, вариант 3 от 11.11 вечер): нужен хотя бы один шаг
 * за неделю перед розыгрышем, с понедельника по воскресенье. «Вы в розыгрыше» — только когда это видно по датам чеков.
 */
export function WeeklyDrawNote({ user }) {
  const w = weeklyDrawStatus(user);
  const button = <OpenModalButton modal="receipt">Зарегистрировать чек</OpenModalButton>;
  if (w.state === 'in') {
    return <div><b>Вы в&nbsp;розыгрыше {w.draw}</b><p>На&nbsp;этой неделе у&nbsp;вас есть шаги. Чтобы участвовать и&nbsp;в&nbsp;следующем розыгрыше, сделайте хотя&nbsp;бы один шаг на&nbsp;следующей неделе.</p>{button}</div>;
  }
  if (w.state === 'out') {
    return <div><b>Один чек от&nbsp;600&nbsp;₽ до&nbsp;воскресенья&nbsp;— и&nbsp;вы в&nbsp;розыгрыше {w.draw}</b>{button}</div>;
  }
  if (w.state === 'after') {
    return <div><b>Еженедельные розыгрыши&nbsp;— до&nbsp;5&nbsp;января</b><p>Шаги для последнего розыгрыша засчитывались с&nbsp;28&nbsp;декабря по&nbsp;3&nbsp;января. Впереди финал 12&nbsp;января.</p>{button}</div>;
  }
  return <div><b>Розыгрыши по&nbsp;вторникам, с&nbsp;24&nbsp;ноября по&nbsp;5&nbsp;января</b><p>Каждую неделю&nbsp;— 5&nbsp;призов. Участвуют все, кто сделал хотя&nbsp;бы один шаг за&nbsp;неделю перед розыгрышем, с&nbsp;понедельника по&nbsp;воскресенье.</p>{button}</div>;
}
