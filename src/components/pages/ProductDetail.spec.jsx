// src/components/pages/ProductDetail.spec.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import PRODUCTS from '../../data/products';
import * as users from '../../utils/users';

// 🧩 Mock de usuario
jest.mock('../../utils/users', () => ({
  getCurrentUser: jest.fn(),
}));

// 🧭 Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeAll(() => {
  window.scrollTo = jest.fn();
});

describe('ProductDetail', () => {
  const sampleProduct = PRODUCTS[0];

  beforeEach(() => {
    users.getCurrentUser.mockReturnValue({ name: 'Test User' });
    localStorage.clear();
    mockNavigate.mockClear();
  });

  function renderWithRouter(code) {
    render(
      <MemoryRouter initialEntries={[`/product/${code}`]}>
        <Routes>
          <Route path="/product/:code" element={<ProductDetail onAdd={jest.fn()} />} />
        </Routes>
      </MemoryRouter>
    );
  }

  test('Renderiza correctamente los datos del producto', async () => {
    renderWithRouter(sampleProduct.code);
    expect(await screen.findByText(sampleProduct.name)).toBeInTheDocument();
    expect(screen.getByText(sampleProduct.category)).toBeInTheDocument();
    expect(
      screen.getByText(`Código: ${sampleProduct.code} • Año: ${sampleProduct.year}`)
    ).toBeInTheDocument();
    expect(screen.getByText(sampleProduct.description)).toBeInTheDocument();
  });

  test('Popup “Ir a Carrito” navega correctamente', async () => {
    renderWithRouter(sampleProduct.code);
    const addBtn = await screen.findByText(/Añadir al carrito/i);
    fireEvent.click(addBtn);
    fireEvent.click(await screen.findByText(/Ir a Carrito/i));
    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });

  test('Textarea tiene minLength y maxLength válidos', async () => {
    renderWithRouter(sampleProduct.code);
    const ta = await screen.findByPlaceholderText(/¿Qué tal te pareció este producto\?/i);
    expect(ta).toHaveAttribute('minLength', '4');
    expect(ta).toHaveAttribute('maxLength', '800');
  });
});
