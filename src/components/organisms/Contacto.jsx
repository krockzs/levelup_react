// src/components/organisms/Contacto.jsx
export default function Contacto() {
  return (
    <section id="contacto" className="section">
      <h2 className="section-title">Soporte Técnico</h2>

      <form id="supportForm" className="form" noValidate>
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" name="name" required minLength="3" maxLength="60" />
          <small className="error"></small>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
          <small className="error"></small>
        </div>

        <div className="field">
          <label htmlFor="issue">Descripción del problema</label>
          <textarea
            id="issue"
            name="issue"
            required
            minLength="10"
            maxLength="500"
          ></textarea>
          <small className="error"></small>
        </div>

        <div className="field">
          <label htmlFor="order">Código de producto (opcional)</label>
          <input
            id="order"
            name="order"
            pattern="[A-Z]{2,3}[0-9]{3}"
            placeholder="Ej: JM001"
          />
          <small className="hint">
            Formato: 2-3 letras + 3 números (p. ej., JM001).
          </small>
          <small className="error"></small>
        </div>

        <button type="submit" className="btn-accent">Enviar</button>

        <a
          className="btn-outline"
          target="_blank"
          rel="noopener noreferrer"
          href="https://wa.me/56912345678?text=Hola%20necesito%20soporte%20técnico."
        >
          Chatear por WhatsApp
        </a>
      </form>
    </section>
  );
}
