import { mount } from '../utils/dom.js';
import { appShell, bindShell, requireAuth } from '../ui/layout.js';
import { api } from '../api/client.js';
import { CATEGORIES, STATUSES } from '../utils/format.js';
import { createMap, addClusteredReports, destroyMaps } from '../map/map.js';
import { issueCard, bindCards, emptyState, errorState } from '../components/issueCard.js';

export const renderExplore = async (root) => {
  if (!requireAuth()) return;
  mount(root, appShell('#/explore', `<div class="skeleton" style="height:320px"></div>`, 'Explore neighborhood'));
  bindShell();

  const draw = async () => {
    const category = document.getElementById('ex-cat')?.value || '';
    const status = document.getElementById('ex-status')?.value || '';
    const range = document.getElementById('ex-range')?.value || '';
    const search = document.getElementById('ex-search')?.value || '';
    const sort = document.getElementById('ex-sort')?.value || 'newest';
    const view = document.getElementById('ex-view')?.value || 'split';
    const params = { category, status, search };
    if (range) {
      const days = Number(range);
      params.from = new Date(Date.now() - days * 86400000).toISOString();
    }
    try {
      destroyMaps();
      const [reports, hotspots] = await Promise.all([api.reports(params), api.hotspots()]);
      const hotSet = new Set((hotspots.hotspots || []).map((h) => h.normalizedAddress));
      let list = [...reports];
      if (sort === 'confirmed') list.sort((a, b) => b.upvoteCount - a.upvoteCount);
      if (sort === 'hotspots') list.sort((a, b) => Number(hotSet.has(b.normalizedAddress)) - Number(hotSet.has(a.normalizedAddress)));
      const listHtml = list.length
        ? list.map((r) => issueCard(r, hotSet.has(r.normalizedAddress) ? '<span class="badge hot-badge">HOTSPOT</span>' : '')).join('')
        : emptyState('No reports yet', 'Be the first neighbor to make an issue visible.');
      document.getElementById('ex-list').innerHTML = listHtml;
      document.getElementById('ex-insight').textContent = `${hotspots.count} hotspots detected this month.`;
      bindCards(document.getElementById('ex-list'));
      const mapEl = document.getElementById('ex-map');
      mapEl.style.display = view === 'list' ? 'none' : 'block';
      document.getElementById('ex-list').style.display = view === 'map' ? 'none' : 'grid';
      mapEl.innerHTML = '';
      if (view !== 'list') {
        const map = createMap('ex-map');
        addClusteredReports(map, list, hotSet);
      }
    } catch (err) {
      document.getElementById('ex-list').innerHTML = errorState(err.message);
    }
  };

  mount(root, appShell('#/explore', `
    <h1>Explore neighborhood</h1>
    <p>Search reports, streets or issues. ${''}</p>
    <p class="muted" id="ex-insight" style="margin:8px 0 16px"></p>
    <div class="filters">
      <div class="search" style="flex:1;min-width:220px"><i data-lucide="search"></i><input id="ex-search" placeholder="Search reports, streets or issues..." /></div>
      <select id="ex-cat"><option value="">All</option>${CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
      <select id="ex-status"><option value="">All statuses</option>${STATUSES.map((s) => `<option>${s}</option>`).join('')}</select>
      <select id="ex-range">
        <option value="">Any date</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
      <select id="ex-sort">
        <option value="newest">Newest</option>
        <option value="confirmed">Most confirmed</option>
        <option value="hotspots">Hotspots</option>
      </select>
      <select id="ex-view">
        <option value="split">Map + list</option>
        <option value="map">Map</option>
        <option value="list">List</option>
      </select>
    </div>
    <div class="two-col" style="margin-top:16px">
      <div id="ex-map" class="map-lg"></div>
      <div class="list" id="ex-list"></div>
    </div>
  `, 'Explore neighborhood'));
  bindShell();
  ['ex-cat', 'ex-status', 'ex-range', 'ex-sort', 'ex-view'].forEach((id) => {
    document.getElementById(id).addEventListener('change', draw);
  });
  document.getElementById('ex-search').addEventListener('input', () => {
    clearTimeout(window.__exT);
    window.__exT = setTimeout(draw, 250);
  });
  draw();
};
