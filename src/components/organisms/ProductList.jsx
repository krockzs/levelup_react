import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../data/productsApi";

export default function ProductList({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(data => {
        setProducts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div className="grid">
      {products.map(p => (
        <div key={p.code} className="card">
          {/* Imagen principal */}
          {p.images?.length > 0 && (
            <img
              src={p.images[0]}
              alt={p.name}
              className="card-img"
            />
          )}

          <h3>{p.name}</h3>
          <p>${p.price}</p>

          <button onClick={() => onAdd(p)}>Añadir</button>

          <Link to={`/product/${p.code}`}>Ver más</Link>
        </div>
      ))}
    </div>
  );
}
