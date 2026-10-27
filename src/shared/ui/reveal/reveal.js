/**
 * Появление блоков при прокрутке: элементам с классом .reveal добавляется .is-in, когда они входят в экран.
 * ?noanim в адресе показывает всё сразу (для проверки вёрстки и скриншотов).
 */
export function observeReveal(root = document) {
  const items = Array.from(root.querySelectorAll('.reveal:not(.is-in)'));
  if (!('IntersectionObserver' in window) || /noanim/.test(location.search)) {
    document.documentElement.classList.add('no-anim');
    items.forEach((el) => el.classList.add('is-in'));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    // Порог 0: очень высокий блок иначе мог бы никогда не набрать 5 % видимости
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );
  items.forEach((el) => io.observe(el));
  // То, что уже видно при открытии страницы, проявляется сразу, даже у самого низа экрана
  // (иначе кнопка в нижних 8 % первого экрана ноутбука остаётся невидимой до прокрутки). Кадр спустя — чтобы сыграло появление.
  // Повтор после загрузки шрифтов: заголовок становится крупнее и сдвигает блоки в экран уже после первой проверки.
  let alive = true;
  const showVisible = () => {
    if (!alive) return;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.height && r.top < window.innerHeight && r.bottom > 0 && !el.classList.contains('is-in')) {
        el.classList.add('is-in');
        io.unobserve(el);
      }
    }
  };
  const raf = requestAnimationFrame(showVisible);
  document.fonts?.ready.then(() => requestAnimationFrame(showVisible));
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    io.disconnect();
  };
}
