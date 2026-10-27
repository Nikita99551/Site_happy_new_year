import { Link } from 'react-router-dom';

function classes({ variant = 'primary', small, block, className }) {
  return ['btn', variant !== 'primary' && `btn--${variant}`, small && 'btn--small', block && 'btn--block', className].filter(Boolean).join(' ');
}

/** Кнопка сайта: <button>, внутренняя ссылка (to) или внешняя (href). Стили — shared/styles/base.scss (.btn). */
export function Button(props) {
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
