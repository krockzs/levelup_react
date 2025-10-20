// src/utils/users.js
// Gestión de usuarios 100% en localStorage (sin JSON en disco).

const KEY_USERS = 'lv_users';
const KEY_SESSION = 'lv_user_session';

/* ============ Base de datos (localStorage) ============ */
export function loadUsers() {
  try {
    const raw = localStorage.getItem(KEY_USERS);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function persistUsers(list) {
  try {
    localStorage.setItem(KEY_USERS, JSON.stringify(list || []));
  } catch {}
}

/* ============ Sesión ============ */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(KEY_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  try {
    if (user) localStorage.setItem(KEY_SESSION, JSON.stringify(user));
    else localStorage.removeItem(KEY_SESSION);
  } catch {}

  // 🔔 Notificar al frontend que la sesión cambió (mismo tab)
  try {
    const detail = getCurrentUser();
    window.dispatchEvent(new CustomEvent('lv:session', { detail }));
  } catch {}
}

export function logout() {
  setCurrentUser(null);
}

/* ============ Registro / Login ============ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function registerUser({ name, email, password }) {
  const users = loadUsers();

  const n = String(name || '').trim();
  const e = String(email || '').trim().toLowerCase();
  const p = String(password || '');

  if (n.length < 3 || n.length > 60) return { ok: false, msg: 'Nombre 3–60.' };
  if (!EMAIL_RE.test(e))            return { ok: false, msg: 'Email no válido.' };
  if (p.length < 6 || p.length > 64) return { ok: false, msg: 'Clave 6–64.' };

  if (users.some(u => String(u.email).toLowerCase() === e)) {
    return { ok: false, msg: 'Ese email ya está registrado.' };
  }

  const user = {
    id: Date.now(),
    name: n,
    email: e,
    password: p,       // demo
    puntos_clientes: 0,
  };

  const updated = [...users, user];
  persistUsers(updated);

  setCurrentUser({
    id: user.id,
    name: user.name,
    email: user.email,
    puntos_clientes: user.puntos_clientes,
  });

  return { ok: true, user };
}

export function loginUser({ email, password }) {
  const e = String(email || '').trim().toLowerCase();
  const p = String(password || '');
  const users = loadUsers();

  const found = users.find(
    u => String(u.email).toLowerCase() === e && String(u.password) === p
  );
  if (!found) return { ok: false, msg: 'Email o clave incorrectos.' };

  setCurrentUser({
    id: found.id,
    name: found.name,
    email: found.email,
    puntos_clientes: found.puntos_clientes,
  });

  return { ok: true, user: getCurrentUser() };
}

/* ============ Puntos (para después) ============ */
export function addPuntos(email, delta = 0) {
  const users = loadUsers();
  const idx = users.findIndex(
    u => String(u.email).toLowerCase() === String(email || '').toLowerCase()
  );
  if (idx === -1) return { ok: false };

  const pts = Number(users[idx].puntos_clientes || 0) + Number(delta || 0);
  users[idx].puntos_clientes = pts;
  persistUsers(users);

  const cur = getCurrentUser();
  if (cur && String(cur.email).toLowerCase() === String(email || '').toLowerCase()) {
    setCurrentUser({ ...cur, puntos_clientes: pts });
  }

  return { ok: true, puntos_clientes: pts };
}
