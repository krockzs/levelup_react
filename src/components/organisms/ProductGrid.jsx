import ProductCard from '../molecules/ProductCard';

export default function ProductGrid({ products, onAdd }) {
   if (!products.length) {
    return <p className="meta">No se encontraron productos.</p>;
  }
  return (
    <div className="grid">
      {products.map(p => (
        <ProductCard key={p.code} p={p} onAdd={onAdd} />
      ))}
    </div>
  );
}
