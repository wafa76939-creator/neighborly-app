import { destroyMaps } from './map/map.js';
import { destroyCharts } from './charts/charts.js';
import { renderLanding } from './pages/landing.js';
import { renderLogin, renderRegister } from './pages/authPages.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderExplore } from './pages/explore.js';
import { renderReport } from './pages/report.js';
import { renderIssue } from './pages/issue.js';
import { renderHotspots, renderHotspot } from './pages/hotspots.js';
import { renderMine, renderProfile, renderSettings } from './pages/account.js';
import { isAuthed } from './auth/session.js';

const root = document.getElementById('app');

const parse = () => {
  const raw = (location.hash || '#/').replace(/^#/, '');
  const parts = raw.split('/').filter(Boolean);
  return { parts, path: `/${parts.join('/')}` || '/' };
};

const render = async () => {
  destroyMaps();
  destroyCharts();
  const { parts } = parse();
  const name = parts[0] || '';
  if (!name) return renderLanding(root);
  if (name === 'login') return renderLogin(root);
  if (name === 'register') return renderRegister(root);
  if (!isAuthed()) {
    location.hash = '#/login';
    return;
  }
  if (name === 'overview') return renderDashboard(root);
  if (name === 'explore') return renderExplore(root);
  if (name === 'report') return renderReport(root);
  if (name === 'issue' && parts[1]) return renderIssue(root, parts[1]);
  if (name === 'hotspots') return renderHotspots(root);
  if (name === 'hotspot' && parts[1]) {
    return renderHotspot(root, decodeURIComponent(parts.slice(1).join('/')));
  }
  if (name === 'mine') return renderMine(root);
  if (name === 'profile') return renderProfile(root);
  if (name === 'settings') return renderSettings(root);
  return renderDashboard(root);
};

window.addEventListener('hashchange', render);
render();
