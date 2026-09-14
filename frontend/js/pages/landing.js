import { mount, animateNumber, escapeHtml } from '../utils/dom.js';
import { logoSvg } from '../ui/logo.js';
import { api } from '../api/client.js';
import { createMap, addClusteredReports } from '../map/map.js';
import { categoryCopy, CATEGORIES } from '../utils/format.js';
import { isAuthed } from '../auth/session.js';

export const renderLanding = async (root) => {
  mount(root, `
    <div class="page-enter">
      <nav class="landing-nav">
        <a class="brand" href="#/" style="color:var(--ink)">${logoSvg} Neighborly</a>
        <div style="display:flex;gap:8px">
          <a class="btn secondary" href="#/login">Log in</a>
          <a class="btn" href="#/register">Get started</a>
        </div>
      </nav>
      <section class="hero">
        <div>
          <div class="kicker">See the issue. Find the pattern. Improve the neighborhood.</div>
          <h1>Your neighborhood has a story. Let's make it visible.</h1>
          <p style="margin-top:16px;max-width:46ch">Report local issues, see what your neighbors are experiencing, and turn individual complaints into patterns that can drive real action.</p>
          <div class="hero-actions">
            <a class="btn xl" href="${isAuthed() ? '#/report' : '#/login'}">Report an Issue</a>
            <a class="btn secondary xl" href="${isAuthed() ? '#/explore' : '#/login'}">Explore Neighborhood</a>
          </div>
        </div>
        <div class="hero-map">
          <div id="landing-map" class="map"></div>
          <div class="float-card a" id="float-a">12 reports this month</div>
          <div class="float-card b">Hotspot detected</div>
          <div class="float-card c" id="float-c">8 neighbors confirmed</div>
        </div>
      </section>
      <section class="section">
        <h2>Community impact</h2>
        <p>One report is an anecdote. Together they become evidence.</p>
        <div class="stats-row" style="margin-top:22px">
          <div class="card stat-card"><div><b id="c1">0</b><span>Total reports</span></div></div>
          <div class="card stat-card"><div><b id="c2">0</b><span>Active hotspots</span></div></div>
          <div class="card stat-card"><div><b id="c3">0</b><span>Community confirmations</span></div></div>
          <div class="card stat-card"><div><b id="c4">0</b><span>Issues resolved</span></div></div>
        </div>
      </section>
      <section class="section">
        <h2>How it works</h2>
        <div class="three" style="margin-top:22px">
          <article class="card" style="padding:22px"><div class="muted">01</div><h3>Report</h3><p>Tell your neighborhood what happened.</p></article>
          <article class="card" style="padding:22px"><div class="muted">02</div><h3>Confirm</h3><p>See an issue you've experienced? Say Same here.</p></article>
          <article class="card" style="padding:22px"><div class="muted">03</div><h3>Discover</h3><p>Repeated reports reveal patterns that individual complaints can't.</p></article>
        </div>
      </section>
      <section class="section">
        <h2>Spot the pattern</h2>
        <p>A complaint becomes a pattern.</p>
        <div class="story">
          <span class="story-dot"></span>
          <span class="story-dot"></span>
          <span class="story-dot"></span>
          <span class="story-dot"></span>
          <span class="story-dot"></span>
          <span class="muted">grouped</span>
          <div class="story-box">5+ reports in 30 days</div>
          <div class="story-box" style="background:var(--red-soft);color:var(--red)">HOTSPOT</div>
        </div>
      </section>
      <section class="section">
        <h2>Explore your neighborhood</h2>
        <div class="cats" id="cat-cards" style="margin-top:22px"></div>
      </section>
      <section class="cta-band">
        <h2>Your experience matters. Make it visible.</h2>
        <p>Log what you see. Confirm what you've felt. Watch the pattern appear.</p>
        <a class="btn xl" href="${isAuthed() ? '#/report' : '#/register'}">Report an Issue</a>
      </section>
    </div>
  `);

  try {
    const [stats, reports, hotspots] = await Promise.all([
      api.dashboardStats(),
      api.reports(),
      api.hotspots(),
    ]);
    animateNumber(document.getElementById('c1'), stats.totalReports);
    animateNumber(document.getElementById('c2'), stats.hotspots);
    animateNumber(document.getElementById('c3'), stats.confirmations);
    animateNumber(document.getElementById('c4'), stats.resolved);
    document.getElementById('float-a').textContent = `${stats.reportsThisMonth} reports this month`;
    document.getElementById('float-c').textContent = `${stats.confirmations} neighbors confirmed`;
    const counts = {};
    reports.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    document.getElementById('cat-cards').innerHTML = CATEGORIES.map((cat) => `
      <article class="card" style="padding:18px">
        <h3>${cat}</h3>
        <p>${categoryCopy[cat]}</p>
        <div class="meta" style="margin-top:10px">${counts[cat] || 0} reports</div>
      </article>
    `).join('');
    const map = createMap('landing-map', { zoom: 15 });
    const hotSet = new Set((hotspots.hotspots || []).map((h) => h.normalizedAddress));
    addClusteredReports(map, reports, hotSet);
  } catch {
    document.getElementById('cat-cards').innerHTML = CATEGORIES.map((cat) => `
      <article class="card" style="padding:18px"><h3>${cat}</h3><p>${categoryCopy[cat]}</p></article>
    `).join('');
  }
};
