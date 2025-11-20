import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './components/pages/Home';
import Cart from './components/pages/Cart';
import ProductDetail from './components/pages/ProductDetail';
import Perfil from './components/pages/Perfil';
import Navbar from './components/organisms/Navbar';
import ProductList from './components/organisms/ProductList';

import {
  loadCart, persistCart, addToCart,
  removeFromCart, setQtyInCart, clearCart
} from './utils/cart';
import { getCurrentUser, addPuntos } from './utils/users';

export default function App() {
  const [cart, setCart] = useState(() => loadCart());
  const [session, setSession] = useState(() => getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => { persistCart(cart); }, [cart]);

  // escuchar login/logout para mantener session
  useEffect(() => {
    const onSess = (e) => setSession(e.detail ?? getCurrentUser());
    window.addEventListener('lv:session', onSess);
    return () => window.removeEventListener('lv:session', onSess);
  }, []);

  // si no está logueado → ir a /perfil con aviso
  const requireLogin = () => {
    if (session) return true;
    navigate('/perfil?needLogin=1');
    window.dispatchEvent(new CustomEvent('lv:notice', {
      detail: 'Debes estar registrado para comprar en la tienda.',
    }));
    return false;
  };

  // Añadir al carrito: bloquea si no hay sesión
  const handleAdd = (product, qty = 1) => {
    if (!requireLogin()) return;
    setCart(addToCart(product)); // (tu addToCart no usa qty)
  };
  const handleRemove = (code)      => setCart(removeFromCart(code));
  const handleSetQty = (code, qty) => setCart(setQtyInCart(code, qty));
  const handleClear  = ()          => setCart(clearCart());

  // Checkout: App recibe los puntos calculados por Cart
  const handleCheckout = ({ points_awarded }) => {
    if (!requireLogin()) return { ok:false, reason:'auth' };
    try {
      addPuntos(session.email, points_awarded || 0);
      setCart(clearCart());
      return { ok:true };
    } catch {
      return { ok:false, reason:'points' };
    }
  };

  return (
    <>
      <Navbar cart={cart} session={session} />
      <Routes>
        <Route path="/" element={<Home onAdd={handleAdd} />} />
        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              session={session}
              onRemove={handleRemove}
              onSetQty={handleSetQty}
              onClear={handleClear}
              onCheckout={handleCheckout}
            />
          }
        />
        <Route path="/product/:code" element={<ProductDetail onAdd={handleAdd} />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </>
  );
}
