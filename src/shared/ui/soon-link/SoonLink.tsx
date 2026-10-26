import type { AnchorHTMLAttributes, MouseEvent } from 'react';

/**
 * Ссылка на страницу, которой пока нет в показе (условия, подарки, правила, площадка партнёра).
 * Выглядит и стоит там же, где в готовом сайте, но никуда не ведёт.
 */
export function SoonLink({ onClick, ...rest }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const stay = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.(e);
  };
  return <a href="#" aria-disabled="true" onClick={stay} {...rest} />;
}
