import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Cart from './components/pages/Cart';
import ProductDetail from './components/pages/ProductDetail';
import Navbar from './components/organisms/Navbar';
import {
  loadCart,        // alias de getCart
  persistCart,     // alias de setCart
  addToCart,
  removeFromCart,
  setQtyInCart,
  clearCart
} from './utils/cart';

export default function App() {
  const [cart, setCart] = useState(() => loadCart());

  // Persistir en localStorage cuando cambie el carro
  useEffect(() => { persistCart(cart); }, [cart]);

  // Handlers (usan las funciones que ya tienes y actualizan el estado con su retorno)
  const handleAdd    = (product, qty = 1) => setCart(addToCart(product));             // tu addToCart no usa qty
  const handleRemove = (code)                => setCart(removeFromCart(code));
  const handleSetQty = (code, qty)           => setCart(setQtyInCart(code, qty));
  const handleClear  = ()                     => setCart(clearCart());

  return (
    <>
      <Navbar cart={cart} />
      <Routes>
        <Route path="/" element={<Home onAdd={handleAdd} />} />
        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              onRemove={handleRemove}
              onSetQty={handleSetQty}
              onClear={handleClear}
            />
          }
        />
        <Route path="/product/:code" element={<ProductDetail onAdd={handleAdd} />} />
      </Routes>
    </>
  );
}
