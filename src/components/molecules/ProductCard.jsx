import Price from "../atoms/Price";
import Button from "../atoms/Button";

export default function ProductCard({ p, onAdd }) {
  const firstImg = (p.images && p.images[0]) || p.image;

  return (
    <article className="card" data-code={p.code} data-category={p.category}>
      <a className="media" href={`/product/${p.code}`}>
        <img src={firstImg} alt={p.name} />
      </a>
      <div className="body">
        <span className="badge">{p.category}</span>
        <h3 style={{ margin: 0 }}>
          <a href={`/product/${p.code}`} style={{ color: "inherit", textDecoration: "none" }}>
            {p.name}
          </a>
        </h3>
        <div><Price value={p.price} /></div>
        <div className="meta">Código: {p.code}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button kind="primary" onClick={() => onAdd(p)}>Añadir</Button>
        </div>
      </div>
    </article>
  );
}
