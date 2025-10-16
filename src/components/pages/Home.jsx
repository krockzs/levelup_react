import { useState } from 'react';
import productsData from '../../data/products';
import ProductGrid from '../organisms/ProductGrid';
import Community from '../organisms/Community';
import Eventos from '../organisms/Eventos';
import Contacto from '../organisms/Contacto';
import Footer from '../molecules/Footer';


export default function Home({ onAdd }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  // Filtrado dinámico
  const filtered = productsData.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <>
      {/* 🟩 Filtro superior (segundo) */}
      <section className="segundo">
        <h1>Tienda De Artículos Gamer</h1>
        <p>Ofertas, noticias gamer, guías y eventos para ganar puntos LevelUp.</p>

        <div className="filters">
          <input
            id="q"
            type="search"
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            id="category"
            aria-label="Filtrar por categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            <option>Juegos de Mesa</option>
            <option>Accesorios</option>
            <option>Consolas</option>
            <option>Computadores Gamers</option>
            <option>Sillas Gamers</option>
            <option>Mouse</option>
            <option>Mousepad</option>
            <option>Poleras Personalizadas</option>
            <option>Polerones Gamers Personalizados</option>
          </select>
        </div>
      </section>

      {/* 🟩 Grid de productos */}
      <section className="section container" id="productos">
        <h2>Productos</h2>
        <p>Encuentra tu próximo setup.</p>
        <ProductGrid products={filtered} onAdd={onAdd} />
      </section>
      <Community />
      <Eventos />
      <Contacto />
      <Footer />
    </>
  );
}
