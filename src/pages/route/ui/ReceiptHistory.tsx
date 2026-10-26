import { Fragment, useMemo } from 'react';
import { circleMarks, type User } from '@/shared/api';
import { useNow } from '@/shared/lib/hooks';
import { circleName, formatWhen, inCircle, plural } from '@/shared/lib/text';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Чек-лента «История чеков»: все чеки участника, новые сверху. Там, где чек закрыл круг, — отметка «Круг пройден».
 * Итог внизу — та же сумма шагов, из которой построены ёлка и гирлянда, поэтому история и маршрут всегда сходятся.
 * Гость видит приглашение войти.
 */
export function ReceiptHistory({ user }: { user: User | null }) {
  const receipts = useMemo(() => user?.receipts ?? [], [user]);
  const marks = useMemo(() => circleMarks(receipts), [receipts]);
  const now = useNow();
  const pending = receipts.filter((r) => r.status === 'processing').length;
  return (
    <div className="receipt">
      <h2>История чеков</h2>
      <p className="receipt__sub">Все ваши чеки, новые сверху</p>
      <div className="receipt__scroll">
        <div className="receipt__list">
          {!user && <p className="receipt__note" style={{ padding: '20px 0' }}>Войдите, чтобы увидеть свои чеки.</p>}
          {user && receipts.length === 0 && <p className="receipt__note" style={{ padding: '20px 0' }}>Чеков пока нет. Зарегистрируйте первый&nbsp;— и&nbsp;шаги появятся на&nbsp;ёлке.</p>}
          {receipts.map((r) => {
            const isPending = r.status === 'processing';
            return (
              <Fragment key={r.id}>
                {/* Новые сверху: отметка над чеком, который закрыл круг */}
                {[...(marks.get(r.id) ?? [])].reverse().map((c) => (
                  <p key={c} className="receipt__circle"><span>★ {cap(circleName(c))} круг пройден&nbsp;— билет на&nbsp;розыгрыш</span></p>
                ))}
                <div className={`receipt__row${isPending ? ' receipt__row--pending' : ''}`}>
                  <div><b>Чек •••• {r.last4}</b><small><time dateTime={r.at}>{formatWhen(r.at, now)}</time></small></div>
                  <span className="receipt__steps">{isPending ? '—' : `+${r.steps} ${plural(r.steps, 'шаг', 'шага', 'шагов')}`}</span>
                  <span className={`pill${isPending ? ' pill--pending' : ''}`}>{isPending ? 'Обрабатывается' : 'Зачислено'}</span>
                  {isPending && <p className="receipt__note">Чек зарегистрирован сразу после покупки. Шаги появятся, как только он обработается.</p>}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
      {user && receipts.length > 0 && (
        <div className="receipt__sum">
          <p>
            <b>Зачислено {user.totalSteps} {plural(user.totalSteps, 'шаг', 'шага', 'шагов')}</b>
            {' '}за&nbsp;{user.receiptsTotal} {plural(user.receiptsTotal, 'чек', 'чека', 'чеков')}
            {pending > 0 && <> ({pending}&nbsp;в&nbsp;обработке)</>}
          </p>
          <p>
            {user.circlesDone > 0
              ? user.step === 30
                ? <>Это {user.circlesDone}&nbsp;{plural(user.circlesDone, 'полный круг', 'полных круга', 'полных кругов')}: звезда горит, следующий чек начнёт новый круг</>
                : <>Это {user.circlesDone}&nbsp;{plural(user.circlesDone, 'пройденный круг', 'пройденных круга', 'пройденных кругов')} по&nbsp;30&nbsp;шагов и&nbsp;{user.step}&nbsp;{plural(user.step, 'шаг', 'шага', 'шагов')} {inCircle(user.circle)}</>
              : <>Все шаги&nbsp;— {inCircle(1)}</>}
          </p>
          {receipts.length > 4 && <p className="receipt__hint">Листайте список ↓</p>}
        </div>
      )}
      <p className="receipt__sign">С наступающим Новым годом!</p>
    </div>
  );
}
