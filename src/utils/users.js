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

// =============== Registro (usa backend real) ===============
export async function registerUser({ name, correo, password, address }) {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const nameTrimmed = String(name || "").trim();
  const emailTrimmed = String(correo || "").trim();
  const addrTrimmed = String(address || "").trim();
  const passStr = String(password || "");

  // Validaciones básicas
  if (nameTrimmed.length < 4 || nameTrimmed.length > 60) {
    return { ok: false, msg: "Nombre: 4–60 caracteres." };
  }

  if (!EMAIL_RE.test(emailTrimmed)) {
    return { ok: false, msg: "Email no válido." };
  }

  if (passStr.length < 6 || passStr.length > 64) {
    return { ok: false, msg: "Clave: 6–64 caracteres." };
  }

  if (addrTrimmed.length < 10) {
    return {
      ok: false,
      msg: "La dirección debe tener al menos 10 caracteres.",
    };
  }

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameTrimmed,
        correo: emailTrimmed,
        password: passStr,
        address: addrTrimmed,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.token) {
      return {
        ok: false,
        msg: data.error || data.message || "No se pudo registrar el usuario.",
      };
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
      correo: data.correo || emailTrimmed,
      token: data.token,
      name: data.name || nameTrimmed,
      address: data.address || addrTrimmed,
      role: roleFromApi, // "USER" | "ADMIN"
      role_id: roleId, // 1 | 2
    };

    setCurrentUser(usuario);

    return { ok: true };
  } catch (err) {
    return { ok: false, msg: "No se pudo conectar con el servidor." };
  }
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
      role: roleFromApi, // "USER" | "ADMIN"
      role_id: roleId, // 1 | 2
    };

    setCurrentUser(usuario);

    return { ok: true };
  } catch (err) {
    return { ok: false, msg: "No se pudo conectar con el servidor" };
  }
}
