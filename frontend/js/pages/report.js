import { mount, escapeHtml } from '../utils/dom.js';
import { appShell, bindShell, requireAuth } from '../ui/layout.js';
import { api } from '../api/client.js';
import { CATEGORIES, categoryCopy } from '../utils/format.js';
import { createMap, addPicker, destroyMaps } from '../map/map.js';
import { toast } from '../ui/toast.js';

const state = {
  step: 1,
  category: '',
  title: '',
  description: '',
  occurredAt: '',
  address: '',
  lat: 40.7128,
  lng: -74.006,
  file: null,
};

export const renderReport = (root) => {
  if (!requireAuth()) return;
  state.step = 1;
  state.category = '';
  state.title = '';
  state.description = '';
  state.address = '';
  state.file = null;
  if (!state.occurredAt) {
    const d = new Date();
    state.occurredAt = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  draw(root);
};

const draw = (root) => {
  destroyMaps();
  const steps = ['What happened?', 'Where?', 'Add photo', 'Review'];
  mount(root, appShell('#/report', `
    <h1>Report an issue</h1>
    <p>Keep it specific. Neighbors can confirm it instead of filing a duplicate.</p>
    <div class="steps" style="margin:18px 0">${[1, 2, 3, 4].map((n) => `<span class="${n <= state.step ? 'on' : ''}"></span>`).join('')}</div>
    <p class="muted">${steps[state.step - 1]}</p>
    <div class="wizard" id="wizard"></div>
  `, 'Report issue'));
  bindShell();
  const box = document.getElementById('wizard');
  if (state.step === 1) stepOne(box, root);
  if (state.step === 2) stepTwo(box, root);
  if (state.step === 3) stepThree(box, root);
  if (state.step === 4) stepFour(box, root);
  if (state.step === 5) success(box);
};

const nav = (root, extra = '') => `
  <div style="display:flex;gap:8px;margin-top:12px">
    ${state.step > 1 ? '<button class="btn secondary" type="button" id="back">Back</button>' : ''}
    ${extra}
  </div>
`;

const stepOne = (box, root) => {
  box.innerHTML = `
    <div class="cat-grid">
      ${CATEGORIES.map((c) => `
        <button class="cat-choice ${state.category === c ? 'selected' : ''}" data-cat="${c}" type="button">
          <h3>${c}</h3><p class="muted">${categoryCopy[c]}</p>
        </button>
      `).join('')}
    </div>
    <div class="card" style="padding:18px">
      <div class="field"><label>Title</label><input id="title" maxlength="80" value="${escapeHtml(state.title)}" /></div>
      <div class="field"><label>Description</label><textarea id="desc">${escapeHtml(state.description)}</textarea></div>
      <div class="field"><label>When it occurred</label><input id="when" type="datetime-local" value="${state.occurredAt}" /></div>
    </div>
    ${nav(root, '<button class="btn" type="button" id="next">Continue</button>')}
    <p id="err" style="color:var(--red)"></p>
  `;
  box.querySelectorAll('[data-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.category = btn.dataset.cat;
      draw(root);
    });
  });
  document.getElementById('next').addEventListener('click', () => {
    state.title = document.getElementById('title').value.trim();
    state.description = document.getElementById('desc').value.trim();
    state.occurredAt = document.getElementById('when').value;
    if (!state.category || !state.title || !state.description || !state.occurredAt) {
      document.getElementById('err').textContent = 'Choose a category and complete every field.';
      return;
    }
    state.step = 2;
    draw(root);
  });
};

const stepTwo = (box, root) => {
  box.innerHTML = `
    <div class="two-col">
      <div>
        <div class="field"><label>Address</label><input id="address" value="${escapeHtml(state.address)}" placeholder="124 Main Street, Springfield" /></div>
        <p class="hint">Reports from this location will be grouped together.</p>
        ${nav(root, '<button class="btn" type="button" id="next">Continue</button>')}
        <p id="err" style="color:var(--red)"></p>
      </div>
      <div id="picker" class="map-lg"></div>
    </div>
  `;
  document.getElementById('back').addEventListener('click', () => { state.step = 1; draw(root); });
  const map = createMap('picker', { center: [state.lat, state.lng], zoom: 16 });
  addPicker(map, (lat, lng) => {
    state.lat = lat;
    state.lng = lng;
  }, [state.lat, state.lng]);
  document.getElementById('next').addEventListener('click', () => {
    state.address = document.getElementById('address').value.trim();
    if (!state.address) {
      document.getElementById('err').textContent = 'Add an address so reports can be grouped.';
      return;
    }
    state.step = 3;
    draw(root);
  });
};

const stepThree = (box, root) => {
  box.innerHTML = `
    <div class="dropzone" id="drop">
      <p>Drag a photo here or choose an image. Optional.</p>
      <input id="file" type="file" accept="image/*" hidden />
      <p><button class="btn secondary" type="button" id="pick">Choose image</button></p>
    </div>
    <div id="preview"></div>
    ${nav(root, '<button class="btn" type="button" id="next">Continue</button>')}
  `;
  const preview = () => {
    const el = document.getElementById('preview');
    if (!state.file) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="preview-wrap"><img src="${URL.createObjectURL(state.file)}" alt="Preview" /><button class="btn ghost" type="button" id="remove">Remove</button></div>`;
    document.getElementById('remove').addEventListener('click', () => { state.file = null; preview(); });
  };
  preview();
  document.getElementById('back').addEventListener('click', () => { state.step = 2; draw(root); });
  document.getElementById('pick').addEventListener('click', () => document.getElementById('file').click());
  document.getElementById('file').addEventListener('change', (e) => { state.file = e.target.files[0]; preview(); });
  const drop = document.getElementById('drop');
  drop.addEventListener('dragover', (e) => e.preventDefault());
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    state.file = e.dataTransfer.files[0];
    preview();
  });
  document.getElementById('next').addEventListener('click', () => { state.step = 4; draw(root); });
};

const stepFour = (box, root) => {
  box.innerHTML = `
    <div class="card" style="padding:20px">
      <span class="badge cat-${state.category}">${state.category}</span>
      <h2 style="margin:10px 0">${escapeHtml(state.title)}</h2>
      <p>${escapeHtml(state.description)}</p>
      <div class="meta" style="margin-top:12px">
        <span>${escapeHtml(state.address)}</span>
        <span>${escapeHtml(state.occurredAt.replace('T', ' '))}</span>
        <span>${state.file ? 'Photo attached' : 'No photo'}</span>
      </div>
    </div>
    ${nav(root, '<button class="btn xl" type="button" id="submit">Submit report</button>')}
    <p id="err" style="color:var(--red)"></p>
  `;
  document.getElementById('back').addEventListener('click', () => { state.step = 3; draw(root); });
  document.getElementById('submit').addEventListener('click', async () => {
    const btn = document.getElementById('submit');
    btn.disabled = true;
    const data = new FormData();
    data.set('title', state.title);
    data.set('description', state.description);
    data.set('category', state.category);
    data.set('address', state.address);
    data.set('lat', state.lat);
    data.set('lng', state.lng);
    data.set('occurredAt', new Date(state.occurredAt).toISOString());
    if (state.file) data.set('photo', state.file);
    try {
      const created = await api.createReport(data);
      toast('Report submitted');
      state.createdId = created._id;
      state.step = 5;
      draw(root);
    } catch (err) {
      document.getElementById('err').textContent = err.message;
      btn.disabled = false;
    }
  });
};

const success = (box) => {
  box.innerHTML = `
    <div class="success-state">
      <h1>Report submitted.</h1>
      <p>You're helping make neighborhood patterns visible.</p>
      <div class="hero-actions" style="justify-content:center">
        <a class="btn xl" href="#/issue/${state.createdId}">View report</a>
        <a class="btn secondary xl" href="#/overview">Back to dashboard</a>
      </div>
    </div>
  `;
};
