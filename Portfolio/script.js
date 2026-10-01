// Lightweight interaction layer for the original CSS-based hero.
// No network request or WebGL dependency is needed for the portfolio to work.
const heroVisual = document.querySelector('.hero-visual');
const fallbackOrb = document.querySelector('#hero-orb');
const reducedMotion = typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false };

if (heroVisual && fallbackOrb && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches) {
  heroVisual.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches) return;
    const bounds = heroVisual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    fallbackOrb.style.setProperty('--tilt-x', `${14 + x * 22}deg`);
    fallbackOrb.style.setProperty('--tilt-y', `${-10 - y * 22}deg`);
  }, { passive: true });

  heroVisual.addEventListener('pointerleave', () => {
    fallbackOrb.style.removeProperty('--tilt-x');
    fallbackOrb.style.removeProperty('--tilt-y');
  }, { passive: true });

  const resetOrb = () => {
    fallbackOrb.style.removeProperty('--tilt-x');
    fallbackOrb.style.removeProperty('--tilt-y');
  };

  if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', resetOrb);
  else if (typeof reducedMotion.addListener === 'function') reducedMotion.addListener(resetOrb);
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const marquee = document.querySelector('.marquee');
const marqueeTrack = marquee?.querySelector('.marquee-track');
const marqueeRepeat = marqueeTrack?.querySelector('span');

if (marquee && marqueeTrack && marqueeRepeat) {
  let lastRepeatWidth = 0;
  let lastRepeatCount = 0;
  let framePending = false;

  const requestFrame = typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback) => window.setTimeout(callback, 0);

  const updateMarquee = () => {
    framePending = false;

    const viewportWidth = marquee.getBoundingClientRect().width;
    const repeatWidth = marqueeRepeat.getBoundingClientRect().width;
    if (!viewportWidth || !repeatWidth) return;

    // The span includes its trailing padding and the separator's margins, so
    // one span is the exact distance the animation needs to travel.
    const repeatCount = Math.max(2, Math.ceil((viewportWidth + repeatWidth) / repeatWidth));

    if (Math.abs(repeatWidth - lastRepeatWidth) > 0.01) {
      marqueeTrack.style.setProperty('--marquee-repeat-width', `${repeatWidth}px`);
      lastRepeatWidth = repeatWidth;
    }

    // Keep the original span as the stable template and only add/remove the
    // exact number of repeats needed for the current viewport.
    if (repeatCount !== lastRepeatCount || marqueeTrack.children.length !== repeatCount) {
      while (marqueeTrack.children.length > repeatCount) {
        marqueeTrack.lastElementChild?.remove();
      }
      while (marqueeTrack.children.length < repeatCount) {
        marqueeTrack.appendChild(marqueeRepeat.cloneNode(true));
      }
      lastRepeatCount = repeatCount;
    }
  };

  const scheduleMarqueeUpdate = () => {
    if (framePending) return;
    framePending = true;
    requestFrame(updateMarquee);
  };

  scheduleMarqueeUpdate();

  if (typeof ResizeObserver === 'function') {
    const marqueeObserver = new ResizeObserver(scheduleMarqueeUpdate);
    marqueeObserver.observe(marquee);
  } else {
    window.addEventListener('resize', scheduleMarqueeUpdate, { passive: true });
  }

  if (document.fonts) {
    document.fonts.ready.then(scheduleMarqueeUpdate);
    if (typeof document.fonts.addEventListener === 'function') {
      document.fonts.addEventListener('loadingdone', scheduleMarqueeUpdate);
    }
  }
}
