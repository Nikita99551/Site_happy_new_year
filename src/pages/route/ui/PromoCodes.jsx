import { useState } from 'react';
import { codeForStep, DELIVERY_PROMOS, TORNADO_APP_URL } from '@/shared/config/campaign';
import { formatRub } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { IconCoupon } from '@/shared/ui/icons/Icons';

/**
 * Промокоды доставки «Торнадо» (правка 27.10): каждому, кто дошёл до шага, — это не розыгрыш.
 * С 29.10 за каждый чётный шаг свой код (STEP_CODES): в купоне группы — кнопки шагов (2, 4, 6…), переключаешься
 * и копируешь код за выбранный шаг. Код шага открыт, когда шаг пройден; после первого круга открыты все.
 * Гость видит купоны закрытыми и приглашение войти. Вводится код в приложении «Торнадо» (TORNADO_APP_URL).
 */
export function PromoCodes({ step, circle, guest, onLogin }) {
  const isOpen = (n) => !guest && (circle > 1 || step >= n);
  // Выбранный шаг в каждом купоне; по умолчанию — последний открытый (самый свежий код), иначе первый шаг группы
  const [picked, setPicked] = useState({});
  const [copied, setCopied] = useState('');
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Без доступа к буферу обмена код всё равно виден крупно — его можно переписать
    }
    setCopied(code);
    window.setTimeout(() => setCopied((c) => (c === code ? '' : c)), 2200);
  };

  return (
    <section className="section section--red torn-top promos" id="promos">
      <div className="container">
        <div className="section-head reveal">
          <span className="ribbon ribbon--cream">Доставка «Торнадо»</span>
          <h2>Ваши промокоды на&nbsp;доставку</h2>
          <p className="lead">За&nbsp;каждый второй шаг&nbsp;— свой промокод на&nbsp;заказ в&nbsp;приложении «Торнадо». Это не&nbsp;розыгрыш: дошли до&nbsp;шага&nbsp;— промокод ваш. Выберите шаг и&nbsp;скопируйте его код.</p>
        </div>
        <div className="promos__list">
          {DELIVERY_PROMOS.map((p, i) => {
            const opened = p.steps.filter(isOpen);
            const sel = picked[i] ?? opened[opened.length - 1] ?? p.steps[0];
            const open = isOpen(sel);
            const code = codeForStep(sel);
            return (
              <article key={p.code} className={`coupon reveal${opened.length ? '' : ' coupon--locked'}`} style={{ '--d': `${i * 80}ms` }}>
                <div className="coupon__paper">
                  <div className="coupon__stub">
                    <span className="coupon__sum num">−{formatRub(p.discount)}</span>
                    <small>на&nbsp;заказ от&nbsp;{formatRub(p.minOrder)}</small>
                  </div>
                  <div className="coupon__body">
                    <small className="coupon__label" id={`promo-steps-${i}`}>Промокод за&nbsp;шаг</small>
                    <div className="coupon__steps" role="group" aria-labelledby={`promo-steps-${i}`}>
                      {p.steps.map((n) => (
                        <button key={n} type="button" className={`coupon__step${n === sel ? ' is-active' : ''}${isOpen(n) ? '' : ' is-locked'}`} aria-pressed={n === sel} aria-label={`Шаг ${n}${isOpen(n) ? '' : ', ещё закрыт'}`} onClick={() => setPicked((m) => ({ ...m, [i]: n }))}>{n}</button>
                      ))}
                    </div>
                    {open
                      ? <b className={`coupon__code${code.length > 8 ? ' coupon__code--long' : ''}`}>{code}</b>
                      : <b className="coupon__code coupon__code--hidden" aria-label="Промокод пока закрыт">••••••</b>}
                    {open ? (
                      <button type="button" className="coupon__copy" onClick={() => copy(code)}>{copied === code ? 'Скопировано ✓' : 'Скопировать'}</button>
                    ) : guest ? (
                      <p className="coupon__when"><button type="button" className="link" onClick={onLogin}>Войдите</button>, чтобы увидеть свои промокоды</p>
                    ) : (
                      <p className="coupon__when">Откроется на&nbsp;{sel}‑м шаге</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="promos__how reveal">
          <IconCoupon className="promos__how-icon" />
          <ol>
            <li><b>1</b>Выберите шаг и&nbsp;скопируйте код</li>
            <li><b>2</b>Откройте приложение «Торнадо»</li>
            <li><b>3</b>Введите код при оформлении заказа</li>
          </ol>
          <Button variant="yellow" href={TORNADO_APP_URL} target="_blank" rel="noopener">Открыть «Торнадо»</Button>
        </div>
      </div>
    </section>
  );
}
