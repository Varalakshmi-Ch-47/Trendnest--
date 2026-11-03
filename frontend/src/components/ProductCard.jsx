import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format';
import { getStockInfo } from '../utils/stock';
import ProductImage from './ProductImage';
import './ProductCard.css';

function ProductCard({ product }) {
  const { addItem, busy } = useCart();
  const stock = getStockInfo(product.stockQuantity);

  return (
    <article className="card product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <ProductImage key={product.imageUrl} src={product.imageUrl} alt={product.name} />
        <div className="product-card-body">
          <div className="product-category">{product.category}</div>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-price">{formatPrice(product.price)}</div>
          <div className={`stock-label stock-${stock.level}`}>{stock.text}</div>
        </div>
      </Link>
      <div className="product-card-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || product.stockQuantity <= 0}
          onClick={() => addItem(product.id, 1)}
        >
          {product.stockQuantity <= 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;