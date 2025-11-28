// src/components/pages/Cart.jsx

import React, { useMemo, useState } from 'react';
import Button from '../atoms/Button';
import Price from '../atoms/Price';
import { cartTotal } from '../../utils/cart';

// 10 puntos por cada $10.000 CLP
const pointsForAmount = (amountCLP = 0) => Math.floor(amountCLP / 10000) * 10;

export default function Cart({ cart, session, onRemove, onSetQty, onClear, onCheckout }) {
  const total = cartTotal(cart);

  const cartPoints = useMemo(() => {
    return cart.reduce((acc, it) => {
      const qty = Number(it.qty || 1);
      const subtotal = qty * Number(it.price || 0);
      return acc + pointsForAmount(subtotal);
    }, 0);
  }, [cart]);

  const [popup, setPopup] = useState(null); // {title, message}

  const doCheckout = async () => {
    if (!cart.length) return;
    if (!onCheckout) return;

    try {
      const r = await onCheckout({ points_awarded: cartPoints });

      // Si explícitamente viene ok === false => error real
      if (r && r.ok === false) {
        if (r.reason === 'auth') return; // App ya mandó a /perfil
        setPopup({
          title: 'Ups',
          message: r.msg || 'No se pudo completar la compra.',
        });
        return;
      }

      // Cualquier otra cosa (undefined, null, ok===true) la tomamos como éxito
      setPopup({
        title: 'Compra finalizada',
        message: `Total ${new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
        }).format(total)} — Puntos otorgados: ${cartPoints}`,
      });
    } catch (err) {
      // Por si onCheckout lanza excepción
      setPopup({
        title: 'Ups',
        message: 'No se pudo completar la compra.',
      });
    }
  };

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
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Código</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((it) => (
                <tr key={it.code}>
                  <td>
                    <img src={it.image} alt={it.name} />
                  </td>
                  <td>{it.name}</td>
                  <td>{it.code}</td>
                  <td>
                    <Price value={it.price} />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={it.qty || 1}
                      onChange={(e) => onSetQty(it.code, e.target.value)}
                      style={{ width: 64 }}
                    />
                  </td>
                  <td>
                    <Price value={(it.qty || 1) * it.price} />
                  </td>
                  <td>
                    <Button onClick={() => onRemove(it.code)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>
            <strong>Total: </strong>
            <Price value={total} />
          </p>
          <p className="meta">
            <strong>Puntos del carrito: </strong>
            {cartPoints}
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={onClear}>Vaciar carrito</Button>
            <Button kind="primary" onClick={doCheckout}>
              Comprar
            </Button>
          </div>
        </>
      )}

      {/* Popup de confirmación / error */}
      {popup && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPopup(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.6)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px,92vw)',
              background: 'rgba(17,24,39,.95)',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 14,
              padding: 18,
              boxShadow: '0 10px 30px rgba(0,0,0,.6)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>{popup.title}</h3>
            <p className="meta" style={{ marginTop: 0 }}>
              {popup.message}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 12,
              }}
            >
              <button className="btn" onClick={() => setPopup(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
