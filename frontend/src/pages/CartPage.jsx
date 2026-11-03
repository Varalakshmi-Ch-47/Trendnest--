import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format';
import './Shop.css';

function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, loadError, busy, refreshCart, emptyCart } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) {
    return <LoadingState message="Loading your cart..." />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} onRetry={refreshCart} />;
  }

  if (cart.items.length === 0) {
    return (
      <div>
        <h1 className="page-title">Your cart</h1>
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Add some products and they will show up here.</p>
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const hasStockProblem = cart.items.some((item) => item.quantity > item.availableStock);

  const handleClear = async () => {
    await emptyCart();
    setConfirmOpen(false);
  };

  return (
    <div>
      <h1 className="page-title">Your cart</h1>

      <div className="cart-layout">
        <div>
          <div className="cart-list">
            {cart.items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
          <div className="cart-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmOpen(true)}
              disabled={busy}
            >
              Clear cart
            </button>
          </div>
        </div>

        <aside className="card summary-card">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <span>{cart.totalQuantity}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(cart.totalAmount)}</span>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/checkout')}
            disabled={busy || hasStockProblem}
          >
            Proceed to checkout
          </button>
          {hasStockProblem && (
            <p className="field-error">Reduce the quantities marked above to continue.</p>
          )}
          <p className="notice">Prices and totals are calculated by the server.</p>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Clear your cart?"
        message="All items will be removed from your cart."
        confirmText="Clear cart"
        danger
        busy={busy}
        onConfirm={handleClear}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default CartPage;