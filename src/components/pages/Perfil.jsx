// src/components/pages/Perfil.jsx
import { useMemo, useState, useEffect } from 'react';
import {
  getCurrentUser,
  registerUser,
  loginUser,
  logout,
} from '../../utils/users';
import { useLocation } from 'react-router-dom';

export default function Perfil() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [status, setStatus] = useState({ type: null, msg: '' });
  const location = useLocation();

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
  const [loginVals, setLoginVals] = useState({ email: '', password: '' });
  const [regVals, setRegVals] = useState({ name: '', email: '', password: '', password2: '' });
  const [touched, setTouched] = useState({});

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  const loginErrors = useMemo(() => {
    const e = {};
    if (!EMAIL_RE.test(String(loginVals.email || '').trim())) e.email = 'Email no válido.';
    if (String(loginVals.password || '').length < 6) e.password = 'Mínimo 6 caracteres.';
    return e;
  }, [loginVals]);

  const regErrors = useMemo(() => {
    const e = {};
    const n = String(regVals.name || '').trim();
    if (n.length < 3 || n.length > 60) e.name = 'Nombre: 3–60.';
    if (!EMAIL_RE.test(String(regVals.email || '').trim())) e.email = 'Email no válido.';
    const p1 = String(regVals.password || '');
    const p2 = String(regVals.password2 || '');
    if (p1.length < 6 || p1.length > 64) e.password = 'Clave: 6–64.';
    if (p1 !== p2) e.password2 = 'Las claves no coinciden.';
    return e;
  }, [regVals]);

  const touch = (name) => setTouched((t) => ({ ...t, [name]: true }));

  // ===== Acciones =====
  const doLogin = (ev) => {
    ev.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(loginErrors).length) {
      setStatus({ type: 'error', msg: 'Revisa los campos.' });
      return;
    }
    const r = loginUser(loginVals);
    if (!r.ok) return setStatus({ type: 'error', msg: r.msg });
    setStatus({ type: 'ok', msg: 'Bienvenido.' });
  };

  const doRegister = (ev) => {
    ev.preventDefault();
    setTouched({ name: true, email: true, password: true, password2: true });
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
        <p className="meta">Nombre: <strong>{user.name}</strong></p>
        <p className="meta">Email: <strong>{user.email}</strong></p>
        <p className="meta">Puntos cliente: <strong>{user.puntos_clientes || 0}</strong></p>

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
          <div className={`field ${touched.email && loginErrors.email ? 'has-error' : ''}`}>
            <label htmlFor="login_email">Email</label>
            <input
              id="login_email"
              value={loginVals.email}
              onChange={e => setLoginVals(v => ({ ...v, email: e.target.value }))}
              onBlur={() => touch('email')}
              inputMode="email"
              autoComplete="email"
              required
            />
            <small className="error">{touched.email && loginErrors.email ? loginErrors.email : ''}</small>
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

          <div className={`field ${touched.email && regErrors.email ? 'has-error' : ''}`}>
            <label htmlFor="reg_email">Email</label>
            <input
              id="reg_email"
              value={regVals.email}
              onChange={e => setRegVals(v => ({ ...v, email: e.target.value }))}
              onBlur={() => touch('email')}
              inputMode="email"
              autoComplete="email"
              required
            />
            <small className="error">{touched.email && regErrors.email ? regErrors.email : ''}</small>
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

          <div className="actions">
            <button className="btn-accent" type="submit">Crear cuenta</button>
          </div>
        </form>
      )}
    </section>
  );
}
