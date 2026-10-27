import './ReceiptHint.scss';

/** Строки нарисованного чека: слева название, справа сумма */
const ROWS: [string, string][] = [
  ['Молоко 3,2%', '89,90'],
  ['Хлеб нарезной', '45,00'],
  ['Яблоки, 1 кг', '159,00'],
];

/**
 * Подсказка в окне чека «Где номер чека»: нарисованный чек, нужная строка подсвечена (правка 27.10).
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
          <span className="receipt-hint__rule" />
          {ROWS.map(([name, sum]) => <span key={name} className="receipt-hint__row"><span>{name}</span><span>{sum}</span></span>)}
          <span className="receipt-hint__row receipt-hint__total"><span>ИТОГО</span><span>1&nbsp;245,00</span></span>
        </div>
      </div>
      <div className="receipt-hint__text">
        <b>Где номер чека?</b>
        <p>Вверху чека найдите строку <mark>Чек&nbsp;№</mark> и&nbsp;впишите цифры после неё.</p>
        <p className="receipt-hint__example">На&nbsp;этом примере&nbsp;— <strong>1234</strong></p>
      </div>
    </div>
  );
}
