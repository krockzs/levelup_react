import ProductCard from '../molecules/ProductCard';

export default function ProductGrid({ products, onAdd }) {
  return (
    <div className="grid">
      {products.map(p => (
        <ProductCard key={p.code} p={p} onAdd={onAdd} />
      ))}
    </div>
  );
}
