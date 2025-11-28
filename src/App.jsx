import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Home from './components/pages/Home';
import Cart from './components/pages/Cart';
import ProductDetail from './components/pages/ProductDetail';
import Perfil from './components/pages/Perfil';
import Admin from './components/pages/Admin';
import Navbar from './components/organisms/Navbar';
import { getCurrentUser, awardPoints } from './utils/users';

import {
  loadCart,
  persistCart,
  addToCart,
  removeFromCart,
  setQtyInCart,
  clearCart,
} from './utils/cart';


export default function App() {
  const [cart, setCart] = useState(() => loadCart());
  const [session, setSession] = useState(() => getCurrentUser());
  const navigate = useNavigate();

  // Persistir carrito en localStorage
  useEffect(() => {
    persistCart(cart);
  }, [cart]);

  // Escuchar cambios globales de sesión (si en algún momento los disparas con lv:session)
  useEffect(() => {
    const onSess = (e) => setSession(e.detail ?? getCurrentUser());
    window.addEventListener('lv:session', onSess);
    return () => window.removeEventListener('lv:session', onSess);
  }, []);

  // Requiere login para comprar / finalizar compra
  const requireLogin = () => {
    if (session?.token) return true;

    navigate('/perfil?needLogin=1');
    window.dispatchEvent(
      new CustomEvent('lv:notice', {
        detail: 'Debes estar registrado para comprar en la tienda.',
      }),
    );
    return false;
  };

  // Añadir al carrito
  const handleAdd = (product) => {
    if (!requireLogin()) return;
    setCart(addToCart(product));
  };

  // Eliminar item del carrito
  const handleRemove = (code) => {
    setCart(removeFromCart(code));
  };

  // Cambiar cantidad
  const handleSetQty = (code, qty) => {
    setCart(setQtyInCart(code, qty));
  };

  // Vaciar carrito
  const handleClear = () => {
    setCart(clearCart());
  };

  const handleCheckout = async ({ points_awarded } = {}) => {
    if (!requireLogin()) {
      return { ok: false, reason: 'auth' };
    }

    const pts = Number(points_awarded || 0);

    const res = await awardPoints(pts);
    if (!res.ok) {
      return { ok: false, reason: 'points', msg: res.msg };
    }

    setCart(clearCart());
    return { ok: true };
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
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}
