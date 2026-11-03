import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format';
import ProductImage from './ProductImage';
import QuantitySelector from './QuantitySelector';
import './CartItem.css';

function CartItem({ item }) {
  const { changeQuantity, removeItem, busy } = useCart();
  const overStock = item.quantity > item.availableStock;

  const handleQuantityChange = (quantity) => {
    if (quantity !== item.quantity) {
      changeQuantity(item.productId, quantity);
    }
  };

  return (
    <div className="card cart-item">
      <Link to={`/products/${item.productId}`} className="cart-item-image">
        <ProductImage key={item.imageUrl} src={item.imageUrl} alt={item.name} />
      </Link>

      <div className="cart-item-info">
        <Link to={`/products/${item.productId}`} className="cart-item-name">
          {item.name}
        </Link>
        <div className="muted">{formatPrice(item.unitPrice)} each</div>
        {overStock && (
          <div className="field-error">
            Only {item.availableStock} available. Please reduce the quantity.
          </div>
        )}
      </div>

      <QuantitySelector
        value={item.quantity}
        min={1}
        max={Math.max(item.availableStock, 1)}
        onChange={handleQuantityChange}
        disabled={busy}
      />

      <div className="cart-item-subtotal">{formatPrice(item.subtotal)}</div>

      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => removeItem(item.productId)}
        disabled={busy}
      >
        Remove
      </button>
    </div>
  );
}

export default CartItem;