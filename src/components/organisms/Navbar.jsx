import { Link } from 'react-router-dom';
import { cartCount } from '../../utils/cart';

export default function Navbar({ cart }) {
  const count = cartCount(cart);
  return (
    <header className="header">
      <nav className="nav container">
        <Link to="/">LevelUp</Link>
        <div className="grow" />
        <a href="/#productos">Productos</a>
        <Link to="/cart" className="btn">Carrito ({count})</Link>
      </nav>
    </header>
  );
}
