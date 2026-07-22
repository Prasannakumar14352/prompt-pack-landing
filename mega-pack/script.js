/* ══════════════════════════════════════════════════════════
   100,000+ AI Mega Prompts Pack — ProdXStore
   CONFIG — every editable price/link lives here.
   ══════════════════════════════════════════════════════════ */
const CFG = {
  TIERS: {
    starter: { label: 'Starter Pack', url: '[STARTER_PAYMENT_PAGE_URL]' },
    pro: { label: 'Pro Pack', url: '[PRO_PAYMENT_PAGE_URL]' },
    reseller: { label: 'Reseller Pack', url: '[RESELLER_PAYMENT_PAGE_URL]' },
  },
  // Per-visitor launch-price countdown, in minutes. The deadline is set the
  // moment a visitor first lands and persisted in localStorage, so it keeps
  // counting down across refreshes instead of resetting to this value every
  // reload — that's what makes fake timers obvious.
  LAUNCH_WINDOW_MINUTES: 105,
  SUPPORT_EMAIL: 'Prodxstoresupport@gmail.com',
  INSTAGRAM: '[INSTAGRAM]',
  YOUTUBE: '[YOUTUBE]',
};

/* ── FAQ ACCORDION ────────────────────────────────────────── */
function initFaq() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.faq-item').classList.toggle('open');
    });
  });
}

/* ── CATEGORY FILTER PILLS ────────────────────────────────── */
function initFilters() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.cat-card');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const tool = pill.dataset.tool;
      cards.forEach(card => {
        const tools = (card.dataset.tools || '').split(',');
        card.classList.toggle('hide', tool !== 'all' && !tools.includes(tool));
      });
    });
  });
}

/* ── COPY PROMPT BUTTONS ──────────────────────────────────── */
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.code-card');
      const text = card.querySelector('.code-body').innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      const original = btn.textContent;
      btn.textContent = 'Copied ✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1800);
    });
  });
}

/* ── COUNT-UP COUNTERS ────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { el.textContent = target.toLocaleString() + suffix; return; }
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(el => io.observe(el));
}

/* ── SCROLL REVEAL ────────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}

/* ── MOBILE STICKY BAR ────────────────────────────────────── */
function initStickyBar() {
  const bar = document.getElementById('sticky-bar');
  const hero = document.querySelector('.hero');
  if (!bar || !hero) return;
  const trigger = () => hero.offsetTop + hero.offsetHeight;
  window.addEventListener('scroll', () => {
    bar.style.display = window.scrollY > trigger() ? 'flex' : 'none';
  }, { passive: true });
}

/* ── PER-VISITOR LAUNCH COUNTDOWN (HH:MM:SS, persisted in localStorage) ──── */
function initCountdown() {
  const STORAGE_KEY = 'prodx_launch_deadline';

  // First visit: set deadline = now + LAUNCH_WINDOW_MINUTES and persist it.
  // Every later visit/refresh reads the SAME stored deadline, so the timer
  // keeps counting down instead of resetting — that's the whole point.
  let deadline = +localStorage.getItem(STORAGE_KEY);
  if (!deadline || isNaN(deadline)) {
    deadline = Date.now() + CFG.LAUNCH_WINDOW_MINUTES * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(deadline));
  }

  // Both timer instances on the page (hero + final CTA) get updated together.
  const instances = [
    { h: document.getElementById('ht-h'),  m: document.getElementById('ht-m'),  s: document.getElementById('ht-s'),  label: document.getElementById('hero-timer-label') },
    { h: document.getElementById('cd-h'),  m: document.getElementById('cd-m'),  s: document.getElementById('cd-s'),  label: document.getElementById('final-cd-label') },
  ].filter(inst => inst.h && inst.m && inst.s);
  if (!instances.length) return;

  const pad = n => String(n).padStart(2, '0');
  const EXPIRED_LABEL = 'Launch price ending — grab it now';
  let expired = false;
  let timer;

  function tick() {
    const diff = Math.max(0, deadline - Date.now());
    const h = pad(Math.floor(diff / 3600000));
    const m = pad(Math.floor(diff % 3600000 / 60000));
    const s = pad(Math.floor(diff % 60000 / 1000));
    instances.forEach(inst => {
      inst.h.textContent = h;
      inst.m.textContent = m;
      inst.s.textContent = s;
    });
    // Stop at 00:00:00 and swap the label — buy buttons are never disabled.
    if (diff <= 0 && !expired) {
      expired = true;
      instances.forEach(inst => { if (inst.label) inst.label.textContent = EXPIRED_LABEL; });
      clearInterval(timer);
    }
  }
  tick();
  timer = setInterval(tick, 1000);
}

/* ── SMOOTH SCROLL TO SECTION ─────────────────────────────── */
function goTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
window.goTo = goTo;

/* ── RAZORPAY PAYMENT PAGE REDIRECT ───────────────────────── */
function payWithRazorpay(tierKey) {
  const tier = CFG.TIERS[tierKey];
  if (!tier) return;
  window.location.href = tier.url;
}
window.payWithRazorpay = payWithRazorpay;

document.addEventListener('DOMContentLoaded', () => {
  initFaq();
  initFilters();
  initCopyButtons();
  initCounters();
  initReveal();
  initStickyBar();
  initCountdown();
});
