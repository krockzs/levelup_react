// src/components/organisms/Navbar.jsx
import { Link } from 'react-router-dom';
import { cartCount } from '../../utils/cart';
import { FaUser, FaShoppingCart, FaWhatsapp } from 'react-icons/fa';

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

        {/* Enlaces de acción tipo icono */}
        <div className="icon-links">
          <a href="/perfil.html" className="icon-link">
            <FaUser />
            <span>Mi cuenta</span>
          </a>

          <Link to="/cart" className="icon-link">
            <FaShoppingCart />
            <span>Carrito ({count})</span>
          </Link>

          <a
            href="https://wa.me/56912345678?text=Hola%20vengo%20desde%20LevelUp%20y%20necesito%20soporte%20técnico."
            className="icon-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp />
            <span>Contacto</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
