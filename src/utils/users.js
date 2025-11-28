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
  // 1) Borrar del storage
  try {
    localStorage.removeItem(KEY_SESSION);
  } catch {
    // nada
  }

  // 2) Notificar a toda la app que ya NO hay sesión
  try {
    window.dispatchEvent(
      new CustomEvent('lv:session', { detail: null })
    );
  } catch {
    // nada
  }
}


// =============== Registro (BACKEND) ===============
export async function registerUser({ name, correo, password, address }) {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const nameTrimmed  = String(name || '').trim();
  const emailTrimmed = String(correo || '').trim();
  const addrTrimmed  = String(address || '').trim();
  const passStr      = String(password || '');

  // Validaciones básicas
  if (nameTrimmed.length < 4 || nameTrimmed.length > 60) {
    return { ok: false, msg: 'Nombre: 4–60 caracteres.' };
  }

  if (!EMAIL_RE.test(emailTrimmed)) {
    return { ok: false, msg: 'Email no válido.' };
  }

  if (passStr.length < 6 || passStr.length > 64) {
    return { ok: false, msg: 'Clave: 6–64 caracteres.' };
  }

  if (addrTrimmed.length < 10) {
    return { ok: false, msg: 'La dirección debe tener al menos 10 caracteres.' };
  }

  try {
    const body = {
      name   : nameTrimmed,
      correo : emailTrimmed,
      password: passStr,
      address: addrTrimmed,
    };

    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // puedes ajustar según lo que devuelva tu API
      return { ok: false, msg: 'No se pudo registrar el usuario.' };
    }

    const data = await res.json();

    if (!data?.token) {
      return { ok: false, msg: 'No se recibió token desde el servidor.' };
    }

    const usuario = {
      correo  : data.correo  || emailTrimmed,
      name    : data.name    || nameTrimmed,
      role    : data.role    || data.rol || null,
      role_id : data.role_id ?? data.rol_id ?? null,
      address : data.address || addrTrimmed,
      token   : data.token,
    };

    setCurrentUser(usuario);
    // notificar al front (App.jsx escucha este evento)
    window.dispatchEvent(new CustomEvent('lv:session', { detail: usuario }));

    return { ok: true };
  } catch (err) {
    return { ok: false, msg: 'No se pudo conectar con el servidor.' };
  }
}


export async function loginUser({ correo, password }) {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const emailTrimmed = String(correo || '').trim();
  const passStr      = String(password || '');

  if (!EMAIL_RE.test(emailTrimmed)) {
    return { ok: false, msg: 'Email no válido.' };
  }

  if (passStr.length < 6 || passStr.length > 64) {
    return { ok: false, msg: 'Clave: 6–64 caracteres.' };
  }

  try {
    const body = { correo: emailTrimmed, password: passStr };

    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { ok: false, msg: 'Correo o contraseña incorrectos' };
    }

    const data = await res.json();

    if (!data?.token) {
      return { ok: false, msg: 'No se recibió token desde el servidor.' };
    }

    const usuario = {
      correo  : data.correo  || emailTrimmed,
      name    : data.name    || data.nombre || '',
      role    : data.role    || data.rol || null,
      role_id : data.role_id ?? data.rol_id ?? null,
      address : data.address || '',
      token   : data.token,
    };

    setCurrentUser(usuario);
    window.dispatchEvent(new CustomEvent('lv:session', { detail: usuario }));

    return { ok: true };
  } catch (err) {
    return { ok: false, msg: 'No se pudo conectar con el servidor' };
  }
}

// Sumar puntos al cliente usando el token JWT actual
export async function awardPoints(points) {
  const session = getCurrentUser();
  const token = session?.token;

  const pts = Number(points || 0);

  // Sin sesión → error de auth
  if (!token) {
    return { ok: false, msg: 'No hay sesión activa.' };
  }

  // Si no hay puntos que sumar, lo consideramos OK y no pegamos al backend
  if (pts <= 0) {
    return { ok: true };
  }

  try {
    const res = await fetch(`${API}/puntos`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // ACÁ va el token que el backend está pidiendo
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ puntos: pts }),
    });

    if (!res.ok) {
      let msg = 'No se pudieron asignar los puntos.';
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch {
        // da lo mismo
      }
      return { ok: false, msg };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, msg: 'Error de red al asignar puntos.' };
  }
}



