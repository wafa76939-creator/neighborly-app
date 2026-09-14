import { mount, animateNumber, escapeHtml } from '../utils/dom.js';
import { appShell, bindShell, requireAuth } from '../ui/layout.js';
import { api } from '../api/client.js';
import { getUser } from '../auth/session.js';
import { greeting, trendLabel, timeAgo } from '../utils/format.js';
import { createMap, addClusteredReports } from '../map/map.js';
import { issueCard, bindCards, errorState } from '../components/issueCard.js';

export const renderDashboard = async (root) => {
  if (!requireAuth()) return;
  const user = getUser();
  mount(root, appShell('#/overview', `
    <div class="skeleton" style="height:220px"></div>
  `, `${greeting()}, ${user.name}`));
  bindShell();

  try {
    const [stats, activity, reports, hotspots] = await Promise.all([
      api.dashboardStats(),
      api.dashboardActivity(),
      api.reports(),
      api.hotspots(),
    ]);
    mount(root, appShell('#/overview', `
      <div class="hero" style="padding:0;grid-template-columns:1fr auto;margin-bottom:18px">
        <div>
          <h1>${greeting()}, ${escapeHtml(user.name)}</h1>
          <p>Here's what's happening around your neighborhood.</p>
        </div>
        <select id="hood" aria-label="Neighborhood">
          <option>Springfield</option>
        </select>
      </div>
      <div class="dash-stats">
        <div class="card stat-card"><div><b id="s1">0</b><span>Total reports</span><small>${trendLabel(stats.trends.totalReports)} this month</small></div><div class="icon-wrap"><i data-lucide="files"></i></div></div>
        <div class="card stat-card"><div><b id="s2">0</b><span>Active issues</span></div><div class="icon-wrap"><i data-lucide="circle-dot"></i></div></div>
        <div class="card stat-card"><div><b id="s3">0</b><span>Hotspots</span><small>${stats.hotspots} flagged</small></div><div class="icon-wrap"><i data-lucide="flame"></i></div></div>
        <div class="card stat-card"><div><b id="s4">0</b><span>Resolved</span></div><div class="icon-wrap"><i data-lucide="check-circle-2"></i></div></div>
      </div>
      <div class="two-col" style="margin-top:18px">
        <section>
          <h2>Neighborhood activity</h2>
          <div id="dash-map" class="map-lg" style="margin-top:12px"></div>
        </section>
        <section>
          <h2>Trending hotspots</h2>
          <div class="list" style="margin-top:12px">
            ${activity.trending.slice(0, 5).map((h) => `
              <a class="card" style="padding:14px;display:block" href="#/hotspot/${encodeURIComponent(h.address)}">
                <div class="meta">${h.isHotspot ? '<span class="badge hot-badge">HOTSPOT</span>' : ''}<span class="badge cat-${h.topCategory}">${h.topCategory || ''}</span></div>
                <h3 style="margin-top:8px">${escapeHtml(h.address)}</h3>
                <div class="meta">${h.reportsLast30Days} last 30 days · ${trendLabel(h.trend)}</div>
              </a>
            `).join('')}
          </div>
        </section>
      </div>
      <h2 style="margin-top:22px">Recent reports</h2>
      <div class="list" id="recent" style="margin-top:12px">
        ${activity.recent.map((r) => issueCard(r)).join('')}
      </div>
    `, `${greeting()}, ${user.name}`));
    bindShell();
    bindCards(document.getElementById('recent'));
    animateNumber(document.getElementById('s1'), stats.totalReports);
    animateNumber(document.getElementById('s2'), stats.activeIssues);
    animateNumber(document.getElementById('s3'), stats.hotspots);
    animateNumber(document.getElementById('s4'), stats.resolved);
    const map = createMap('dash-map');
    const hotSet = new Set((hotspots.hotspots || []).map((h) => h.normalizedAddress));
    addClusteredReports(map, reports, hotSet);
  } catch (err) {
    mount(root, appShell('#/overview', errorState(err.message), 'Overview'));
    bindShell();
    document.getElementById('retry')?.addEventListener('click', () => renderDashboard(root));
  }
};
