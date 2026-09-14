const TOKEN = 'nl_token';
const USER = 'nl_user';

export const getToken = () => localStorage.getItem(TOKEN);
export const getUser = () => {
  const raw = localStorage.getItem(USER);
  return raw ? JSON.parse(raw) : null;
};
export const setSession = (token, user) => {
  localStorage.setItem(TOKEN, token);
  localStorage.setItem(USER, JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem(TOKEN);
  localStorage.removeItem(USER);
};
export const isAuthed = () => Boolean(getToken());
