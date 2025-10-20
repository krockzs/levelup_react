// src/components/organisms/Contacto.jsx
import { useState, useMemo, useEffect } from 'react';

export default function Contacto() {
  const [values, setValues] = useState({ name: '', email: '', issue: '', order: '' });
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ type: null, msg: '' });
  const [showPopup, setShowPopup] = useState(false);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const ORDER_RE = /^[A-Z]{2,3}[0-9]{3}$/;

  const errors = useMemo(() => {
    const e = {};
    if (!values.name.trim()) e.name = 'El nombre es obligatorio.';
    else if (values.name.trim().length < 3) e.name = 'Mínimo 3 caracteres.';
    else if (values.name.trim().length > 60) e.name = 'Máximo 60 caracteres.';
    if (!values.email.trim()) e.email = 'El email es obligatorio.';
    else if (!EMAIL_RE.test(values.email.trim())) e.email = 'Formato de email no válido (ej.: nombre@dominio.cl).';
    const issueLen = values.issue.trim().length;
    if (issueLen === 0) e.issue = 'Describe el problema para poder ayudarte.';
    else if (issueLen < 10) e.issue = 'Cuenta un poco más de detalle (mínimo 10 caracteres).';
    else if (issueLen > 500) e.issue = 'Demasiado largo (máximo 500 caracteres).';
    if (values.order.trim() && !ORDER_RE.test(values.order.trim())) {
      e.order = 'Usa 2–3 letras + 3 números (ej.: JM001 o ABC123).';
    }
    return e;
  }, [values]);

  const isValid = Object.keys(errors).length === 0;

  const setField = (name, value) => setValues(v => ({ ...v, [name]: value }));
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, issue: true, order: true });
    if (!isValid) {
      setStatus({ type: 'error', msg: 'Revisa las justificaciones en rojo.' });
      return;
    }
    try {
      setStatus({ type: 'pending', msg: 'Enviando…' });
      // simulación de envío OK
      await new Promise(r => setTimeout(r, 400));

      setStatus({ type: 'ok', msg: 'Listo. Te contactaremos a la brevedad.' });
      setValues({ name: '', email: '', issue: '', order: '' });
      setTouched({});
      setShowPopup(true); // ← mostrar popup
    } catch (err) {
      setStatus({ type: 'error', msg: 'No se pudo enviar. Intenta de nuevo en un momento.' });
    }
  };

  // Cerrar popup con ESC
  useEffect(() => {
    if (!showPopup) return;
    const onKey = (e) => e.key === 'Escape' && setShowPopup(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPopup]);

  return (
    <section id="contacto" className="section">
      <h2 className="section-title">Soporte Técnico</h2>

      <form id="supportForm" className="form" noValidate onSubmit={handleSubmit}>
        {/* Nombre */}
        <div className={`field ${touched.name && errors.name ? 'has-error' : ''}`}>
          <label htmlFor="name">Nombre</label>
          <input
            id="name" name="name" required minLength={3} maxLength={60}
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={handleBlur}
            aria-invalid={touched.name && !!errors.name}
            aria-describedby="name-help name-error"
          />
          <small id="name-help" className="hint">Tu nombre y apellido (3–60 caracteres).</small>
          <small id="name-error" className="error">{touched.name && errors.name ? errors.name : ''}</small>
        </div>

        {/* Email */}
        <div className={`field ${touched.email && errors.email ? 'has-error' : ''}`}>
          <label htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email" required
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={handleBlur}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby="email-help email-error"
            inputMode="email" autoComplete="email"
          />
          <small id="email-help" className="hint">Te responderemos a este correo.</small>
          <small id="email-error" className="error">{touched.email && errors.email ? errors.email : ''}</small>
        </div>

        {/* Problema */}
        <div className={`field ${touched.issue && errors.issue ? 'has-error' : ''}`}>
          <label htmlFor="issue">Descripción del problema</label>
          <textarea
            id="issue" name="issue" required minLength={10} maxLength={500}
            value={values.issue}
            onChange={(e) => setField('issue', e.target.value)}
            onBlur={handleBlur}
            aria-invalid={touched.issue && !!errors.issue}
            aria-describedby="issue-help issue-error"
            rows={5}
          />
          <small id="issue-help" className="hint">Sé concreto: ¿qué intentabas hacer?, ¿qué pasó?, ¿sale algún error?</small>
          <small id="issue-error" className="error">{touched.issue && errors.issue ? errors.issue : ''}</small>
        </div>

        {/* Código de producto (opcional) */}
        <div className={`field ${touched.order && errors.order ? 'has-error' : ''}`}>
          <label htmlFor="order">Código de producto (opcional)</label>
          <input
            id="order" name="order" pattern="[A-Z]{2,3}[0-9]{3}" placeholder="Ej: JM001"
            value={values.order}
            onChange={(e) => setField('order', e.target.value.toUpperCase())}
            onBlur={handleBlur}
            aria-invalid={touched.order && !!errors.order}
            aria-describedby="order-hint order-error"
          />
          <small id="order-hint" className="hint">Formato: 2–3 letras + 3 números (p. ej., JM001 o ABC123).</small>
          <small id="order-error" className="error">{touched.order && errors.order ? errors.order : ''}</small>
        </div>

        {/* Estado del envío */}
        {status.type && (
          <div
            className={`form-status ${
              status.type === 'error' ? 'is-error'
              : status.type === 'ok' ? 'is-ok'
              : 'is-pending'
            }`}
            role={status.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            {status.msg}
          </div>
        )}

        <div className="actions">
          <button type="submit" className="btn-accent" disabled={status.type === 'pending'}>
            {status.type === 'pending' ? 'Enviando…' : 'Enviar'}
          </button>
          <a
            className="btn-outline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://wa.me/56912345678?text=Hola%20necesito%20soporte%20técnico."
          >
            Chatear por WhatsApp
          </a>
        </div>
      </form>

      {/* POPUP de confirmación */}
      {showPopup && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowPopup(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
            display: 'grid', placeItems: 'center', zIndex: 50
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 92vw)',
              background: 'rgba(17,24,39,.95)',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 14,
              padding: 18,
              boxShadow: '0 10px 30px rgba(0,0,0,.6)'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Mensaje recibido</h3>
            <p className="meta" style={{ marginTop: 0 }}>
              Nos contactaremos contigo a la brevedad.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className="btn" onClick={() => setShowPopup(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
