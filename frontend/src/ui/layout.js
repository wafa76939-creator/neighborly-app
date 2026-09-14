import { logoSvg } from './logo.js';
import { getUser, clearSession, isAuthed } from '../auth/session.js';
import { toast } from './toast.js';

const navItems = [
  { href: '#/overview', icon: 'layout-dashboard', label: 'Overview' },
  { href: '#/explore', icon: 'map', label: 'Explore' },
  { href: '#/report', icon: 'plus', label: 'Report Issue', special: true },
  { href: '#/hotspots', icon: 'flame', label: 'Hotspots' },
  { href: '#/mine', icon: 'folder', label: 'My Reports' },
];

export const appShell = (active, content, title = '') => {
  const user = getUser();
  return `
    <aside class="sidebar">
      <a class="brand" href="#/overview">${logoSvg} Neighborly</a>
      <nav class="nav-list">
        ${navItems.map((item) => `
          <a class="${item.special ? 'report-link' : ''} ${active === item.href ? 'active' : ''}" href="${item.href}">
            <i data-lucide="${item.icon}"></i> ${item.label}
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-bottom">
        <a href="#/profile"><i data-lucide="user"></i> ${user?.name || 'Profile'}</a>
        <a href="#/settings"><i data-lucide="settings"></i> Settings</a>
        <button type="button" id="logout-btn"><i data-lucide="log-out"></i> Logout</button>
      </div>
    </aside>
    <div class="app-shell">
      <header class="app-header">
        <div>
          <div class="muted" style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Neighborly</div>
          <strong>${title}</strong>
        </div>
        <div class="muted">${user?.email || ''}</div>
      </header>
      <main class="app-main page-enter">${content}</main>
    </div>
    <nav class="bottom-nav">
      <a class="${active === '#/overview' ? 'active' : ''}" href="#/overview"><i data-lucide="home"></i>Home</a>
      <a class="${active === '#/explore' ? 'active' : ''}" href="#/explore"><i data-lucide="map"></i>Explore</a>
      <a class="report" href="#/report"><i data-lucide="plus"></i></a>
      <a class="${active === '#/hotspots' ? 'active' : ''}" href="#/hotspots"><i data-lucide="flame"></i>Hotspots</a>
      <a class="${active === '#/profile' ? 'active' : ''}" href="#/profile"><i data-lucide="user"></i>Profile</a>
    </nav>
  `;
};

export const bindShell = () => {
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearSession();
    toast('Logged out');
    location.hash = '#/';
  });
};

export const requireAuth = () => {
  if (!isAuthed()) {
    location.hash = '#/login';
    return false;
  }
  return true;
};
