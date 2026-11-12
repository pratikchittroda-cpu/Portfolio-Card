// Background line art for the card: the same flowing wave ridges as the portfolio hero.
// Lines lift under the cursor; a click sends a ripple through them.
(() => {
  const canvas = document.getElementById('waves');
  if (!canvas) return;
  const g = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ACCENT = '255,91,46', FG = '243,239,231', BG = '#08080b';
  let w = 0, h = 0, dpr = 1, N = 30, cols = 80, env = new Float32Array(0), ys = new Float32Array(0), visible = true;
  const m = { x: -9999, y: -9999, sx: -9999, sy: -9999 };
  const ripples = [];

  const build = () => {
    dpr = Math.min(devicePixelRatio, 1.5);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    N = clamp(Math.round(h / 26), 18, 36);
    cols = clamp(Math.round(w / 14), 44, 110);
    env = new Float32Array(cols + 1); ys = new Float32Array(cols + 1);
  };
  build();
  addEventListener('resize', build);
  addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; }, { passive: true });
  addEventListener('pointerdown', (e) => { const r = canvas.getBoundingClientRect(); ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now() }); });
  document.addEventListener('visibilitychange', () => (visible = !document.hidden));

  // Spotlight that follows the pointer across the contact card.
  const card = document.querySelector('.identity-card');
  card?.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(); card.style.setProperty('--mx', e.clientX - r.left + 'px'); card.style.setProperty('--my', e.clientY - r.top + 'px'); });

  const frame = (now) => {
    if (!still) requestAnimationFrame(frame);
    if (!visible) return;
    const t = still ? 3 : now / 1000;
    const wide = w / h > 1.15;
    // On wide screens the waves sit behind the headline (left); on phones they fill the top.
    const cx = wide ? w * 0.3 : w * 0.5, sig = (wide ? 0.26 : 0.5) * w;
    const top = h * (wide ? 0.2 : 0.06), bottom = h * (wide ? 0.99 : 0.6), gap = (bottom - top) / (N - 1);
    const A = h * (wide ? 0.2 : 0.11);
    m.sx += (m.x - m.sx) * 0.1; m.sy += (m.y - m.sy) * 0.1;
    for (let i = ripples.length - 1; i >= 0; i--) { const age = now - ripples[i].t0; ripples[i].r = age * 0.7; ripples[i].a = 1 - age / 1800; if (ripples[i].a <= 0) ripples.splice(i, 1); }
    for (let j = 0; j <= cols; j++) { const d = (j / cols) * w - cx; env[j] = Math.exp(-(d * d) / (2 * sig * sig)); }
    const gradFg = g.createLinearGradient(0, 0, w, 0), gradAc = g.createLinearGradient(0, 0, w, 0);
    for (let s = 0; s <= 10; s++) { const e = env[Math.round((s / 10) * cols)]; gradFg.addColorStop(s / 10, 'rgba(' + FG + ',' + (e * 0.3).toFixed(3) + ')'); gradAc.addColorStop(s / 10, 'rgba(' + ACCENT + ',' + (e * 0.75).toFixed(3) + ')'); }

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.lineJoin = 'round'; g.fillStyle = BG;
    for (let i = 0; i < N; i++) {
      const y0 = top + gap * i, gy = Math.sin(Math.PI * (i / (N - 1)));
      const dy = y0 - m.sy, row = Math.exp(-(dy * dy) / 24200);
      for (let j = 0; j <= cols; j++) {
        const x = (j / cols) * w;
        const v = Math.sin(x * 0.0045 + t * 0.5 + i * 0.42) * 0.5 + Math.sin(x * 0.0115 - t * 0.8 + i * 0.77) * 0.3 + Math.sin(x * 0.027 + t * 1.2 + i * 1.31) * 0.2;
        let lift = 0;
        if (row > 0.01) { const dx = x - m.sx; lift = row * Math.exp(-(dx * dx) / 45000) * h * 0.07; }
        for (const rp of ripples) { const dd = Math.hypot(x - rp.x, y0 - rp.y) - rp.r; lift += Math.exp(-(dd * dd) / 7200) * rp.a * h * 0.04; }
        ys[j] = y0 - (0.5 + 0.5 * v) ** 2 * A * gy * env[j] - lift;
      }
      g.beginPath(); g.moveTo(0, ys[0]);
      for (let j = 1; j <= cols; j++) g.lineTo((j / cols) * w, ys[j]);
      g.lineTo(w, y0 + gap); g.lineTo(0, y0 + gap); g.closePath(); g.fill();
      const accent = i % 5 === 2;
      g.beginPath(); g.moveTo(0, ys[0]);
      for (let j = 1; j <= cols; j++) g.lineTo((j / cols) * w, ys[j]);
      g.strokeStyle = accent ? gradAc : gradFg; g.lineWidth = accent ? 1.6 : 1; g.stroke();
    }
  };
  requestAnimationFrame(frame);
})();
