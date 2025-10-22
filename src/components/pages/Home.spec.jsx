// src/components/pages/Home.spec.jsx

import React from 'react'; 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

// 🧩 Mock de módulos dependientes
jest.mock('../../data/products', () => ([
  {
    code: 'MS001',
    category: 'Mouse',
    name: 'Logitech G502 HERO',
    price: 49990,
  },
  {
    code: 'SG001',
    category: 'Sillas Gamers',
    name: 'Secretlab Titan',
    price: 349990,
  },
]));

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

const { getCurrentUser } = require('../../utils/users');

// 🧪 TESTS
describe('<Home />', () => {
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 2️⃣ Renderiza correctamente la estructura principal
  test('renderiza los elementos principales y los componentes hijos', () => {
    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    expect(screen.getByText('Tienda De Artículos Gamer')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    expect(screen.getByTestId('community')).toBeInTheDocument();
    expect(screen.getByTestId('eventos')).toBeInTheDocument();
    expect(screen.getByTestId('contacto')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  // 3️⃣ Filtrado por texto en el input de búsqueda
  test('filtra productos por texto ingresado en el buscador', () => {
    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Buscar producto...');
    fireEvent.change(input, { target: { value: 'Logitech' } });

    const items = screen.getAllByTestId('product-item');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Logitech G502 HERO');
  });

  // 4️⃣ Filtrado por categoría seleccionada
  test('filtra productos por categoría seleccionada', () => {
    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    const select = screen.getByLabelText('Filtrar por categoría');
    fireEvent.change(select, { target: { value: 'Mouse' } });

    const items = screen.getAllByTestId('product-item');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Logitech G502 HERO');
  });

  // 5️⃣ Popup se muestra solo si hay usuario logeado
  test('muestra popup al agregar producto si hay usuario logeado', async () => {
    getCurrentUser.mockReturnValue({ name: 'Tony Stark' });

    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    const addButton = screen.getAllByText('Agregar')[0];
    fireEvent.click(addButton);

    await waitFor(() =>
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    );

    expect(screen.getByText(/Producto “Logitech G502 HERO” añadido/)).toBeInTheDocument();
  });

  // 6️⃣ Popup NO se muestra si no hay sesión iniciada
  test('no muestra popup si no hay usuario logeado', async () => {
    getCurrentUser.mockReturnValue(null);

    render(
      <MemoryRouter>
        <Home onAdd={mockOnAdd} />
      </MemoryRouter>
    );

    const addButton = screen.getAllByText('Agregar')[0];
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
