import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/users';

const API_BASE = 'https://api.sebaorekind.site';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Admin() {
  const session = getCurrentUser();
  const isAdmin = session?.role === 'ADMIN' || session?.role_id === 2;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    correo: '',
    address: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isCreate, setIsCreate] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin]);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => e.key === 'Escape' && !saving && setShowModal(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal, saving]);

  async function apiFetch(path, options = {}) {
    const token = session?.token;

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log('[ADMIN] fetch =>', `${API_BASE}${path}`, 'options =>', {
      ...options,
      headers,
    });

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (!res.ok) {
      let msg = 'Error en la petición.';
      try {
        const data = await res.json();
        console.log('[ADMIN] respuesta error =>', data);
        if (data?.message) msg = data.message;
      } catch (e) {
        console.log('[ADMIN] no se pudo parsear el body de error', e);
      }
      throw new Error(msg);
    }

    if (res.status === 204) return null;
    const json = await res.json().catch(() => null);
    console.log('[ADMIN] respuesta OK =>', json);
    return json;
  }

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(u) {
    setIsCreate(false);
    setSelectedId(u.id);
    setForm({
      name: u.name || '',
      correo: u.correo || '',
      address: u.address || '',
      password: '',
    });
    setFieldErrors({});
    setShowModal(true);
  }

  function openCreateModal() {
    setIsCreate(true);
    setSelectedId(null);
    setForm({
      name: '',
      correo: '',
      address: '',
      password: '',
    });
    setFieldErrors({});
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;
    setShowModal(false);
    setIsCreate(false);
    setSelectedId(null);
    setForm({
      name: '',
      correo: '',
      address: '',
      password: '',
    });
    setFieldErrors({});
    setError('');
  }

  function onFormChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validateForm(values, { isCreate }) {
    const errs = {};
    const name = String(values.name || '').trim();
    const correo = String(values.correo || '').trim();
    const address = String(values.address || '').trim();
    const password = String(values.password || '');

    if (name.length < 4) {
      errs.name = 'Nombre: mínimo 4 caracteres.';
    }
    if (!EMAIL_RE.test(correo)) {
      errs.correo = 'Correo no tiene formato válido.';
    }
    if (address.length < 4) {
      errs.address = 'Dirección: mínimo 4 caracteres.';
    }
    if (isCreate) {
      if (password.length < 4) {
        errs.password = 'Password: mínimo 4 caracteres.';
      }
    }

    return errs;
  }

  async function saveUser(ev) {
    ev.preventDefault();
    setError('');
    // validar reglas de negocio antes de pegarle al backend
    const errs = validateForm(form, { isCreate });
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError('Revisa los campos del formulario.');
      return;
    }

    setSaving(true);
    try {
      if (isCreate) {
        // CREAR USUARIO NUEVO via nuevo endpoint /admin/users
        const payload = {
          name: form.name.trim(),
          correo: form.correo.trim(),
          password: form.password,
          address: form.address.trim(),
          // role_id se asigna solo en el backend (USER por defecto)
        };
        console.log('[ADMIN] create payload =>', payload);
        await apiFetch('/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else if (selectedId) {
        // EDITAR USUARIO EXISTENTE (sin password ni role_id)
        const payload = {
          name: form.name.trim(),
          correo: form.correo.trim(),
          address: form.address.trim(),
        };
        console.log('[ADMIN] update payload =>', payload);
        await apiFetch(`/admin/users/${selectedId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }

      await loadUsers();
      closeModal();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el usuario.');
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(id, roleId) {
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/admin/users/${id}/role/${roleId}`, {
        method: 'PUT',
      });
      await loadUsers();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el rol.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      if (id === selectedId) {
        closeModal();
      } else {
        await loadUsers();
      }
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el usuario.');
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    console.log('[ADMIN] NO ES ADMIN, session =>', session);
    return <Navigate to="/" replace />;
  }

  return (
    <section className="section container">
      <h2>Panel de administración</h2>
      <p className="meta">CRUD de usuarios y roles.</p>

      {error && (
        <div className="form-status is-error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3>Usuarios</h3>
            <button
              type="button"
              className="btn-accent"
              onClick={openCreateModal}
              disabled={saving}
            >
              Nuevo usuario
            </button>
          </div>

          {users.length === 0 ? (
            <p className="meta">No hay usuarios.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleName =
                    typeof u.role === 'string'
                      ? u.role
                      : u.role?.nombre || '';

                  const isRowAdmin = roleName === 'ADMIN';
                  const isRowUser = roleName === 'USER';

                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.correo}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {/* switch USER / ADMIN */}
                        <span style={{ marginRight: 8 }}>
                          <button
                            className={isRowUser ? 'btn-accent' : 'btn'}
                            type="button"
                            onClick={() => changeRole(u.id, 1)}
                            disabled={saving || isRowUser}
                          >
                            USER
                          </button>{' '}
                          <button
                            className={isRowAdmin ? 'btn-accent' : 'btn'}
                            type="button"
                            onClick={() => changeRole(u.id, 2)}
                            disabled={saving || isRowAdmin}
                          >
                            ADMIN
                          </button>
                        </span>
                        {/* Editar a la izquierda de Eliminar */}
                        <button
                          className="btn"
                          type="button"
                          onClick={() => openEditModal(u)}
                          style={{ marginRight: 8 }}
                        >
                          Editar
                        </button>
                        <button
                          className="btn"
                          type="button"
                          onClick={() => deleteUser(u.id)}
                          disabled={saving}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* MODAL EDITAR / CREAR */}
      {showModal && (
        <div
          className="popup-backdrop"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <form
            className="popup form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveUser}
          >
            <h3 className="popup-title">
              {isCreate ? 'Nuevo usuario' : 'Editar usuario'}
            </h3>

            {!isCreate && selectedId && (
              <div className="field">
                <label>ID</label>
                <input value={selectedId} disabled />
              </div>
            )}

            <div className={`field ${fieldErrors.name ? 'has-error' : ''}`}>
              <label htmlFor="adm_name">Nombre</label>
              <input
                id="adm_name"
                name="name"
                value={form.name}
                onChange={onFormChange}
                required
                minLength={4}
              />
              {fieldErrors.name && (
                <small className="error">{fieldErrors.name}</small>
              )}
            </div>

            <div className={`field ${fieldErrors.correo ? 'has-error' : ''}`}>
              <label htmlFor="adm_correo">Correo</label>
              <input
                id="adm_correo"
                name="correo"
                type="email"
                value={form.correo}
                onChange={onFormChange}
                required
              />
              {fieldErrors.correo && (
                <small className="error">{fieldErrors.correo}</small>
              )}
            </div>

            <div className={`field ${fieldErrors.address ? 'has-error' : ''}`}>
              <label htmlFor="adm_address">Dirección</label>
              <input
                id="adm_address"
                name="address"
                value={form.address}
                onChange={onFormChange}
                required
                minLength={4}
              />
              {fieldErrors.address && (
                <small className="error">{fieldErrors.address}</small>
              )}
            </div>

            {isCreate && (
              <div className={`field ${fieldErrors.password ? 'has-error' : ''}`}>
                <label htmlFor="adm_password">Password</label>
                <input
                  id="adm_password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onFormChange}
                  required
                  minLength={4}
                />
                {fieldErrors.password && (
                  <small className="error">{fieldErrors.password}</small>
                )}
              </div>
            )}

            <div className="popup-actions">
              <button
                type="button"
                className="btn"
                onClick={closeModal}
                disabled={saving}
              >
                Cerrar
              </button>
              <button className="btn-accent" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
