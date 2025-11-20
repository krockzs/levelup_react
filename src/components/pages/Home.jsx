import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getProducts } from '../../data/productsApi'; 

import ProductGrid from '../organisms/ProductGrid';
import Community from '../organisms/Community';
import Eventos from '../organisms/Eventos';
import Contacto from '../organisms/Contacto';
import Footer from '../molecules/Footer';
import { getCurrentUser } from '../../utils/users';

export default function Home({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [addedPopup, setAddedPopup] = useState(null);
  const navigate = useNavigate();

  // ====================== CARGAR PRODUCTOS DESDE API ======================
  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        setProducts([]);
      });
  }, []);

  // ====================== FILTROS ======================
  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());

    // backend usa "categoria"
    const matchesCategory = category === 'all' || p.categoria === category;

    return matchesQuery && matchesCategory;
  });

  // ======================= AÑADIR PRODUCTO =======================
  const onAddWithPopup = (product) => {
    onAdd(product); // App maneja auth/redirect
    if (getCurrentUser()) {
      setAddedPopup(`Producto “${product.name}” añadido`);
    }
  };

  return (
    <>
      {/* 🟩 Filtro superior */}
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

        <ProductGrid products={filtered} onAdd={onAddWithPopup} />
      </section>

      <Community />
      <Eventos />
      <Contacto />
      <Footer />

      {/* Popup añadido */}
      {addedPopup && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setAddedPopup(null)}
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,.6)',
            display:'grid', placeItems:'center', zIndex:60
          }}
        >
          <div
            onClick={(e)=>e.stopPropagation()}
            style={{
              width:'min(520px,92vw)', background:'rgba(17,24,39,.95)',
              border:'1px solid rgba(255,255,255,.12)', borderRadius:14, padding:18
            }}
          >
            <h3 style={{margin:0, marginBottom:8}}>Producto añadido</h3>
            <p className="meta" style={{margin:0}}>{addedPopup}</p>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
              <button className="btn" onClick={() => setAddedPopup(null)}>Cerrar</button>
              <button className="btn-accent" onClick={() => navigate('/cart')}>Ir a Carrito</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
