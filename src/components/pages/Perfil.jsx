import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, registerUser, loginUser, logout } from '../../utils/users';

export default function Perfil() {
  const [mode, setMode] = useState('login');
  const [status, setStatus] = useState({ type: null, msg: '' });
  const location = useLocation();
  const navigate = useNavigate();
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
    } catch {
      return null;
    }
  }

  useEffect(() => {
    fetchMisDatos().then(data => {
      if (data) setMisDatos(data);
    });
  }, []);

  const user = getCurrentUser();

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get('needLogin') === '1') {
      setStatus({ type: 'error', msg: 'Debes estar registrado para comprar en la tienda.' });
    }
  }, [location.search]);

  useEffect(() => {
    const onNotice = (e) => setStatus({ type: 'error', msg: e.detail || '' });
    window.addEventListener('lv:notice', onNotice);
    return () => window.removeEventListener('lv:notice', onNotice);
  }, []);

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

  const doLogin = async (ev) => {
    ev.preventDefault();
    setTouched({ correo: true, password: true });

    if (Object.keys(loginErrors).length) {
      setStatus({ type: 'error', msg: 'Revisa los campos.' });
      return;
    }

    const r = await loginUser(loginVals);
    if (!r.ok) {
      setStatus({ type: 'error', msg: r.msg });
      return;
    }

    const session = getCurrentUser();
    const isAdmin = session?.role === 'ADMIN' || session?.role_id === 2;

    if (isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    const datos = await fetchMisDatos();
    if (datos) setMisDatos(datos);
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

  if (user) {
    return (
      <section className="section container">
        <div className="perfil-card">
          <h2 className="perfil-title">Mi cuenta</h2>

          {misDatos ? (
            <div className="perfil-grid">
              <div className="perfil-item">
                <span className="perfil-label">Nombre</span>
                <span className="perfil-value">{misDatos.name}</span>
              </div>

              <div className="perfil-item">
                <span className="perfil-label">Email</span>
                <span className="perfil-value">{misDatos.correo}</span>
              </div>

              <div className="perfil-item">
                <span className="perfil-label">Dirección</span>
                <span className="perfil-value">{misDatos.address}</span>
              </div>

              <div className="perfil-item">
                <span className="perfil-label">Puntos Cliente</span>
                <span className="perfil-value puntos">{misDatos.puntos_clientes}</span>
              </div>
            </div>
          ) : (
            <p>Cargando datos del usuario...</p>
          )}

          <button className="btn-accent cerrar-sesion-btn" onClick={doLogout}>
            Cerrar sesión
          </button>

          {status.type && (
            <div className={`form-status ${status.type === 'error' ? 'is-error' : 'is-ok'}`} style={{ marginTop: 12 }}>
              {status.msg}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="section container auth-full">
      <div className="auth-full-card">
        <div className="auth-full-left">
          <h2 className="auth-full-title">
            {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>

          <div className="auth-switch">
            <button
              className={`btn${mode === 'login' ? ' primary' : ''}`}
              onClick={() => setMode('login')}
            >
              Iniciar sesión
            </button>

            <button
              className={`btn${mode === 'register' ? ' primary' : ''}`}
              onClick={() => setMode('register')}
            >
              Crear cuenta
            </button>
          </div>

          {status.type && (
            <div
              className={`form-status ${status.type === 'error' ? 'is-error' : 'is-ok'}`}
              role={status.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              {status.msg}
            </div>
          )}

          <div className="auth-fields">
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
                  <small className="error">
                    {touched.correo && loginErrors.correo ? loginErrors.correo : ''}
                  </small>
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
                  <small className="error">
                    {touched.password && loginErrors.password ? loginErrors.password : ''}
                  </small>
                </div>

                <button className="btn-accent auth-full-btn" type="submit">
                  Entrar
                </button>

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
                  <small className="error">
                    {touched.name && regErrors.name ? regErrors.name : ''}
                  </small>
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
                  <small className="error">
                    {touched.correo && regErrors.correo ? regErrors.correo : ''}
                  </small>
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
                  <small className="error">
                    {touched.password && regErrors.password ? regErrors.password : ''}
                  </small>
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
                  <small className="error">
                    {touched.password2 && regErrors.password2 ? regErrors.password2 : ''}
                  </small>
                </div>

                <div className={`field ${touched.address && regErrors.address ? 'has-error' : ''}`}>
                  <label htmlFor="reg_access">Dirección</label>
                  <input
                    id="reg_access"
                    value={regVals.address}
                    onChange={e => setRegVals(v => ({ ...v, address: e.target.value }))}
                    onBlur={() => touch('address')}
                    required
                  />
                  <small className="error">
                    {touched.address && regErrors.address ? regErrors.address : ''}
                  </small>
                </div>

                <button className="btn-accent auth-full-btn" type="submit">
                  Crear cuenta
                </button>

              </form>
            )}
          </div>
        </div>

        <div className="auth-full-right">
          <img
            src="/imagenes/Fondos/prueba.jpg"
            className="auth-full-img"
            alt="Gamer panel"
          />
        </div>
      </div>
    </section>
  );
}
