import { getToken, clearSession } from '../auth/session.js';
import { toast } from '../ui/toast.js';

const API = '/api';

const request = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearSession();
    if (!location.hash.startsWith('#/login')) location.hash = '#/login';
    throw new Error(data.message || 'Please log in');
  }
  if (!res.ok) {
    throw new Error(data.errors?.join(', ') || data.message || 'Request failed');
  }
  return data;
};

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  reports: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    return request(`/reports${q.toString() ? `?${q}` : ''}`);
  },
  myReports: () => request('/reports/me'),
  report: (id) => request(`/reports/${id}`),
  createReport: (formData) => request('/reports', { method: 'POST', body: formData }),
  sameHere: (id) => request(`/reports/${id}/same-here`, { method: 'POST' }),
  comment: (id, text) =>
    request(`/reports/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
  updateStatus: (id, status) =>
    request(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  hotspots: (all = false) => request(`/hotspots${all ? '?all=true' : ''}`),
  hotspot: (address) => request(`/hotspots/${encodeURIComponent(address)}`),
  dashboardStats: () => request('/dashboard/stats'),
  dashboardActivity: () => request('/dashboard/activity'),
};

export const withError = async (fn, fallbackMessage) => {
  try {
    return await fn();
  } catch (err) {
    toast(err.message || fallbackMessage, 'error');
    throw err;
  }
};
