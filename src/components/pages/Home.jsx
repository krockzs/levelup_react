import products from '../../data/products';
import ProductGrid from '../organisms/ProductGrid';

export default function Home({ onAdd }) {
  return (
    <section className="section container" id="productos">
      <h2>Productos</h2>
      <p>Encuentra tu próximo setup.</p>
      <ProductGrid products={products} onAdd={onAdd} />
    </section>
  );
}
