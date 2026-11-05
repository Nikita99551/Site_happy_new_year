import { useState } from 'react';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { CAMPAIGN, PARTNER_TASKS, stepsCostText } from '@/shared/config/campaign';
import { plural } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { PartnerBox } from '@/shared/ui/lights';
import { Modal } from '@/shared/ui/modal/Modal';
import './PartnerTaskModal.scss';

/**
 * Задание партнёра на шаге с коробкой (правка 02.11). Открывается нажатием на коробку на ёлке «Моего маршрута».
 * Дошёл до шага — видно задание; не дошёл — сколько осталось; гость — приглашение войти.
 * Заданий пока нет (PARTNER_TASKS[n].task === null): вместо текста задания — заглушка «скоро появится».
 */
export function PartnerTaskModal({ open }) {
  const { state, open: openModal, close } = useModal();
  const { user } = useSession();
  // Окно остаётся в DOM и после закрытия: шаг запоминаем, чтобы текст не пропадал, пока окно гаснет
  const [step, setStep] = useState(CAMPAIGN.partnerStops[0]);
  const asked = state?.name === 'task' ? state.payload?.step : undefined;
  if (asked !== undefined && asked !== step) setStep(asked);
  const { partner, task, prize } = PARTNER_TASKS[step] ?? { partner: '', task: null, prize: null };
  // Пройденный круг открывает задания на всех шагах
  const reached = Boolean(user) && (user.step >= step || user.circlesDone > 0);
  const left = step - (user?.step ?? 0);

  let title = `Задание на ${step}‑м шаге`;
  let lead;
  let action;
  if (reached) {
    title = 'Вам открыто задание';
    lead = <>Вы дошли до&nbsp;{step}‑го шага, и&nbsp;партнёр акции «{partner}» приготовил для&nbsp;вас задание.</>;
    action = <Button block onClick={close}>Понятно</Button>;
  } else if (user) {
    lead = <>Дойдите до&nbsp;{step}‑го шага, и&nbsp;откроется задание от&nbsp;партнёра акции «{partner}». До&nbsp;него {left}&nbsp;{plural(left, 'шаг', 'шага', 'шагов')}: это {stepsCostText(left)}.</>;
    action = <Button block onClick={() => openModal('receipt')}>Зарегистрировать чек</Button>;
  } else {
    lead = <>Когда вы дойдёте до&nbsp;{step}‑го шага, откроется задание от&nbsp;партнёра акции «{partner}». Войдите, чтобы видеть свои шаги.</>;
    action = <Button block onClick={() => openModal('auth')}>Войти или зарегистрироваться</Button>;
  }

  return (
    <Modal
      id="m-task"
      open={open}
      onClose={close}
      ribbon="Задание партнёра"
      width={600}
      title={title}
      lead={lead}
      before={<svg className="task-box" viewBox="0 0 48 48" aria-hidden="true"><PartnerBox x={24} y={24} s={44} /></svg>}
    >
      {reached && (
        <div className="task-card">
          <small>Задание</small>
          {task ? <p>{task}</p> : <><b>Скоро появится здесь</b><p>Партнёр готовит задание. Когда оно будет готово, здесь появится, что нужно сделать и&nbsp;какие призы разыгрываются.</p></>}
        </div>
      )}
      <p className="task-prize"><small>Разыгрывает партнёр</small>{prize ?? 'Приз партнёр объявит вместе с заданием'}</p>
      {/* Вместо списка 1-2-3 одна строка (правка 03.11): окно помещается и на невысоком телефоне */}
      <p className="task-note">Выполнять задание не&nbsp;обязательно. Выполнили&nbsp;— участвуете в&nbsp;розыгрыше призов партнёра.</p>
      <div className="modal__actions">{action}</div>
    </Modal>
  );
}
