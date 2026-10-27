/**
 * Ссылка на страницу, которой пока нет в показе (условия, подарки, правила, площадка партнёра).
 * Выглядит и стоит там же, где в готовом сайте, но никуда не ведёт.
 */
export function SoonLink({ onClick, ...rest }) {
  const stay = (e) => {
    e.preventDefault();
    onClick?.(e);
  };
  return <a href="#" aria-disabled="true" onClick={stay} {...rest} />;
}
