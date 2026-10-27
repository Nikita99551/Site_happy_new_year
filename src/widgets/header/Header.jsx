import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { useToast } from '@/shared/ui/toast/context';
import { IconPin, IconUser } from '@/shared/ui/icons/Icons';
import { SoonLink } from '@/shared/ui/soon-link/SoonLink';
import './Header.scss';

// Без адреса — страница ещё не готова: пункт на месте, но никуда не ведёт
const NAV = [
  { to: '/', label: 'Главная' },
  { to: '/route', label: 'Мой маршрут' },
  { label: 'Условия' },
  { label: 'Подарки' },
  { to: '/#partners', label: 'Партнёры' },
];

/** Шапка: верхняя строка с магазином и входом, липкая белая панель с меню. На главной зелёная (hero). */
export function Header({ hero = false }) {
  const { user, selectedStore, logout } = useSession();
  const { open } = useModal();
  const toast = useToast();
  // Меню профиля у кнопки с именем (компьютер)
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  // Меню открыто только для той страницы, на которой его открыли: при переходе ключ меняется и меню закрывается само
  const [menu, setMenu] = useState({ open: false, key: location.key });
  const menuOpen = menu.open && menu.key === location.key;
  const setMenuOpen = (open) => setMenu({ open, key: location.key });
  const headerRef = useRef(null);
  const wrapRef = useRef(null);

  // Клик вне шапки закрывает меню
  useEffect(() => {
    const onDoc = (e) => {
      if (!headerRef.current?.contains(e.target)) setMenu((m) => (m.open ? { ...m, open: false } : m));
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Выход: сессия сбрасывается, на сайте снова кнопка «Войти» — можно войти с другим номером
  const signOut = async () => {
    setProfileOpen(false);
    setMenuOpen(false);
    await logout();
    toast('Вы вышли из профиля. Можно войти с другим номером');
  };
  const maskedPhone = user ? `+7 ${user.phone.slice(0, 3)} •••‑••‑${user.phone.slice(8)}` : '';

  // Липкая шапка: верхняя строка уезжает, панель остаётся (--header-offset = высота строки)
  useEffect(() => {
    const header = headerRef.current;
    const wrap = wrapRef.current;
    if (!header || !wrap) return;
    const setOffset = () => header.style.setProperty('--header-offset', `${wrap.offsetTop}px`);
    const onScroll = () => document.documentElement.classList.toggle('is-scrolled', wrap.getBoundingClientRect().top <= 1);
    setOffset();
    onScroll();
    window.addEventListener('resize', setOffset);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', setOffset);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const isPartners = location.pathname === '/' && location.hash === '#partners';
  return (
    <header ref={headerRef} className={`header${hero ? ' header--hero' : ''}${menuOpen ? ' menu-open' : ''}`}>
      <div className="container">
        <div className="header__top">
          <span className="header__dates">Новогодняя акция · 16 ноября — 10 января</span>
          <button className="header__chip" type="button" onClick={() => open('store')}>
            <IconPin stroke="currentColor" width={16} height={16} />
            <span>{selectedStore ? selectedStore.name.replace('Аникс ', '') : 'Выбрать магазин'}</span>
          </button>
          <div className="header__profile" ref={profileRef}>
            <button className="header__chip" type="button" aria-haspopup={user ? 'menu' : undefined} aria-expanded={user ? profileOpen : undefined} onClick={() => (user ? setProfileOpen(!profileOpen) : open('auth'))}>
              <IconUser />
              <span>{user ? user.name.split(' ')[0] : 'Войти'}</span>
            </button>
            {user && profileOpen && (
              <div className="profile-pop" role="menu">
                <b>{user.name}</b>
                <small>{maskedPhone}</small>
                <Link className="profile-pop__item" role="menuitem" to="/route" onClick={() => setProfileOpen(false)}>Мой маршрут</Link>
                <button className="profile-pop__item" role="menuitem" type="button" onClick={() => { setProfileOpen(false); open('receipt'); }}>Зарегистрировать чек</button>
                <button className="profile-pop__item profile-pop__item--out" role="menuitem" type="button" onClick={signOut}>Выйти из профиля</button>
              </div>
            )}
          </div>
        </div>
        <div className="header__bar-wrap" ref={wrapRef}>
          <div className="header__bar">
            <Link className="header__logo" to="/" aria-label="Аникс — на главную"><img src="/img/logo.svg" alt="Аникс" width={136} height={36} /></Link>
            <button className="burger" type="button" aria-label="Открыть меню" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
            <nav className="nav" aria-label="Разделы сайта">
              {NAV.map((item) => {
                if (!item.to) return <SoonLink key={item.label}>{item.label}</SoonLink>;
                const active = item.to === '/#partners' ? isPartners : location.pathname === item.to && !isPartners;
                return <Link key={item.to} to={item.to} aria-current={active ? 'page' : undefined}>{item.label}</Link>;
              })}
              {/* Телефон: строки с магазином и входом нет, поэтому профиль и магазин — внизу меню */}
              <div className="nav__account">
                <button className="nav__store" type="button" onClick={() => { setMenuOpen(false); open('store'); }}>
                  <IconPin stroke="currentColor" width={18} height={18} />
                  <span>{selectedStore ? selectedStore.name : 'Выбрать магазин'}</span>
                </button>
                {user ? (
                  <div className="nav__user">
                    <span><b>{user.name}</b><small>{maskedPhone}</small></span>
                    <button className="btn btn--secondary btn--small" type="button" onClick={signOut}>Выйти</button>
                  </div>
                ) : (
                  <button className="btn btn--small" type="button" onClick={() => { setMenuOpen(false); open('auth'); }}>Войти или зарегистрироваться</button>
                )}
              </div>
            </nav>
            <button className="btn header__cta" type="button" onClick={() => open('receipt')}>Зарегистрировать чек</button>
          </div>
        </div>
      </div>
    </header>
  );
}
