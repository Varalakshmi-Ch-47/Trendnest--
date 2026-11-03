import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import ProductImage from '../components/ProductImage';
import QuantitySelector from '../components/QuantitySelector';
import { useAsyncData } from '../hooks/useAsyncData';
import { useCart } from '../hooks/useCart';
import { getProduct } from '../services/productService';
import { formatPrice } from '../utils/format';
import { getStockInfo } from '../utils/stock';
import './Pages.css';

function ProductDetailPage() {
  const { id } = useParams();
  const { addItem, busy } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, error, loading, reload } = useAsyncData(() => getProduct(id), id);

  if (loading) {
    return <LoadingState message="Loading product..." />;
  }

  if (error || !product) {
    return (
      <div>
        <Link to="/products" className="back-link">
          ← Back to products
        </Link>
        <ErrorMessage message={error || 'Product not found'} onRetry={reload} />
      </div>
    );
  }

  const stock = getStockInfo(product.stockQuantity);
  const outOfStock = product.stockQuantity <= 0;
  const safeQuantity = Math.min(quantity, Math.max(product.stockQuantity, 1));

  return (
    <div>
      <Link to="/products" className="back-link">
        ← Back to products
      </Link>
      <div className="card detail-layout">
        <ProductImage key={product.imageUrl} src={product.imageUrl} alt={product.name} />
        <div className="detail-info">
          <div className="product-category">{product.category}</div>
          <h1>{product.name}</h1>
          <div className="detail-price">{formatPrice(product.price)}</div>
          <div className={`stock-label stock-${stock.level}`}>{stock.text}</div>
          <p className="detail-description">
            {product.description || 'No description available.'}
          </p>

          <div className="detail-actions">
            <QuantitySelector
              value={safeQuantity}
              min={1}
              max={Math.max(product.stockQuantity, 1)}
              onChange={setQuantity}
              disabled={outOfStock || busy}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={outOfStock || busy}
              onClick={() => addItem(product.id, safeQuantity)}
            >
              {outOfStock ? 'Out of stock' : 'Add to cart'}
            </button>
            <Link to="/cart" className="btn btn-secondary">
              Go to cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;