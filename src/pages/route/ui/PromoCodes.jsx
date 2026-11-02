import { useState, useEffect, useMemo } from 'react';
import { DELIVERY_PROMOS, PROMO_STEPS_TEXT, TORNADO_APP_URL } from '@/shared/config/campaign';
import { formatRub } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { IconCoupon } from '@/shared/ui/icons/Icons';
import { usePromoCode } from "@/shared/hooks/usePromoCode.js";

export function PromoCodes({ step, circle, guest, onLogin }) {
  const { promoCodes, loading, getPromoCodes } = usePromoCode();

  useEffect(() => {
    getPromoCodes();
  }, [getPromoCodes]);

  // Карта доступных кодов (только те, где name !== null)
  const serverCodesMap = useMemo(() => {
    const map = {};
    if (!promoCodes) return map;

    promoCodes.forEach(group => {
      group.codes.forEach(code => {
        if (code.name !== null && code.name !== undefined) { // проверка на null
          map[code.step] = code.name;
        }
      });
    });
    return map;
  }, [promoCodes]);

  // Открыт ли шаг (если код есть в карте)
  const isOpen = (n) => !guest && !!serverCodesMap[n];

  const [picked, setPicked] = useState({});
  const [copied, setCopied] = useState('');
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
    setCopied(code);
    window.setTimeout(() => setCopied((c) => (c === code ? '' : c)), 2200);
  };

  return (
      <section className="section section--red torn-top promos" id="promos">
        <div className="container">
          <div className="section-head reveal">
            <span className="ribbon ribbon--cream">Доставка «Торнадо»</span>
            <h2>Ваши промокоды на&nbsp;доставку</h2>
            <p className="lead">На&nbsp;каждом нечётном шаге&nbsp;— {PROMO_STEPS_TEXT}&nbsp;— свой промокод на&nbsp;заказ в&nbsp;приложении «Торнадо». Это не&nbsp;розыгрыш: дошли до&nbsp;шага&nbsp;— промокод ваш. Выберите шаг и&nbsp;скопируйте его код.</p>
          </div>

          <div className="promos__list">
            {DELIVERY_PROMOS.map((p, i) => {
              // Находим открытые шаги для этой группы
              const opened = p.steps.filter(isOpen);
              // Если у пользователя уже выбран шаг, берем его. Иначе — последний открытый. Если ничего не открыто — первый шаг.
              const sel = picked[i] ?? opened[opened.length - 1] ?? p.steps[0];
              const open = isOpen(sel);
              const code = serverCodesMap[sel] || '';

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
                              <button
                                  key={n}
                                  type="button"
                                  className={`coupon__step${n === sel ? ' is-active' : ''}${isOpen(n) ? '' : ' is-locked'}`}
                                  aria-pressed={n === sel}
                                  aria-label={`Шаг ${n}${isOpen(n) ? '' : ', ещё закрыт'}`}
                                  onClick={() => setPicked((m) => ({ ...m, [i]: n }))}
                              >
                                {n}
                              </button>
                          ))}
                        </div>


                        {open ? (
                            <b className="coupon__code">{code}</b>
                        ) : (
                            <b className="coupon__code coupon__code--hidden" aria-label="Промокод пока закрыт">••••••</b>
                        )}

                        <div className="coupon__action">
                          {open ? (
                              <button type="button" className="coupon__copy" onClick={() => copy(code)}>
                                {copied === code ? 'Скопировано ✓' : 'Скопировать'}
                              </button>
                          ) : guest ? (
                              <p className="coupon__when"><button type="button" className="link" onClick={onLogin}>Войдите</button>, чтобы увидеть свои промокоды</p>
                          ) : (
                              <p className="coupon__when">Откроется на&nbsp;{sel}‑м шаге</p>
                          )}
                        </div>
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