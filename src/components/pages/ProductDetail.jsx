// src/components/pages/Product.jsx
import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import Footer from '../molecules/Footer';
import PRODUCTS from '../../data/products';
import Price from '../atoms/Price';
import Button from '../atoms/Button';

export default function Product({ onAdd }) {
  const { code } = useParams();

  const product = useMemo(
    () =>
      code
        ? PRODUCTS.find(
            (x) => String(x.code).toUpperCase() === String(code).toUpperCase()
          )
        : null,
    [code]
  );

  const [mainSrc, setMainSrc] = useState(
    () => product?.images?.[0] || product?.image
  );

  const recos = product
    ? PRODUCTS.filter(
        (p) => p.category === product.category && p.code !== product.code
      ).slice(0, 6)
    : [];

  return (
    <>
      {product ? (
        <>
          <section className="section container">
            <h2>{product.name}</h2>
            <div className="detail-grid">
              <div className="gallery">
                <div className="gallery-main">
                  <img src={mainSrc} alt={product.name} />
                </div>
                <div className="thumbs">
                  {(product.images?.length ? product.images : [product.image]).map(
                    (src) => (
                      <img
                        key={src}
                        src={src}
                        alt={product.name}
                        className={src === mainSrc ? 'active' : ''}
                        onClick={() => setMainSrc(src)}
                      />
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="chip">{product.category}</p>
                <p className="meta">
                  Código: {product.code} • Año: {product.year}
                </p>
                <p>{product.description}</p>
                {product.origin && (
                  <p className="meta">
                    Fabricante: {product.origin.manufacturer} — Distribuidor:{' '}
                    {product.origin.distributor}
                  </p>
                )}

                <h3 style={{ marginTop: 12 }}>
                  <Price value={product.price} />
                </h3>

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Button kind="primary" onClick={() => onAdd(product)}>
                    Añadir al carrito
                  </Button>
                </div>

                <div style={{ marginTop: 18 }}>
                  <Link className="btn" to="/">
                    ← Volver
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="section container">
            <h2 className="section-title">Te puede interesar</h2>
            <p className="section-subtitle">
              Productos de la misma categoría.
            </p>

            <div className="grid">
              {recos.map((p) => {
                if (p.code === product.code) return null;
                return (
                  <article key={p.code} className="card">
                    <div className="media">
                      <img src={p.images?.[0] || p.image} alt={p.name} />
                    </div>
                    <div className="body">
                      <span className="badge">{p.category}</span>
                      <h3>
                        <Link to={`/product/${p.code}`}>{p.name}</Link>
                      </h3>
                      <div className="price">
                        <Price value={p.price} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <section id="productos" className="section container">
          <h2 className="section-title">Catálogo de Productos</h2>
          <p className="section-subtitle">
            Explora artículos gamer seleccionados por nuestra comunidad.
          </p>

          <div className="grid">
            {PRODUCTS.map((p) => (
              <article key={p.code} className="card">
                <div className="media">
                  <Link to={`/product/${p.code}`}>
                    <img src={p.image} alt={p.name} />
                  </Link>
                </div>
                <div className="body">
                  <span className="badge">{p.category}</span>
                  <h3>{p.name}</h3>
                  <div className="price">
                    <Price value={p.price} />
                  </div>
                  <Link to={`/product/${p.code}`} className="btn-accent">
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
