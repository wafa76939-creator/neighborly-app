import { mount, escapeHtml, initials, animateNumber } from '../utils/dom.js';
import { appShell, bindShell, requireAuth } from '../ui/layout.js';
import { api } from '../api/client.js';
import { formatDate, STATUSES } from '../utils/format.js';
import { createMap, addClusteredReports } from '../map/map.js';
import { toast } from '../ui/toast.js';
import { getUser } from '../auth/session.js';
import { errorState } from '../components/issueCard.js';

export const renderIssue = async (root, id) => {
  if (!requireAuth()) return;
  mount(root, appShell('#/explore', `<div class="skeleton" style="height:280px"></div>`, 'Issue'));
  bindShell();
  try {
    const report = await api.report(id);
    const user = getUser();
    const mine = String(report.reportedBy?._id) === String(user.id);
    mount(root, appShell('#/explore', `
      <a href="#/explore">← Explore</a>
      <div class="meta" style="margin:12px 0">
        <span class="badge cat-${report.category}">${report.category}</span>
        <span class="badge status-${report.status}">${report.status}</span>
      </div>
      <h1>${escapeHtml(report.title)}</h1>
      <p>${escapeHtml(report.address)} · ${formatDate(report.occurredAt)} · ${escapeHtml(report.reportedBy?.name || 'Neighbor')}</p>
      ${report.similarNearby ? `<p class="hint">${report.similarNearby} similar reports were found nearby.</p>` : ''}
      <div class="two-col" style="margin-top:18px">
        <section class="card" style="padding:20px">
          ${report.photoUrl ? `<img src="${escapeHtml(report.photoUrl)}" alt="" style="border-radius:16px;margin-bottom:14px;max-height:320px;object-fit:cover;width:100%">` : ''}
          <p>${escapeHtml(report.description)}</p>
          ${mine ? `<div class="field" style="margin-top:16px"><label>Status</label><select id="status">${STATUSES.map((s) => `<option ${s === report.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div>` : ''}
        </section>
        <div id="issue-map" class="map-md"></div>
      </div>
      <section class="same-here" style="margin-top:18px">
        <h2>Have you experienced this too?</h2>
        <p><b id="same-count">${report.upvoteCount}</b> neighbors experienced this</p>
        <button class="btn xl ${report.hasUpvoted ? 'danger' : ''}" id="same-btn">${report.hasUpvoted ? 'Confirmed' : 'Same here'}</button>
      </section>
      <section class="card" style="padding:20px;margin-top:18px">
        <h2>Comments</h2>
        <div id="comments">
          ${report.comments.length ? report.comments.map((c) => `
            <div class="comment">
              <div class="avatar">${initials(c.userId?.name || 'N')}</div>
              <div>
                <strong>${escapeHtml(c.userId?.name || 'Neighbor')}</strong>
                <div class="muted">${formatDate(c.createdAt)}</div>
                <p>${escapeHtml(c.text)}</p>
              </div>
            </div>
          `).join('') : '<p class="muted">No comments yet.</p>'}
        </div>
        <form id="cform" class="filters" style="margin-top:12px">
          <input name="text" required placeholder="Add a short comment" style="flex:1" />
          <button class="btn" type="submit">Post</button>
        </form>
      </section>
      <p style="margin-top:16px"><a class="btn secondary" href="#/hotspot/${encodeURIComponent(report.address)}">View location pattern</a></p>
    `, report.title));
    bindShell();
    const map = createMap('issue-map', { center: [report.location.lat, report.location.lng], zoom: 16 });
    addClusteredReports(map, [report], new Set());
    document.getElementById('same-btn').addEventListener('click', async () => {
      const updated = await api.sameHere(id);
      animateNumber(document.getElementById('same-count'), updated.upvoteCount, 400);
      toast(updated.hasUpvoted ? 'Your confirmation was added.' : 'Confirmation removed.');
      document.getElementById('same-btn').textContent = updated.hasUpvoted ? 'Confirmed' : 'Same here';
      document.getElementById('same-btn').classList.toggle('danger', updated.hasUpvoted);
    });
    document.getElementById('cform').addEventListener('submit', async (e) => {
      e.preventDefault();
      await api.comment(id, e.target.text.value);
      toast('Comment posted');
      renderIssue(root, id);
    });
    document.getElementById('status')?.addEventListener('change', async (e) => {
      await api.updateStatus(id, e.target.value);
      toast('Report updated');
      renderIssue(root, id);
    });
  } catch (err) {
    mount(root, appShell('#/explore', errorState(err.message), 'Issue'));
    bindShell();
    document.getElementById('retry')?.addEventListener('click', () => renderIssue(root, id));
  }
};
