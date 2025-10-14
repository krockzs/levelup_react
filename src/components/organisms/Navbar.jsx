// src/components/organisms/Navbar.jsx
import { Link } from 'react-router-dom';
import { cartCount } from '../../utils/cart';

export default function Navbar({ cart }) {
  const count = cartCount(cart);

  return (
    <header className="primero">
      <nav className="nav container">
        {/* Logo */}
        <Link className="logo-nav" to="/">
          <img src="/imagenes/Logo/LOGO.png" alt="LevelUp" />
          <span>LevelUp</span>
        </Link>

        {/* Enlaces principales */}
        <ul className="nav-links">
          <li><a href="/#productos">Productos</a></li>
          <li><a href="/#comunidad">Comunidad</a></li>
          <li><a href="/#eventos">Eventos</a></li>
          <li><a href="/#contacto">Soporte</a></li>
        </ul>

        {/* Bloque de usuario */}
        <div className="user-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span id="nav-usuario" className="badge">Invitado</span>
          <a className="btn-outline" href="/registro.html" id="btn-login">Iniciar sesión / Registrarse</a>
          <a className="btn-outline" href="/perfil.html" id="btn-perfil">Perfil</a>
          <button className="btn-outline" id="btn-logout" style={{ display: 'none' }}>Cerrar sesión</button>
        </div>

        {/* Carrito y soporte */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/cart" className="btn">🛒 Carrito ({count})</Link>
          <a
            className="btn-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            href="https://wa.me/56912345678?text=Hola%20vengo%20desde%20LevelUp%20y%20necesito%20soporte%20técnico."
          >
            WhatsApp soporte
          </a>
        </div>
      </nav>
    </header>
  );
}
