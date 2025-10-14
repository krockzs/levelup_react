import Button from '../atoms/Button';
import Price from '../atoms/price';
import { cartTotal } from '../../utils/cart';

export default function Cart({ cart, onRemove, onSetQty, onClear }) {
  const total = cartTotal(cart);

  return (
    <section className="section container">
      <h2>Carrito</h2>
      {cart.length === 0 ? (
        <p>No hay productos en tu carrito.</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Imagen</th><th>Nombre</th><th>Código</th><th>Precio</th>
                <th>Cantidad</th><th>Subtotal</th><th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(it => (
                <tr key={it.code}>
                  <td><img src={it.image} alt={it.name} /></td>
                  <td>{it.name}</td>
                  <td>{it.code}</td>
                  <td><Price value={it.price} /></td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={it.qty || 1}
                      onChange={e => onSetQty(it.code, e.target.value)}
                      style={{ width: 64 }}
                    />
                  </td>
                  <td><Price value={(it.qty || 1) * it.price} /></td>
                  <td>
                    <Button onClick={() => onRemove(it.code)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p><strong>Total: </strong><Price value={total} /></p>
          <div style={{ display:'flex', gap:'8px' }}>
            <Button onClick={onClear}>Vaciar carrito</Button>
            <Button kind="primary" onClick={() => alert('Checkout de examen')}>Comprar</Button>
          </div>
        </>
      )}
    </section>
  );
}
