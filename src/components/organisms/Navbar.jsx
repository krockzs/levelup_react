// src/components/organisms/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cartCount } from '../../utils/cart';
import { FaUser, FaShoppingCart, FaWhatsapp, FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar({ cart, session }) {
  const count = cartCount(cart);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="primero">
      <nav className="nav container">
        {/* Logo */}
        <Link className="logo-nav" to="/" onClick={closeMenu}>
          <img src="/imagenes/Logo/LOGO.png" alt="LevelUp" />
          <span>LevelUp</span>
        </Link>

        {/* Botón Hamburguesa */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Menú">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Contenido del menú */}
        <div className={`menu-content ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-links" onClick={closeMenu}>
            <li><a href="/#productos">Productos</a></li>
            <li><a href="/#comunidad">Comunidad</a></li>
            <li><a href="/#eventos">Eventos</a></li>
            <li><a href="/#contacto">Soporte</a></li>
          </ul>

          <div className="icon-links" onClick={closeMenu}>
            <Link to="/perfil" className="icon-link" aria-label="Mi cuenta">
              <FaUser />
              {session ? (
                <span style={{ lineHeight: 1, textAlign: 'center' }}>
                  <strong style={{ display: 'block' }}>{session.name}</strong>
                  <small style={{ opacity: .85 }}>Mi cuenta</small>
                </span>
              ) : (
                <span>Mi cuenta</span>
              )}
            </Link>

            <Link to="/cart" className="icon-link" aria-label="Carrito">
              <FaShoppingCart />
              <span>Carrito ({count})</span>
            </Link>

            <a
              href="https://wa.me/56912345678?text=Hola%20vengo%20desde%20LevelUp%20y%20necesito%20soporte%20técnico."
              className="icon-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contacto por WhatsApp"
            >
              <FaWhatsapp />
              <span>Contacto</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
