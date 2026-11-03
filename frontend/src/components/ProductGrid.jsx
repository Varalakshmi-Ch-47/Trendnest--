import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import './ProductCard.css';

function ProductGrid({ products, emptyTitle = 'No products found', emptyText = '' }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h2>{emptyTitle}</h2>
        {emptyText && <p>{emptyText}</p>}
        <Link to="/products" className="btn btn-primary">
          View all products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;