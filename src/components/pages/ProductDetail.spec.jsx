import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetail from './ProductDetail';

import * as users from '../../utils/users';
import { getProductByCode } from '../../data/productsApi';

jest.mock('../../data/productsApi', () => ({
  getProductByCode: jest.fn(),
}));

jest.mock('../../utils/users', () => ({
  getCurrentUser: jest.fn(),
}));

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

describe('ProductDetail (API version)', () => {
  
  const sampleProduct = {
    code: "JM001",
    name: "Catan",
    categoria: "Juegos de Mesa",
    price: 29990,
    year_released: 1995,
    description: "Un clásico juego estratégico.",
    manufacturer: "Devir",
    distributor: "XYZ",
    images: [
      "/imagenes/JuegosDeMesa/catan_1.jpg",
      "/imagenes/JuegosDeMesa/catan2.avif"
    ]
  };

  beforeEach(() => {
    users.getCurrentUser.mockReturnValue({ name: 'Test User' });
    localStorage.clear();
    mockNavigate.mockClear();
    getProductByCode.mockResolvedValue(sampleProduct);
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

  test('Renderiza correctamente los datos del producto desde API', async () => {
    renderWithRouter(sampleProduct.code);

    expect(await screen.findByText(sampleProduct.name)).toBeInTheDocument();
    expect(screen.getByText(sampleProduct.categoria)).toBeInTheDocument();
    expect(
      screen.getByText(`Código: ${sampleProduct.code} • Año: ${sampleProduct.year_released}`)
    ).toBeInTheDocument();
    expect(screen.getByText(sampleProduct.description)).toBeInTheDocument();
  });

  test('Popup “Ir a Carrito” navega correctamente', async () => {
    renderWithRouter(sampleProduct.code);

    const addBtn = await screen.findByText(/Añadir al carrito/i);
    fireEvent.click(addBtn);

    const irBtn = await screen.findByText(/Ir a Carrito/i);
    fireEvent.click(irBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });

  test('Textarea tiene minLength y maxLength válidos', async () => {
    renderWithRouter(sampleProduct.code);

    const ta = await screen.findByPlaceholderText(/¿Qué tal te pareció este producto\?/i);

    expect(ta).toHaveAttribute('minLength', '4');
    expect(ta).toHaveAttribute('maxLength', '800');
  });

});
