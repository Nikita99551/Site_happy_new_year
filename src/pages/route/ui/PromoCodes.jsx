import { useState } from 'react';
import { DELIVERY_PROMOS, TORNADO_APP_URL } from '@/shared/config/campaign';
import { formatRub } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { IconCoupon } from '@/shared/ui/icons/Icons';

/** Шаги списком: «2, 4, 6, 8 и 10» */
const stepsText = (s) => `${s.slice(0, -1).join(', ')} и ${s[s.length - 1]}`;

/**
 * Промокоды доставки «Торнадо» (правка 27.10): каждому, кто дошёл до шага, — это не розыгрыш.
 * Код открывается на первом шаге своей группы (ЕЛКА — на 2‑м) и дальше остаётся открытым; после первого круга открыты все.
 * Гость видит купоны закрытыми и приглашение войти. Вводится код в приложении «Торнадо» (TORNADO_APP_URL).
 */
export function PromoCodes({ step, circle, guest, onLogin }) {
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
          <p className="lead">Каждый второй шаг&nbsp;— промокод на&nbsp;заказ в&nbsp;приложении «Торнадо». Это не&nbsp;розыгрыш: дошли до&nbsp;шага&nbsp;— промокод ваш. Он&nbsp;появляется здесь, как только шаг пройден.</p>
        </div>
        <div className="promos__list">
          {DELIVERY_PROMOS.map((p, i) => {
            const open = !guest && (circle > 1 || step >= p.steps[0]);
            return (
              <article key={p.code} className={`coupon reveal${open ? '' : ' coupon--locked'}`} style={{ '--d': `${i * 80}ms` }}>
                <div className="coupon__paper">
                  <div className="coupon__stub">
                    <span className="coupon__sum num">−{formatRub(p.discount)}</span>
                    <small>на&nbsp;заказ от&nbsp;{formatRub(p.minOrder)}</small>
                  </div>
                  <div className="coupon__body">
                    <small className="coupon__label">Промокод</small>
                    {open
                      ? <b className="coupon__code">{p.code}</b>
                      : <b className="coupon__code coupon__code--hidden" aria-label="Промокод пока закрыт">••••••</b>}
                    <p className="coupon__steps">За&nbsp;шаги {stepsText(p.steps)}</p>
                    {open ? (
                      <button type="button" className="coupon__copy" onClick={() => copy(p.code)}>{copied === p.code ? 'Скопировано ✓' : 'Скопировать'}</button>
                    ) : guest ? (
                      <p className="coupon__when"><button type="button" className="link" onClick={onLogin}>Войдите</button>, чтобы увидеть свои промокоды</p>
                    ) : (
                      <p className="coupon__when">Откроется на&nbsp;{p.steps[0]}‑м шаге</p>
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
            <li><b>1</b>Скопируйте промокод</li>
            <li><b>2</b>Откройте приложение «Торнадо»</li>
            <li><b>3</b>Введите код при оформлении заказа</li>
          </ol>
          <Button variant="yellow" href={TORNADO_APP_URL} target="_blank" rel="noopener">Открыть «Торнадо»</Button>
        </div>
      </div>
    </section>
  );
}
