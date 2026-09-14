import { mount } from '../utils/dom.js';
import { logoSvg } from '../ui/logo.js';
import { api } from '../api/client.js';
import { setSession } from '../auth/session.js';
import { toast } from '../ui/toast.js';

const authVisual = `
  <div class="auth-visual">
    <div>
      <div class="brand">${logoSvg} Neighborly</div>
      <h1>See the issue. Find the pattern.</h1>
      <p>Turn a single neighborhood incident into collective evidence.</p>
    </div>
    <p class="muted">124 Main Street is already a hotspot — 12 reports in 30 days.</p>
  </div>
`;

export const renderLogin = (root) => {
  mount(root, `
    <div class="auth-split page-enter">
      ${authVisual}
      <div class="auth-form">
        <form class="auth-card" id="login-form">
          <h2>Welcome back</h2>
          <p>Log in to confirm issues and track patterns.</p>
          <div class="hint">Demo: demo@neighborly.com · Demo123!</div>
          <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required /></div>
          <div class="field pw-wrap">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" required />
            <button class="icon-btn" type="button" id="toggle-pw" aria-label="Show password"><i data-lucide="eye"></i></button>
          </div>
          <p class="error" id="err" style="color:var(--red)"></p>
          <button class="btn xl" type="submit" style="width:100%">Log in</button>
          <p class="muted" style="margin-top:16px">New here? <a href="#/register">Create an account</a></p>
        </form>
      </div>
    </div>
  `);
  bindPassword();
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('err');
    err.textContent = '';
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const data = await api.login({
        email: e.target.email.value,
        password: e.target.password.value,
      });
      setSession(data.token, data.user);
      toast('Logged in');
      location.hash = '#/overview';
    } catch (error) {
      err.textContent = error.message;
    } finally {
      btn.disabled = false;
    }
  });
};

export const renderRegister = (root) => {
  mount(root, `
    <div class="auth-split page-enter">
      ${authVisual}
      <div class="auth-form">
        <form class="auth-card" id="reg-form">
          <h2>Create your account</h2>
          <p>Join neighbors who are making patterns visible.</p>
          <div class="field"><label>Name</label><input name="name" required /></div>
          <div class="field"><label>Email</label><input name="email" type="email" required /></div>
          <div class="field pw-wrap">
            <label>Password</label>
            <input id="password" name="password" type="password" required minlength="6" />
            <button class="icon-btn" type="button" id="toggle-pw" aria-label="Show password"><i data-lucide="eye"></i></button>
          </div>
          <div class="field"><label>Confirm password</label><input name="confirm" type="password" required /></div>
          <p class="error" id="err" style="color:var(--red)"></p>
          <button class="btn xl" type="submit" style="width:100%">Create account</button>
          <p class="muted" style="margin-top:16px">Already have an account? <a href="#/login">Log in</a></p>
        </form>
      </div>
    </div>
  `);
  bindPassword();
  document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('err');
    err.textContent = '';
    if (e.target.password.value !== e.target.confirm.value) {
      err.textContent = 'Passwords do not match';
      return;
    }
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const data = await api.register({
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
      });
      setSession(data.token, data.user);
      toast('Account created');
      location.hash = '#/overview';
    } catch (error) {
      err.textContent = error.message;
    } finally {
      btn.disabled = false;
    }
  });
};

const bindPassword = () => {
  document.getElementById('toggle-pw')?.addEventListener('click', () => {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
  });
};
