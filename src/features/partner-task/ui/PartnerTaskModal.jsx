import { useState } from 'react';
import { getPartner, partnerPath } from '@/entities/partner';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { CAMPAIGN, PARTNER_LABEL, PARTNER_TASKS, readyTask, stepsCostText } from '@/shared/config/campaign';
import { plural } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { PartnerBox } from '@/shared/ui/lights';
import { Modal } from '@/shared/ui/modal/Modal';
import './PartnerTaskModal.scss';

/**
 * Задание партнёра на шаге с коробкой (правка 02.11). Открывается нажатием на коробку на ёлке «Моего маршрута».
 * Дошёл до шага — видно задание; не дошёл — сколько осталось; гость — приглашение войти.
 * Задание выполняют на странице партнёра (правка 08.11): кнопка «Выполнить задание» ведёт туда, к ответам участников.
 */
export function PartnerTaskModal({ open }) {
  const { state, open: openModal, close } = useModal();
  const { user } = useSession();
  // Окно остаётся в DOM и после закрытия: шаг запоминаем, чтобы текст не пропадал, пока окно гаснет
  const [step, setStep] = useState(CAMPAIGN.partnerStops[0]);
  const asked = state?.name === 'task' ? state.payload?.step : undefined;
  if (asked !== undefined && asked !== step) setStep(asked);
  // Партнёр шага известен, а задание ещё готовится (СПК, 13.11) — его имя есть, в коробке «Скоро появится».
  // Страницы партнёра нет на сайте — задания тоже нет, ссылки нет
  const who = getPartner(PARTNER_TASKS[step]?.slug);
  const t = who ? readyTask(step) : null;
  const partner = who?.title ?? PARTNER_LABEL;
  const prize = t?.prize;
  // Пройденный круг открывает задания на всех шагах
  const reached = Boolean(user) && (user.step >= step || user.circlesDone > 0);
  const left = step - (user?.step ?? 0);

  let title = `Задание на ${step}‑м шаге`;
  let lead;
  let action;
  if (reached) {
    title = 'Вам открыто задание';
    lead = <>Вы дошли до&nbsp;{step}‑го шага, и&nbsp;партнёр акции «{partner}» приготовил для&nbsp;вас задание.</>;
    action = t ? <Button block to={`${partnerPath(t.slug)}#task`}>Выполнить задание</Button> : <Button block onClick={close}>Понятно</Button>;
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
          {t ? <><b>{t.title}</b><p>{t.task}</p></> : <><b>Скоро появится здесь</b><p>Партнёр готовит задание. Когда оно будет готово, здесь появится, что нужно сделать и&nbsp;какие призы разыгрываются.</p></>}
        </div>
      )}
      <p className="task-prize"><small>Приз</small>{prize ?? 'Приз партнёр объявит позже'}{t?.winners && <span className="task-prize__who">{t.winners}</span>}</p>
      {/* Вместо списка 1-2-3 одна строка (правка 03.11): окно помещается и на невысоком телефоне */}
      <p className="task-note">Выполнять не&nbsp;обязательно. Ответ отправляют на&nbsp;странице партнёра{t?.hiddenAnswers ? '' : <>, там&nbsp;же ответы других участников</>}.</p>
      <div className="modal__actions">{action}</div>
    </Modal>
  );
}
