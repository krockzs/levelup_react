// src/components/pages/ProductDetail.jsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import Footer from '../molecules/Footer';
import PRODUCTS from '../../data/products';
import Price from '../atoms/Price';
import Button from '../atoms/Button';
import { getCurrentUser } from '../../utils/users';

const REV_KEY = 'lv_reviews';
function loadReviews() {
  try {
    const raw = localStorage.getItem(REV_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return typeof obj === 'object' && obj ? obj : {};
  } catch {
    return {};
  }
}
function persistReviews(map) {
  try { localStorage.setItem(REV_KEY, JSON.stringify(map || {})); } catch {}
}
function stars(n = 0) {
  const arr = [];
  for (let i = 1; i <= 5; i++) arr.push(i <= n);
  return arr;
}

export default function ProductDetail({ onAdd }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Buscar producto por código
  const product = useMemo(
    () =>
      code
        ? PRODUCTS.find(
            (x) => String(x.code).toUpperCase() === String(code).toUpperCase()
          )
        : null,
    [code]
  );

  // Imagen principal de la galería
  const [mainSrc, setMainSrc] = useState(() => product?.images?.[0] || product?.image);

  // Reset al cambiar de producto
  useEffect(() => {
    if (product) {
      const first = (product.images && product.images[0]) || product.image || '';
      setMainSrc(first);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.code]);

  // ===== Popup "añadido" =====
  const [addedPopup, setAddedPopup] = useState(null); // string | null

  // ===== Reseñas =====
  const [reviewsMap, setReviewsMap] = useState(() => loadReviews());
  const reviews = useMemo(() => reviewsMap[code] || [], [reviewsMap, code]);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    const s = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return Math.round((s / reviews.length) * 10) / 10;
  }, [reviews]);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    setRating(0);
    setHover(0);
    setText('');
  }, [code]);

  function submitReview(e) {
    e.preventDefault();
    const r = Number(rating);
    const t = String(text || '').trim();
    if (!r || r < 1 || r > 5) return;
    if (!t) return;

    const map = loadReviews();
    const list = Array.isArray(map[code]) ? map[code].slice() : [];
    const now = new Date();
    list.unshift({
      id: now.getTime(),
      author: user?.name || 'Anónimo',
      rating: r,
      text: t,
      date: now.toISOString(),
    });
    map[code] = list;
    persistReviews(map);
    setReviewsMap(map);

    setRating(0);
    setHover(0);
    setText('');
  }

  return (
    <>
      {product ? (
        <>
          <section className="section container">
            <h2>{product.name}</h2>
            <div className="detail-grid">
              {/* Galería */}
              <div className="gallery">
                <div className="gallery-main">
                  <img src={mainSrc} alt={product.name} />
                </div>
                <div className="thumbs">
                  {(product.images?.length ? product.images : [product.image])
                    .filter(Boolean)
                    .map((src) => (
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

              {/* Panel derecho */}
              <div>
                {/* Promedio de estrellas debajo del título */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,.04)',
                    marginBottom: 10
                  }}
                  aria-label={`Promedio ${avg} de 5 estrellas`}
                >
                  <div style={{ display: 'flex', gap: 2 }}>
                    {stars(Math.round(avg)).map((on, idx) => (
                      <FaStar key={idx} size={16} color={on ? '#facc15' : '#475569'} />
                    ))}
                  </div>
                  <strong>{avg.toFixed(1)}</strong>
                  <span className="meta">({reviews.length})</span>
                </div>

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
                  <Button
                    kind="primary"
                    onClick={() => {
                      onAdd(product);                // añade (App maneja auth)
                      if (getCurrentUser()) {        // si hay sesión → popup
                        setAddedPopup(`Producto “${product.name}” añadido`);
                      }
                    }}
                  >
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

          {/* Reseñas */}
          <section className="section container">
            <h2 className="section-title">Reseñas</h2>
            <p className="section-subtitle">
              Deja tu opinión. {user ? `Se publicará como ${user.name}.` : 'Se publicará como Anónimo.'}
            </p>

            {/* Formulario */}
            <form className="form" onSubmit={submitReview} style={{ marginBottom: 16 }}>
              <div className="field">
                <label>Tu puntuación</label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = (hover || rating) >= n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(n)}
                        aria-label={`${n} estrellas`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          lineHeight: 0,
                        }}
                      >
                        <FaStar size={24} color={active ? '#facc15' : '#475569'} />
                      </button>
                    );
                  })}
                  <span className="meta" style={{ marginLeft: 8 }}>
                    {rating ? `${rating}/5` : 'Sin seleccionar'}
                  </span>
                </div>
              </div>

              <div className="field">
                <label htmlFor="review_text">Tu reseña</label>
                <textarea
                  id="review_text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="¿Qué tal te pareció este producto?"
                  minLength={4}
                  maxLength={800}
                  required
                />
                <small className="hint">Entre 4 y 800 caracteres.</small>
              </div>

              <div className="actions">
                <button className="btn-accent" type="submit" disabled={!rating || !text.trim()}>
                  Publicar reseña
                </button>
              </div>
            </form>

            {/* Lista de reseñas */}
            {!reviews.length ? (
              <p className="meta">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
                {reviews.map((r) => (
                  <li key={r.id} className="card" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {stars(r.rating).map((on, i) => (
                          <FaStar key={i} size={16} color={on ? '#facc15' : '#475569'} />
                        ))}
                      </div>
                      <span className="meta">— {r.author}</span>
                      <span className="meta" style={{ marginLeft: 'auto' }}>
                        {new Date(r.date).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                    <p style={{ margin: 0 }}>{r.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <section id="productos" className="section container">
          <h2 className="section-title">Catálogo de Productos</h2>
          <p className="section-subtitle">Explora artículos gamer seleccionados por nuestra comunidad.</p>

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
