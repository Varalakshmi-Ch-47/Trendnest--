import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import ProductGrid from '../components/ProductGrid';
import { useAsyncData } from '../hooks/useAsyncData';
import { getProducts } from '../services/productService';
import './Pages.css';

function HomePage() {
  const { data: products, error, loading, reload } = useAsyncData(getProducts, 'home');

  return (
    <div>
      <section className="hero">
        <h1>Welcome to TrendNest</h1>
        <p>Browse our products, add what you like to your cart, and check out in a few clicks.</p>
        <Link to="/products" className="btn">
          Shop now
        </Link>
      </section>

      <div className="section-header">
        <h2>Featured products</h2>
        <Link to="/products">View all</Link>
      </div>

      {loading && <LoadingState message="Loading products..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
      {!loading && !error && products && <ProductGrid products={products.slice(0, 4)} />}
    </div>
  );
}

export default HomePage;