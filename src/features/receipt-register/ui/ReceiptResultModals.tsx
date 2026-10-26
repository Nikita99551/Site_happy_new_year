import { useEffect } from 'react';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { api } from '@/shared/api';
import { nextMilestone } from '@/shared/config/campaign';
import { launchConfetti } from '@/shared/lib/confetti';
import { useReducedMotion } from '@/shared/lib/hooks';
import { plural } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { IconClock } from '@/shared/ui/icons/Icons';
import { Lights } from '@/shared/ui/lights';
import { Modal } from '@/shared/ui/modal/Modal';

const DEMO_STEP = 7;

/** Окно 09a: чек принят, но ещё обрабатывается */
export function ProcessingModal({ open }: { open: boolean }) {
  const { open: openModal, close } = useModal();
  return (
    <Modal
      id="m-processing"
      open={open}
      onClose={close}
      ribbon="Чек принят"
      center
      title="Чек обрабатывается"
      lead={<>Шаги появятся в&nbsp;вашем маршруте сразу после обработки.</>}
      before={<div className="seal modal__icon"><IconClock /></div>}
      decor={<img className="modal__goat modal__goat--left" src="/img/goat-lantern.webp" alt="" width={460} height={636} />}
    >
      <div className="modal__lights"><Lights count={10} lit={0} swags={1} offColor="#173f2a" wire="#173f2a" /></div>
      <div className="modal__actions" style={{ marginTop: 24 }}>
        <Button block to="/route" onClick={close}>Перейти к&nbsp;маршруту</Button>
        <Button block variant="secondary" onClick={() => openModal('receipt')}>Зарегистрировать ещё чек</Button>
      </div>
      <p className="modal__foot">Сохраните чек до&nbsp;конца акции. Если он зарегистрирован, на&nbsp;нём напечатан ваш номер телефона.</p>
    </Modal>
  );
}

/** Окно 09: чек зарегистрирован, начислены шаги */
export function SuccessModal({ open, steps }: { open: boolean; steps: number }) {
  const { open: openModal, close } = useModal();
  const { user } = useSession();
  const reduced = useReducedMotion();
  const to = user ? user.step : DEMO_STEP;
  // Чек закрыл круг: шагов в новом круге меньше, чем начислено (или ровно 30 — звезда горит)
  // Круг закрыт этим чеком: шагов начислено больше, чем в новом круге; ровно 30; или после ровно 30 все шаги чека легли в новый круг
  const circleDone = steps > 0 && (steps > to || to === 30 || (steps === to && (user?.circle ?? 1) > 1));
  // Новые лампочки: только начисленные этим чеком (на ровно 30-м шаге круг не начинается заново)
  const from = steps > to ? 1 : Math.max(1, to - steps + 1);
  // Гирлянда окна — десяток, в котором сейчас человек; новые лампочки красные, начиная с первой новой в этом десятке
  const decadeStart = to > 0 ? Math.floor((to - 1) / 10) * 10 + 1 : 1;
  const lit = to > 0 ? to - decadeStart + 1 : 0;
  const newFrom = Math.max(from, decadeStart) - decadeStart + 1;
  const target = nextMilestone(to);
  const left = target - to;
  const atMilestone = steps > 0 && !circleDone && (to === 10 || to === 20);
  const caption = steps === 0
    ? 'Шаги начисляются за каждые полные 600 ₽ без алкоголя и табака, а также за товары партнёров'
    : circleDone
      ? to === 30
        ? 'Круг пройден — у вас ещё один билет на розыгрыш призов!'
        : `Круг пройден — +1 билет на розыгрыш! В новом круге уже ${to} ${plural(to, 'шаг', 'шага', 'шагов')}`
      : atMilestone
        ? `Вы дошли до ${to}‑го шага — сертификат Аникс ваш!`
        : `Ещё ${left} ${plural(left, 'шаг', 'шага', 'шагов')}${target === 30 ? ' до билета на розыгрыш призов' : ` до сертификата Аникс на ${target}‑м шаге`}`;

  useEffect(() => {
    if (open && !reduced && steps > 0) launchConfetti();
  }, [open, reduced, steps]);
  // Пример для гостя берётся из демо-данных, чтобы окно выглядело одинаково
  void api;

  return (
    <Modal
      id="m-success"
      open={open}
      onClose={close}
      ribbon={steps > 0 ? 'Ура, новые шаги!' : 'Чек принят'}
      center
      width={680}
      title="Чек зарегистрирован"
      lead={steps > 0 ? <>Вы стали ближе к&nbsp;новогоднему подарку.</> : <>Сумма покупки меньше 600&nbsp;₽, поэтому шагов за&nbsp;этот чек нет.</>}
      before={<div className="modal__big"><span className="num">+{steps}</span><b>{plural(steps, 'шаг', 'шага', 'шагов')}</b></div>}
      decor={<img className="modal__goat modal__goat--right" src="/img/goat-dance.webp" alt="" width={460} height={710} />}
    >
      <div className="modal__lights"><Lights count={10} lit={lit} newFrom={steps > 0 ? newFrom : Infinity} swags={1} offColor="#173f2a" wire="#173f2a" /></div>
      <p className="modal__cap">{caption}</p>
      <div className="modal__actions" style={{ marginTop: 24 }}>
        <Button block to="/route" onClick={close}>Перейти к&nbsp;маршруту</Button>
        <Button block variant="secondary" onClick={() => openModal('receipt')}>Зарегистрировать ещё чек</Button>
      </div>
    </Modal>
  );
}
