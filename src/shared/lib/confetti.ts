const COLORS = ['#e31e24', '#e2b24a', '#fff8e8', '#173f2a'];

/** Конфетти на 2,6 секунды поверх страницы (окно «Чек зарегистрирован»). */
export function launchConfetti(): void {
  const cv = document.createElement('canvas');
  cv.className = 'confetti';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  if (!ctx) {
    cv.remove();
    return;
  }
  const W = (cv.width = innerWidth);
  const H = (cv.height = innerHeight);
  const ps = Array.from({ length: 120 }, (_, i) => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, c: COLORS[i % 4], v: 2 + Math.random() * 3, r: Math.random() * 6.28, s: (Math.random() - 0.5) * 0.2 }));
  const t0 = performance.now();
  const tick = (now: number) => {
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.y += p.v;
      p.r += p.s;
      p.x += Math.sin(p.r) * 0.6;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (now - t0 < 2600) requestAnimationFrame(tick);
    else cv.remove();
  };
  requestAnimationFrame(tick);
}
