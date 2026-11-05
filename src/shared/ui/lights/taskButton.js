/**
 * Коробка партнёра на гирлянде как кнопка окна задания (правка 03.11, «Один круг» на главной).
 * i — порядковый номер коробки: коробки качаются по очереди, когда блок появился на экране.
 */
export function taskButton(n, i, onPartner) {
  if (!onPartner) return {};
  return {
    className: 'lights__task',
    role: 'button',
    tabIndex: 0,
    'aria-label': `Задание партнёра на ${n}‑м шаге`,
    style: { '--i': i },
    onClick: () => onPartner(n),
    onKeyDown: (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      onPartner(n);
    },
  };
}
