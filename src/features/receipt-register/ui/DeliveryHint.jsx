import { TORNADO_APP_URL } from '@/shared/config/campaign';
import './DeliveryHint.scss';

/**
 * Подсказка «Где номер заказа» во вкладке «Заказ доставки» (29.10): как подсказка чека — слева картинка, справа текст.
 * Картинка — три маленьких экрана приложения «Торнадо», нарисованных схемой (по скриншотам Никиты, без его данных):
 * значок профиля слева вверху → «История заказов» внизу профиля → номер заказа крупными цифрами в карточке.
 * Нужное место на каждом экране — жёлтый маркер в красной рамке, как код на чеке.
 */
export function DeliveryHint() {
  return (
    <div className="delivery-hint">
      <div className="delivery-hint__phones" aria-hidden="true">
        <div className="dh-step">
          <span className="dh-n">1</span>
          <div className="dh-phone">
            <span className="dh-top"><span className="dh-avatar dh-hot" /><span className="dh-lines"><i /><i /></span></span>
            <span className="dh-search" />
            <span className="dh-tiles"><i /><i /><i /></span>
            <span className="dh-icons"><i /><i /><i /><i /></span>
            <span className="dh-cart" />
          </div>
        </div>
        <div className="dh-step">
          <span className="dh-n">2</span>
          <div className="dh-phone">
            <span className="dh-title">Профиль</span>
            <span className="dh-field" /><span className="dh-field" />
            <span className="dh-green" />
            <span className="dh-card" />
            <span className="dh-row dh-hot">История заказов</span>
          </div>
        </div>
        <div className="dh-step">
          <span className="dh-n">3</span>
          <div className="dh-phone">
            <span className="dh-title">История заказов</span>
            <span className="dh-order"><b className="dh-hot">1234567</b><i /><i /><em>✓ Выполнен</em></span>
            <span className="dh-order dh-order--dim"><b>1234401</b><i /><i /></span>
          </div>
        </div>
      </div>
      <div className="delivery-hint__text">
        <b>Где номер заказа в&nbsp;«Торнадо»?</b>
        <ol>
          <li>Нажмите <mark>значок профиля</mark> слева вверху</li>
          <li>Внизу профиля&nbsp;— <mark>История заказов</mark></li>
          <li>Номер&nbsp;— крупные цифры в&nbsp;карточке</li>
        </ol>
        <a className="link link--green" href={TORNADO_APP_URL} target="_blank" rel="noopener">Открыть приложение «Торнадо»</a>
      </div>
    </div>
  );
}
