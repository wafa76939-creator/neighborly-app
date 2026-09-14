import { escapeHtml, initials } from '../utils/dom.js';
import { timeAgo } from '../utils/format.js';

export const issueCard = (report, extra = '') => `
  <article class="card clickable issue-card" data-id="${report._id}">
    <div class="top">
      <span class="badge cat-${report.category}">${report.category}</span>
      <span class="badge status-${report.status}">${report.status}</span>
    </div>
    <h3>${escapeHtml(report.title)}</h3>
    <p class="muted">${escapeHtml(report.address)}</p>
    <div class="meta">
      <span>${timeAgo(report.occurredAt)}</span>
      <span>${report.upvoteCount} same here</span>
      <span class="avatar" title="${escapeHtml(report.reportedBy?.name || '')}">${initials(report.reportedBy?.name || 'N')}</span>
      ${extra}
    </div>
  </article>
`;

export const bindCards = (root) => {
  root.querySelectorAll('[data-id]').forEach((card) => {
    card.addEventListener('click', () => {
      location.hash = `#/issue/${card.dataset.id}`;
    });
  });
};

export const emptyState = (title, body, href = '#/report', cta = 'Report an Issue') => `
  <div class="empty">
    <h3>${title}</h3>
    <p>${body}</p>
    <p style="margin-top:16px"><a class="btn" href="${href}">${cta}</a></p>
  </div>
`;

export const errorState = (body, retryId = 'retry') => `
  <div class="error-box">
    <h3>Something went wrong</h3>
    <p>${escapeHtml(body)}</p>
    <p style="margin-top:16px"><button class="btn" id="${retryId}">Try again</button></p>
  </div>
`;

export const skeletonList = () => `
  <div class="list">
    ${[1, 2, 3].map(() => '<div class="skeleton" style="height:110px"></div>').join('')}
  </div>
`;
