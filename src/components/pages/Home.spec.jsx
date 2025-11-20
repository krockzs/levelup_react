import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

import { getProducts } from '../../data/productsApi';
import { getCurrentUser } from '../../utils/users';

// =======================================
// Mocks de API y módulos dependientes
// =======================================

jest.mock('../../data/productsApi', () => ({
  getProducts: jest.fn(),
}));

jest.mock('../organisms/ProductGrid', () => ({ products, onAdd }) => (
  <div data-testid="product-grid">
    {products.map((p) => (
      <div key={p.code} data-testid="product-item">
        {p.name}
        <button onClick={() => onAdd(p)}>Agregar</button>
      </div>
    ))}
  </div>
));

jest.mock('../organisms/Community', () => () => <div data-testid="community" />);
jest.mock('../organisms/Eventos', () => () => <div data-testid="eventos" />);
jest.mock('../organisms/Contacto', () => () => <div data-testid="contacto" />);
jest.mock('../molecules/Footer', () => () => <div data-testid="footer" />);

jest.mock('../../utils/users', () => ({
  getCurrentUser: jest.fn(),
}));

// =======================================
// PRODUCTOS MOCK
// =======================================
const mockData = [
  {
    code: 'MS001',
    categoria: 'Mouse',
    name: 'Logitech G502 HERO',
    price: 49990,
    images: ['/img/m1.jpg'],
  },
  {
    code: 'SG001',
    categoria: 'Sillas Gamers',
    name: 'Secretlab Titan',
    price: 349990,
    images: ['/img/s1.jpg'],
  },
];

describe('<Home />', () => {
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    getProducts.mockResolvedValue(mockData); // API mock
  });

  // =======================================
  // Renderiza estructura principal
  // =======================================
  test('renderiza los elementos principales y los componentes hijos', async () => {
    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    expect(screen.getByText('Tienda De Artículos Gamer')).toBeInTheDocument();
    expect(screen.getByTestId('community')).toBeInTheDocument();
    expect(screen.getByTestId('eventos')).toBeInTheDocument();
    expect(screen.getByTestId('contacto')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    expect(await screen.findByTestId('product-grid')).toBeInTheDocument();
  });

  // =======================================
  // Filtrado por texto
  // =======================================
  test('filtra productos por texto ingresado', async () => {
    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Buscar producto...');

    fireEvent.change(input, { target: { value: 'Logitech' } });

    await waitFor(() => {
      const items = screen.getAllByTestId('product-item');
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent('Logitech G502 HERO');
    });
  });

  // =======================================
  // Filtrado por categoría real (categoria)
  // =======================================
  test('filtra productos por categoría', async () => {
    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    const select = screen.getByLabelText('Filtrar por categoría');

    fireEvent.change(select, { target: { value: 'Mouse' } });

    await waitFor(() => {
      const items = screen.getAllByTestId('product-item');
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent('Logitech G502 HERO');
    });
  });

  // =======================================
  // Popup cuando hay usuario
  // =======================================
  test('muestra popup al agregar producto si hay usuario logeado', async () => {
    getCurrentUser.mockReturnValue({ name: 'Tony Stark' });

    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    const addButton = await screen.findAllByText('Agregar');
    fireEvent.click(addButton[0]);

    await waitFor(() =>
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    );

    expect(
      screen.getByText(/Producto “Logitech G502 HERO” añadido/)
    ).toBeInTheDocument();
  });

  // =======================================
  // NO popup cuando no hay usuario
  // =======================================
  test('no muestra popup si no hay usuario logeado', async () => {
    getCurrentUser.mockReturnValue(null);

    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    const addButton = await screen.findAllByText('Agregar');
    fireEvent.click(addButton[0]);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
