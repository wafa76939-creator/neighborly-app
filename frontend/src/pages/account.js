import { mount, escapeHtml, initials, animateNumber } from '../utils/dom.js';
import { appShell, bindShell, requireAuth } from '../ui/layout.js';
import { api } from '../api/client.js';
import { getUser, clearSession } from '../auth/session.js';
import { formatDate, STATUSES } from '../utils/format.js';
import { issueCard, bindCards, emptyState, errorState } from '../components/issueCard.js';
import { toast } from '../ui/toast.js';

export const renderMine = async (root) => {
  if (!requireAuth()) return;
  mount(root, appShell('#/mine', `<div class="skeleton" style="height:200px"></div>`, 'My reports'));
  bindShell();
  try {
    const reports = await api.myReports();
    const draw = (status = 'all') => {
      const list = status === 'all' ? reports : reports.filter((r) => r.status === status);
      document.getElementById('mine-list').innerHTML = list.length
        ? list.map((r) => issueCard(r)).join('')
        : emptyState('No reports yet', 'Be the first neighbor to make an issue visible.');
      bindCards(document.getElementById('mine-list'));
      document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.status === status));
    };
    mount(root, appShell('#/mine', `
      <h1>My reports</h1>
      <p>Issues you made visible.</p>
      <div class="tabs" style="margin:16px 0">
        <button data-status="all" class="active">All</button>
        ${STATUSES.map((s) => `<button data-status="${s}">${s}</button>`).join('')}
      </div>
      <div class="list" id="mine-list"></div>
    `, 'My reports'));
    bindShell();
    document.querySelectorAll('.tabs button').forEach((btn) => {
      btn.addEventListener('click', () => draw(btn.dataset.status));
    });
    draw();
  } catch (err) {
    mount(root, appShell('#/mine', errorState(err.message), 'My reports'));
    bindShell();
    document.getElementById('retry')?.addEventListener('click', () => renderMine(root));
  }
};

export const renderProfile = async (root) => {
  if (!requireAuth()) return;
  mount(root, appShell('#/profile', `<div class="skeleton" style="height:200px"></div>`, 'Profile'));
  bindShell();
  try {
    const data = await api.me();
    mount(root, appShell('#/profile', `
      <div class="card" style="padding:24px;display:flex;gap:16px;align-items:center">
        <div class="avatar" style="width:64px;height:64px;font-size:22px">${initials(data.user.name)}</div>
        <div>
          <h1>${escapeHtml(data.user.name)}</h1>
          <p>${escapeHtml(data.user.email)}</p>
          <p class="muted">Joined ${formatDate(data.user.createdAt)}</p>
        </div>
      </div>
      <div class="dash-stats" style="margin-top:16px">
        <div class="card stat-card"><div><b id="p1">0</b><span>Reports submitted</span></div></div>
        <div class="card stat-card"><div><b id="p2">0</b><span>Same-here confirmations</span></div></div>
        <div class="card stat-card"><div><b id="p3">0</b><span>Comments</span></div></div>
        <div class="card stat-card"><div><b id="p4">0</b><span>Resolved reports</span></div></div>
      </div>
    `, 'Profile'));
    bindShell();
    animateNumber(document.getElementById('p1'), data.stats.submitted);
    animateNumber(document.getElementById('p2'), data.stats.confirmed);
    animateNumber(document.getElementById('p3'), data.stats.commented);
    animateNumber(document.getElementById('p4'), data.stats.resolved);
  } catch (err) {
    mount(root, appShell('#/profile', errorState(err.message), 'Profile'));
    bindShell();
  }
};

export const renderSettings = (root) => {
  if (!requireAuth()) return;
  const user = getUser();
  mount(root, appShell('#/settings', `
    <h1>Settings</h1>
    <div class="card" style="padding:20px;margin-top:16px">
      <p>Signed in as <strong>${escapeHtml(user.email)}</strong></p>
      <p class="muted">Neighborhood notifications stay on this device for the demo.</p>
      <p style="margin-top:16px"><button class="btn danger" id="out">Log out</button></p>
    </div>
  `, 'Settings'));
  bindShell();
  document.getElementById('out').addEventListener('click', () => {
    clearSession();
    toast('Logged out');
    location.hash = '#/';
  });
};
