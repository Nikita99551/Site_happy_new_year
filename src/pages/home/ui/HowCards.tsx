const d = (ms: number) => ({ '--d': `${ms}ms` } as React.CSSProperties);

const IconBag = () => (
  <svg viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth={3.9} strokeLinecap="round" strokeLinejoin="round"><path d="M13 4.33337L6.5 13V43.3334C6.5 44.4826 6.95655 45.5848 7.7692 46.3975C8.58186 47.2102 9.68406 47.6667 10.8333 47.6667H41.1667C42.3159 47.6667 43.4181 47.2102 44.2308 46.3975C45.0435 45.5848 45.5 44.4826 45.5 43.3334V13L39 4.33337H13Z" /><path d="M6.5 13H45.5" /><path d="M34.6668 21.6666C34.6668 23.9652 33.7537 26.1696 32.1284 27.7949C30.5031 29.4202 28.2987 30.3333 26.0002 30.3333C23.7016 30.3333 21.4972 29.4202 19.8719 27.7949C18.2466 26.1696 17.3335 23.9652 17.3335 21.6666" /></svg>
);
const IconReceipt = () => (
  <svg viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth={3.9} strokeLinecap="round" strokeLinejoin="round"><path d="M8.6665 4.33337V47.6667L12.9998 45.5L17.3332 47.6667L21.6665 45.5L25.9998 47.6667L30.3332 45.5L34.6665 47.6667L38.9998 45.5L43.3332 47.6667V4.33337L38.9998 6.50004L34.6665 4.33337L30.3332 6.50004L25.9998 4.33337L21.6665 6.50004L17.3332 4.33337L12.9998 6.50004L8.6665 4.33337Z" /><path d="M17.3335 17.3334H34.6668" /><path d="M17.3335 26H34.6668" /><path d="M17.3335 34.6666H28.1668" /></svg>
);
const IconSteps = () => (
  <svg viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth={3.9} strokeLinecap="round" strokeLinejoin="round"><path d="M8.66659 34.6667V29.51C8.66659 24.9167 6.43493 22.75 6.49993 17.3334C6.56493 11.44 9.72826 4.33337 16.2499 4.33337C20.3016 4.33337 21.6666 8.23337 21.6666 11.9167C21.6666 18.655 17.3333 24.18 17.3333 30.7234V34.6667C17.3333 35.816 16.8767 36.9182 16.0641 37.7308C15.2514 38.5435 14.1492 39 12.9999 39C11.8507 39 10.7485 38.5435 9.9358 37.7308C9.12314 36.9182 8.66659 35.816 8.66659 34.6667Z" /><path d="M43.3335 43.3333V38.1767C43.3335 33.5833 45.5652 31.4167 45.5002 26C45.4352 20.1067 42.2718 13 35.7502 13C31.6985 13 30.3335 16.9 30.3335 20.5833C30.3335 27.3217 34.6668 32.8467 34.6668 39.39V43.3333C34.6668 44.4826 35.1234 45.5848 35.936 46.3975C36.7487 47.2101 37.8509 47.6667 39.0002 47.6667C40.1494 47.6667 41.2516 47.2101 42.0643 46.3975C42.8769 45.5848 43.3335 44.4826 43.3335 43.3333Z" /><path d="M34.6665 36.8334H43.3332" /><path d="M8.6665 28.1666H17.3332" /></svg>
);

/** Три волнистые карточки «Как участвовать» на главной */
export function HowCards() {
  return (
    <div className="how__cards">
      <article className="how__card reveal" style={d(0)}>
        <div className="wavy"><span className="wavy__n">1</span><span className="wavy__icon"><IconBag /></span><h3>Покупайте в&nbsp;Аникс</h3><p>Чек от&nbsp;600&nbsp;₽. Алкоголь и&nbsp;табачные изделия в&nbsp;сумму не&nbsp;входят. Сохраните чек до&nbsp;24&nbsp;января 2027&nbsp;года.</p></div>
      </article>
      <article className="how__card reveal" style={d(80)}>
        <div className="wavy wavy--green"><span className="wavy__n">2</span><span className="wavy__icon"><IconReceipt /></span><h3>Регистрируйте чек</h3><p>У&nbsp;кассира, на&nbsp;кассе самообслуживания или на&nbsp;сайте. До&nbsp;5&nbsp;чеков в&nbsp;день.</p></div>
      </article>
      <article className="how__card reveal" style={d(160)}>
        <div className="wavy wavy--gold"><span className="wavy__n">3</span><span className="wavy__icon"><IconSteps /></span><h3>Шагайте к&nbsp;призам</h3><p>Каждые 600&nbsp;₽&nbsp;— шаг по&nbsp;маршруту. На&nbsp;10‑м и&nbsp;20‑м шагах&nbsp;— розыгрыши сертификатов Аникс, на&nbsp;30‑м&nbsp;— финиш и&nbsp;билет на&nbsp;розыгрыш призов.</p></div>
      </article>
    </div>
  );
}
