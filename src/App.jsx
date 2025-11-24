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

import { getCurrentUser } from './utils/users';

export default function App() {
  const [cart, setCart] = useState(() => loadCart());
  const [session, setSession] = useState(() => getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => { persistCart(cart); }, [cart]);

  // Escuchar login
  useEffect(() => {
    const onSess = (e) => setSession(e.detail ?? getCurrentUser());
    window.addEventListener('lv:session', onSess);
    return () => window.removeEventListener('lv:session', onSess);
  }, []);

  // Si no hay sesión → redirigir al perfil
  const requireLogin = () => {
    if (session?.token) return true;  // ⬅ ahora validamos token
    navigate('/perfil?needLogin=1');
    window.dispatchEvent(new CustomEvent('lv:notice', {
      detail: 'Debes estar registrado para comprar en la tienda.',
    }));
    return false;
  };

  // Añadir al carrito: requiere login
  const handleAdd = (product, qty = 1) => {
    if (!requireLogin()) return;
    setCart(addToCart(product));
  };

  const handleRemove = (code)      => setCart(removeFromCart(code));
  const handleSetQty = (code, qty) => setCart(setQtyInCart(code, qty));
  const handleClear  = ()          => setCart(clearCart());

  // Checkout
  const handleCheckout = () => {
    if (!requireLogin()) return { ok:false, reason:'auth' };

    // por ahora no tenemos puntos desde backend
    setCart(clearCart());
    return { ok:true };
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
