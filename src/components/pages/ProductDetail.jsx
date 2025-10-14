import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PRODUCTS from '../../data/products';
import Button from '../atoms/Button';
import Price from '../atoms/price';

export default function ProductDetail({ onAdd }) {
  const { code = '' } = useParams();
  const product = useMemo(
    () => PRODUCTS.find(x => String(x.code).toUpperCase() === String(code).toUpperCase()),
    [code]
  );

  const [mainSrc, setMainSrc] = useState(() => (product?.images?.[0] || product?.image));

  if (!product) {
    return (
      <section className="section container">
        <h2>Producto no encontrado</h2>
        <a className="btn" href="/">Volver</a>
      </section>
    );
  }

  const imgs = product.images?.length ? product.images : [product.image];

  return (
    <section className="section container">
      <h2>{product.name}</h2>
      <div className="detail-grid">
        {/* Galería */}
        <div className="gallery">
          <div className="gallery-main">
            <img src={mainSrc} alt={product.name} />
          </div>
          <div className="thumbs">
            {imgs.map((src) => (
              <img
                key={src}
                src={src}
                alt={product.name}
                className={src === mainSrc ? 'active' : ''}
                onClick={() => setMainSrc(src)}
              />
            ))}
          </div>
        </div>

        {/* Detalle */}
        <div>
          <p className="chip">{product.category}</p>
          <p className="meta">Código: {product.code} • Año: {product.year}</p>
          <p>{product.description}</p>
          {product.origin && (
            <p className="meta">
              Fabricante: {product.origin.manufacturer} — Distribuidor: {product.origin.distributor}
            </p>
          )}

          <h3 style={{ marginTop: 12 }}><Price value={product.price} /></h3>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Button kind="primary" onClick={() => onAdd(product)}>Añadir al carrito</Button>
          </div>

          <div style={{ marginTop: 18 }}>
            <a className="btn" href="/">← Volver</a>
          </div>
        </div>
      </div>
    </section>
  );
}
