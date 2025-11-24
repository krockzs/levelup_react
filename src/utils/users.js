// =============== API Base ===============
const API = "https://api.sebaorekind.site/auth";

const KEY_SESSION = "lv_user_session";

// =============== Sesión ===============
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

  try {
    window.dispatchEvent(new CustomEvent("lv:session", { detail: getCurrentUser() }));
  } catch {}
}

export function logout() {
  setCurrentUser(null);
}

// =============== Registro (BACKEND) ===============
export async function registerUser({ name, correo, password, address }) {
  try {
    const body = { name, correo, password, address };

    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, msg: data.message || "Error al registrar" };
    }

    return { ok: true, msg: "Usuario registrado correctamente" };
  } catch (err) {
    return { ok: false, msg: "No se pudo conectar con el servidor" };
  }
}

// =============== Login (BACKEND) ===============
export async function loginUser({ correo, password }) {
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });

    const data = await res.json();

    if (!data.token) {
      return { ok: false, msg: "Correo o contraseña incorrectos" };
    }

    const usuario = {
      correo,
      token: data.token,
    };

    setCurrentUser(usuario);

    return { ok: true };
  } catch (err) {
    return { ok: false, msg: "No se pudo conectar con el servidor" };
  }
}