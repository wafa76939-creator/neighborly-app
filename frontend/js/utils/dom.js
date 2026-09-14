export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const html = (strings, ...values) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');

export const mount = (root, markup) => {
  root.innerHTML = markup;
  if (window.lucide) window.lucide.createIcons({ attrs: { width: 18, height: 18 } });
};

export const animateNumber = (el, to, duration = 700) => {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(t * to);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

export const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
