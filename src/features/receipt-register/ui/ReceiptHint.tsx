import './ReceiptHint.scss';

/**
 * Подсказка в окне чека «Где номер чека»: верх нарисованного чека, нужная строка подсвечена (правка 27.10).
 * Компактная, чтобы окно чека помещалось в экран без прокрутки и рядом оставалась коза.
 * ЗАПОЛНИТЬ: перерисовать по фото настоящего чека «Аникс» — какой номер вводить и где он напечатан.
 */
export function ReceiptHint() {
  return (
    <div className="receipt-hint">
      <div className="receipt-hint__paper" aria-hidden="true">
        <div className="receipt-hint__body">
          <b className="receipt-hint__shop">АНИКС</b>
          <span>Кассовый чек · приход</span>
          <span className="receipt-hint__num">Чек №&nbsp;<b>1234</b></span>
          <span>27.11.2026 · 14:05</span>
          <span className="receipt-hint__lines" />
        </div>
      </div>
      <div className="receipt-hint__text">
        <b>Где номер чека?</b>
        <p>Вверху чека найдите строку <mark>Чек&nbsp;№</mark> и&nbsp;впишите цифры после неё. На&nbsp;примере это&nbsp;<strong>1234</strong>.</p>
      </div>
    </div>
  );
}
