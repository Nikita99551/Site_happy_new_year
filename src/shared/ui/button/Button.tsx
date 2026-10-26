import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'light' | 'yellow';

interface Common {
  variant?: Variant;
  small?: boolean;
  block?: boolean;
  className?: string;
  children: ReactNode;
}
type AsButton = Common & { to?: undefined; href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;
type AsLink = Common & { to: string; href?: undefined } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
type AsAnchor = Common & { href: string; to?: undefined } & AnchorHTMLAttributes<HTMLAnchorElement>;
export type ButtonProps = AsButton | AsLink | AsAnchor;

function classes({ variant = 'primary', small, block, className }: Common): string {
  return ['btn', variant !== 'primary' && `btn--${variant}`, small && 'btn--small', block && 'btn--block', className].filter(Boolean).join(' ');
}

/** Кнопка сайта: <button>, внутренняя ссылка (to) или внешняя (href). Стили — shared/styles/base.scss (.btn). */
export function Button(props: ButtonProps) {
  if (props.to !== undefined) {
    const { to, variant, small, block, className, children, ...rest } = props;
    return <Link to={to} className={classes({ variant, small, block, className, children })} {...rest}>{children}</Link>;
  }
  if (props.href !== undefined) {
    const { href, variant, small, block, className, children, ...rest } = props;
    return <a href={href} className={classes({ variant, small, block, className, children })} {...rest}>{children}</a>;
  }
  const { variant, small, block, className, children, type = 'button', ...rest } = props;
  return <button type={type} className={classes({ variant, small, block, className, children })} {...rest}>{children}</button>;
}
