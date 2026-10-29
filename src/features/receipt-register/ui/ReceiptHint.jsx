import './ReceiptHint.scss';

/** Код-пример на нарисованном чеке: вымышленный, того же вида, что на настоящем (латиница и цифры, 18 знаков) */
export const SAMPLE_CODE = '7KQ2M5RT8WZ4X1P6D3';

/** Узор «QR-кода» для рисунка: три угловые метки и псевдослучайные точки (не настоящий код — только узнаваемый вид) */
const QR_PATH = (() => {
  const n = 21;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const finder = (x, y) => x < 7 && y < 7;
  const inFinder = (x, y) => finder(x, y) || finder(n - 1 - x, y) || finder(x, n - 1 - y);
  let d = '';
  for (const [ox, oy] of [[0, 0], [n - 7, 0], [0, n - 7]]) d += `M${ox} ${oy}h7v7h-7zM${ox + 1} ${oy + 1}v5h5v-5zM${ox + 2} ${oy + 2}h3v3h-3z`;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() < 0.48) d += `M${x} ${y}h1v1h-1z`;
  return d;
})();

/**
 * Подсказка в окне чека «Где код для регистрации» (переделана 29.10 по фото настоящего чека «Аникс»):
 * на чеке блок «РОЗЫГРЫШ ПРИЗОВ», QR-код, под ним «Код для регистрации» — его и вводят (латиница и цифры).
 * Рисунок, а не фото: на настоящем чеке телефон покупателя и данные карты. Компактная — окно чека без прокрутки.
 */
export function ReceiptHint() {
  return (
    <div className="receipt-hint">
      <div className="receipt-hint__paper" aria-hidden="true">
        <div className="receipt-hint__body">
          <span className="receipt-hint__stars">* * * * * * * * * *</span>
          <b className="receipt-hint__title">РОЗЫГРЫШ ПРИЗОВ!</b>
          <svg className="receipt-hint__qr" viewBox="0 0 21 21" shapeRendering="crispEdges"><path d={QR_PATH} fill="#2b2b2b" fillRule="evenodd" /></svg>
          <span className="receipt-hint__small">Код для регистрации:</span>
          <span className="receipt-hint__num">{SAMPLE_CODE}</span>
          <span className="receipt-hint__lines" />
        </div>
      </div>
      <div className="receipt-hint__text">
        <b>Где код с&nbsp;чека?</b>
        <p>Под QR‑кодом на&nbsp;чеке&nbsp;— строка <mark>Код для регистрации</mark>, впишите буквы и&nbsp;цифры под ней.</p>
        <p className="receipt-hint__qr-tip">Ещё проще&nbsp;— наведите камеру телефона на&nbsp;QR‑код.</p>
      </div>
    </div>
  );
}
