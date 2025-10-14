const KEY = 'lu_cart';

export function getCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
// === aliases para compatibilidad con App.jsx ===
export function loadCart() {
  return getCart();
}

export function persistCart(items) {
  return setCart(items);
}
export function setCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items || []));
}

export function addToCart(item) {
  const arr = getCart();
  const idx = arr.findIndex(x => x.code === item.code);
  if (idx >= 0) arr[idx].qty = (arr[idx].qty || 1) + 1;
  else arr.push({
    code: item.code,
    name: item.name,
    price: item.price,
    image: item.images?.[0] || item.image,
    qty: 1
  });
  setCart(arr);
  return arr;
}

export function removeFromCart(code) {
  const arr = getCart().filter(x => x.code !== code);
  setCart(arr);
  return arr;
}

export function setQtyInCart(code, qty) {
  const q = Math.max(1, Number(qty) || 1);
  const arr = getCart().map(x => x.code === code ? { ...x, qty: q } : x);
  setCart(arr);
  return arr;
}

export function clearCart() { setCart([]); return []; }

export function cartCount(cart) {
  return (cart || []).reduce((a, x) => a + (x.qty || 1), 0);
}

export function cartTotal(cart) {
  return (cart || []).reduce((a, x) => a + (x.price * (x.qty || 1)), 0);
}
