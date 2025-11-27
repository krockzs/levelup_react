// =============== API Base ===============
const API = "https://api.sebaorekind.site/auth";

const KEY_SESSION = "lv_user_session";

// =============== Helpers JWT ===============
function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = String(token).split(".");
    if (parts.length < 2) return null;

    // JWT usa base64url → normalizamos
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);

    const jsonStr = atob(padded);
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

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
    localStorage.setItem(KEY_SESSION, JSON.stringify(user));
  } catch {
    // nada
  }
}

export function logout() {
  try {
    localStorage.removeItem(KEY_SESSION);
  } catch {
    // nada
  }
}

// =============== Registro (mock simple) ===============
// Cuando tengas endpoint real, acá se enchufa.
export function registerUser({ name, correo, password, address }) {
  if (!name || !correo || !password || !address) {
    return { ok: false, msg: "Faltan datos para el registro." };
  }

  return { ok: true };
}

// =============== Login (usa backend real) ===============
export async function loginUser({ correo, password }) {
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.token) {
      return { ok: false, msg: "Correo o contraseña incorrectos" };
    }

    const payload = decodeJwtPayload(data.token);

    const roleFromApi = data.role || payload?.role || null;
    const roleId =
      roleFromApi === "ADMIN"
        ? 2
        : roleFromApi === "USER"
        ? 1
        : null;

    const usuario = {
      correo: data.correo || correo,
      token: data.token,
      name: data.name || null,
      address: data.address || null,
      role: roleFromApi,  // "USER" | "ADMIN"
      role_id: roleId,    // 1 | 2
    };

    setCurrentUser(usuario);

    return { ok: true };
  } catch (err) {
    return { ok: false, msg: "No se pudo conectar con el servidor" };
  }
}
