import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCurrentUser, registerUser, loginUser, logout } from '../../utils/users';

export default function Perfil() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [status, setStatus] = useState({ type: null, msg: '' });
  const location = useLocation();
  const [misDatos, setMisDatos] = useState(null);

  async function fetchMisDatos() {
    try {
      const session = getCurrentUser();
      const token = session?.token;
      if (!token) return null;
      
      const res = await fetch("https://api.sebaorekind.site/auth/midatos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return null;

      return await res.json();
    } catch (err) {
      console.error("Error cargando datos del usuario:", err);
      return null;
    }
  }

  useEffect(() => {
    fetchMisDatos().then(data => {
      if (data) setMisDatos(data);
    });
  }, []);
  
  // Sesión (solo lectura directa del storage)
  const user = getCurrentUser();

  // Aviso si viene redirigido por compra
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get('needLogin') === '1') {
      setStatus({ type: 'error', msg: 'Debes estar registrado para comprar en la tienda.' });
    }
  }, [location.search]);

  // También escuchar avisos globales (por si App los dispara)
  useEffect(() => {
    const onNotice = (e) => setStatus({ type: 'error', msg: e.detail || '' });
    window.addEventListener('lv:notice', onNotice);
    return () => window.removeEventListener('lv:notice', onNotice);
  }, []);

  // ===== Formularios =====
  const [loginVals, setLoginVals] = useState({ correo: '', password: '' });
  const [regVals, setRegVals] = useState({ name: '', correo: '', password: '', password2: '', address: '' });
  const [touched, setTouched] = useState({});

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const loginErrors = useMemo(() => {
  const e = {};
  const emailTrimmed = String(loginVals.correo || '').trim();

  if (!EMAIL_RE.test(emailTrimmed)) e.correo = 'Email no válido.';
  if (String(loginVals.password || '').length < 6) e.password = 'Mínimo 6 caracteres.';

  return e;
  }, [loginVals]);


 const regErrors = useMemo(() => {
  const e = {};
  const emailTrimmed = String(regVals.correo || '').trim();
  const nameTrimmed = String(regVals.name || '').trim();

  if (nameTrimmed.length < 3 || nameTrimmed.length > 60) e.name = 'Nombre: 3–60 caracteres.';
  if (!EMAIL_RE.test(emailTrimmed)) e.correo = 'Email no válido.';

  const p1 = String(regVals.password || '');
  const p2 = String(regVals.password2 || '');
  if (p1.length < 6 || p1.length > 64) e.password = 'Clave: 6–64 caracteres.';
  if (p1 !== p2) e.password2 = 'Las claves no coinciden.';
  if (regVals.address.trim().length < 10) e.address = 'La dirección debe tener al menos 10 caracteres.';

  return e;
  }, [regVals]);


  const touch = (name) => setTouched((t) => ({ ...t, [name]: true }));

  // ===== Acciones =====
  const doLogin = async (ev) => {
  ev.preventDefault();
  setTouched({ correo: true, password: true });

  if (Object.keys(loginErrors).length) {
    setStatus({ type: 'error', msg: 'Revisa los campos.' });
    return;
  }

  const r = await loginUser(loginVals);
  if (!r.ok) return setStatus({ type: 'error', msg: r.msg });

  // 🔥 Cargar datos reales del usuario desde backend
  const datos = await fetchMisDatos();
  if (datos) setMisDatos(datos);

  setStatus({ type: 'ok', msg: 'Bienvenido.' });
};

  const doRegister = (ev) => {
    ev.preventDefault();
    setTouched({ name: true, correo: true, password: true, password2: true, address: true });
    if (Object.keys(regErrors).length) {
      setStatus({ type: 'error', msg: 'Revisa los campos del registro.' });
      return;
    }
    const r = registerUser(regVals);
    if (!r.ok) return setStatus({ type: 'error', msg: r.msg });
    setStatus({ type: 'ok', msg: 'Cuenta creada.' });
    setMode('login');
  };

  const doLogout = () => {
    logout();
    setStatus({ type: 'ok', msg: 'Sesión cerrada.' });
  };
  // ===== UI =====
  if (user) {
  return (
    <section className="section container">
      <h2>Mi cuenta</h2>

      {/* Datos reales del usuario desde el estado misDatos */}
      {misDatos ? (
        <>
          <p className="meta">Nombre: <strong>{misDatos.name}</strong></p>
          <p className="meta">Email: <strong>{misDatos.correo}</strong></p>
          <p className="meta">Dirección: <strong>{misDatos.address}</strong></p>
          <p className="meta">Puntos cliente: <strong>{misDatos.puntos_clientes}</strong></p>
        </>
      ) : (
        <p>Cargando datos del usuario...</p>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button className="btn" onClick={doLogout}>Cerrar sesión</button>
      </div>

      {status.type ? (
        <div
          className={`form-status ${status.type === 'error' ? 'is-error' : 'is-ok'}`}
          style={{ marginTop: 12 }}
          role={status.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {status.msg}
        </div>
      ) : null}
    </section>
  );
}


  return (
    <section className="section container">
      <h2>Perfil</h2>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className={`btn${mode === 'login' ? ' primary' : ''}`} onClick={() => setMode('login')}>Iniciar sesión</button>
        <button className={`btn${mode === 'register' ? ' primary' : ''}`} onClick={() => setMode('register')}>Crear cuenta</button>
      </div>

      {status.type ? (
        <div
          className={`form-status ${status.type === 'error' ? 'is-error' : 'is-ok'}`}
          style={{ marginBottom: 12 }}
          role={status.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {status.msg}
        </div>
      ) : null}

      {mode === 'login' ? (
        <form className="form" onSubmit={doLogin} noValidate>
          <div className={`field ${touched.correo && loginErrors.correo ? 'has-error' : ''}`}>
            <label htmlFor="login_email">Email</label>
            <input
              id="login_email"
              value={loginVals.correo}
              onChange={e => setLoginVals(v => ({ ...v, correo: e.target.value }))}
              onBlur={() => touch('correo')}
              inputMode="email"
              autoComplete="email"
              required
            />
            <small className="error">{touched.correo && loginErrors.correo ? loginErrors.correo : ''}</small>
          </div>

          <div className={`field ${touched.password && loginErrors.password ? 'has-error' : ''}`}>
            <label htmlFor="login_password">Clave</label>
            <input
              id="login_password"
              type="password"
              value={loginVals.password}
              onChange={e => setLoginVals(v => ({ ...v, password: e.target.value }))}
              onBlur={() => touch('password')}
              autoComplete="current-password"
              required
            />
            <small className="error">{touched.password && loginErrors.password ? loginErrors.password : ''}</small>
          </div>

          <div className="actions">
            <button className="btn-accent" type="submit">Entrar</button>
          </div>
        </form>
      ) : (
        <form className="form" onSubmit={doRegister} noValidate>
          <div className={`field ${touched.name && regErrors.name ? 'has-error' : ''}`}>
            <label htmlFor="reg_name">Nombre</label>
            <input
              id="reg_name"
              value={regVals.name}
              onChange={e => setRegVals(v => ({ ...v, name: e.target.value }))}
              onBlur={() => touch('name')}
              minLength={3}
              maxLength={60}
              required
            />
            <small className="error">{touched.name && regErrors.name ? regErrors.name : ''}</small>
          </div>

          <div className={`field ${touched.correo && regErrors.correo ? 'has-error' : ''}`}>
            <label htmlFor="reg_email">Email</label>
            <input
              id="reg_email"
              value={regVals.correo}
              onChange={e => setRegVals(v => ({ ...v, correo: e.target.value }))}
              onBlur={() => touch('correo')}
              inputMode="email"
              autoComplete="email"
              required
            />
            <small className="error">{touched.correo && regErrors.correo ? regErrors.correo : ''}</small>
          </div>

          <div className={`field ${touched.password && regErrors.password ? 'has-error' : ''}`}>
            <label htmlFor="reg_password">Clave</label>
            <input
              id="reg_password"
              type="password"
              value={regVals.password}
              onChange={e => setRegVals(v => ({ ...v, password: e.target.value }))}
              onBlur={() => touch('password')}
              autoComplete="new-password"
              minLength={6}
              maxLength={64}
              required
            />
            <small className="error">{touched.password && regErrors.password ? regErrors.password : ''}</small>
          </div>

          <div className={`field ${touched.password2 && regErrors.password2 ? 'has-error' : ''}`}>
            <label htmlFor="reg_password2">Repite la clave</label>
            <input
              id="reg_password2"
              type="password"
              value={regVals.password2}
              onChange={e => setRegVals(v => ({ ...v, password2: e.target.value }))}
              onBlur={() => touch('password2')}
              autoComplete="new-password"
              required
            />
            <small className="error">{touched.password2 && regErrors.password2 ? regErrors.password2 : ''}</small>
          </div>

          <div className={`field ${touched.address && regErrors.address ? 'has-error' : ''}`}>
            <label htmlFor="reg_address">Dirección</label>
            <input
              id="reg_address"
              value={regVals.address}
              onChange={e => setRegVals(v => ({ ...v, address: e.target.value }))}
              onBlur={() => touch('address')}
              required
            />
            <small className="error">{touched.address && regErrors.address ? regErrors.address : ''}</small>
          </div>

          <div className="actions">
            <button className="btn-accent" type="submit">Crear cuenta</button>
          </div>
        </form>
      )}
    </section>
  );
}
