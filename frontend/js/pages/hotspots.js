import { mount, escapeHtml } from '../utils/dom.js';
import { appShell, bindShell, requireAuth } from '../ui/layout.js';
import { api } from '../api/client.js';
import { trendLabel, formatDate } from '../utils/format.js';
import { doughnutChart, lineChart } from '../charts/charts.js';
import { issueCard, bindCards, emptyState, errorState } from '../components/issueCard.js';

export const renderHotspots = async (root) => {
  if (!requireAuth()) return;
  mount(root, appShell('#/hotspots', `<div class="skeleton" style="height:240px"></div>`, 'Hotspots'));
  bindShell();
  try {
    const data = await api.hotspots();
    mount(root, appShell('#/hotspots', `
      <h1>Neighborhood hotspots</h1>
      <p>Places where repeated reports reveal a pattern.</p>
      <div class="cats" style="margin-top:18px">
        ${data.hotspots.length ? data.hotspots.map((h) => `
          <a class="card" style="padding:18px;display:block" href="#/hotspot/${encodeURIComponent(h.address)}">
            <span class="badge hot-badge">HOTSPOT</span>
            <h3 style="margin:10px 0 6px">${escapeHtml(h.address)}</h3>
            <div class="meta">${h.reportsLast30Days} last 30 days · ${h.totalReports} total</div>
            <div class="meta">${h.topCategory || 'Mixed'} dominant · ${trendLabel(h.trend)}</div>
          </a>
        `).join('') : emptyState('No hotspots yet', 'Patterns appear when a location reaches 5 reports in 30 days.')}
      </div>
    `, 'Hotspots'));
    bindShell();
  } catch (err) {
    mount(root, appShell('#/hotspots', errorState(err.message), 'Hotspots'));
    bindShell();
    document.getElementById('retry')?.addEventListener('click', () => renderHotspots(root));
  }
};

export const renderHotspot = async (root, address) => {
  if (!requireAuth()) return;
  mount(root, appShell('#/hotspots', `<div class="skeleton" style="height:320px"></div>`, 'Hotspot'));
  bindShell();
  try {
    const data = await api.hotspot(address);
    mount(root, appShell('#/hotspots', `
      <a href="#/hotspots">← All hotspots</a>
      <div class="meta" style="margin-top:12px">${data.isHotspot ? '<span class="badge hot-badge">HOTSPOT</span>' : ''}<span class="badge cat-${data.topCategory}">${data.topCategory || ''}</span></div>
      <h1>${escapeHtml(data.address)}</h1>
      <p>${data.reportsLast30Days} reports in the last 30 days</p>
      ${data.isHotspot ? `<div class="hot-banner">${data.topCategory} reports account for ${data.topCategoryShare}% of activity here.</div>` : ''}
      <div class="dash-stats">
        <div class="card stat-card"><div><b>${data.totalReports}</b><span>Total reports</span></div></div>
        <div class="card stat-card"><div><b>${data.reportsLast30Days}</b><span>Last 30 days</span></div></div>
        <div class="card stat-card"><div><b>${data.confirmationCount}</b><span>Confirmations</span></div></div>
        <div class="card stat-card"><div><b>${data.topCategory || '—'}</b><span>Top category</span></div></div>
      </div>
      <div class="insight" style="margin:16px 0">
        <h3>Pattern detected</h3>
        <p>${escapeHtml(data.insight)}</p>
      </div>
      <div class="two-col">
        <div class="card" style="padding:16px;height:320px"><canvas id="time-chart"></canvas></div>
        <div class="card" style="padding:16px;height:320px"><canvas id="cat-chart"></canvas></div>
      </div>
      <h2 style="margin:22px 0 10px">Activity timeline</h2>
      <ul class="timeline card" style="padding:16px 18px">
        ${data.reports.map((r, i) => `
          <li>
            <i></i>
            <div>
              <strong>${formatDate(r.createdAt)} · ${r.category}</strong>
              <p>${escapeHtml(r.title)}</p>
              ${data.crossedOn && new Date(r.createdAt).toISOString() === new Date(data.crossedOn).toISOString() ? '<span class="badge hot-badge">Hotspot detected</span>' : ''}
            </div>
          </li>
        `).join('')}
      </ul>
      <h2 style="margin:22px 0 10px">Reports at this location</h2>
      <div class="list" id="hot-list">${data.reports.slice().reverse().map((r) => issueCard(r)).join('')}</div>
    `, data.address));
    bindShell();
    bindCards(document.getElementById('hot-list'));
    lineChart(document.getElementById('time-chart'), data.timeline.map((p) => p.date), data.timeline.map((p) => p.count), data.hotspotThreshold);
    doughnutChart(document.getElementById('cat-chart'), data.categoryBreakdown);
  } catch (err) {
    mount(root, appShell('#/hotspots', errorState(err.message), 'Hotspot'));
    bindShell();
    document.getElementById('retry')?.addEventListener('click', () => renderHotspot(root, address));
  }
};
