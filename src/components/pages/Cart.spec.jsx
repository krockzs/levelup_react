import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Cart from './Cart';

const mockCart = [
  { name: 'Producto 1', code: 'A1', price: 10000, qty: 2, img: 'img1.png' },
  { name: 'Producto 2', code: 'B2', price: 5000, qty: 1, img: 'img2.png' },
];

describe('Cart Component', () => {
  beforeEach(() => {
    render(<Cart cart={mockCart} />);
  });

  const normalizePrice = (text) => text.replace(/\D/g, '');

  test('renderiza la tabla correctamente con productos', () => {
    const rows = screen.getAllByRole('row').slice(1); // excluir header

    rows.forEach((row, i) => {
      const item = mockCart[i];
      const rowWithin = within(row);

      // Nombre y código
      expect(rowWithin.getByText(item.name)).toBeInTheDocument();
      expect(rowWithin.getByText(item.code)).toBeInTheDocument();

      // Precio unitario
      const priceSpan = rowWithin.getAllByText((content, element) => 
        element.tagName.toLowerCase() === 'span' && normalizePrice(content) === String(item.price)
      )[0]; // tomar el primero que corresponde al precio unitario
      expect(priceSpan).toBeInTheDocument();

      // Subtotal
      const subtotalSpan = rowWithin.getAllByText((content, element) => 
        element.tagName.toLowerCase() === 'span' && normalizePrice(content) === String(item.price * item.qty)
      )[0];
      expect(subtotalSpan).toBeInTheDocument();

      // Cantidad
      expect(rowWithin.getByDisplayValue(String(item.qty))).toBeInTheDocument();
    });

    // Total del carrito
    const total = mockCart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const totalSpan = screen.getByText((content, element) => 
      element.tagName.toLowerCase() === 'span' && normalizePrice(content) === String(total)
    );
    expect(totalSpan).toBeInTheDocument();
  });

  test('suma correctamente los puntos del carrito', () => {
    const meta = screen.getByText(/Puntos del carrito:/i).parentElement;
    expect(meta).toHaveTextContent('20');
  });
});
