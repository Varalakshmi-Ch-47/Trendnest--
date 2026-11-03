import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { placeOrder } from '../services/orderService';
import { getErrorMessage } from '../utils/errors';
import { formatPrice } from '../utils/format';
import './Shop.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, loading, loadError, refreshCart } = useCart();
  const { showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <LoadingState message="Loading your cart..." />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} onRetry={refreshCart} />;
  }

  if (cart.items.length === 0) {
    return (
      <div>
        <h1 className="page-title">Checkout</h1>
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Add some products before checking out.</p>
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const hasStockProblem = cart.items.some((item) => item.quantity > item.availableStock);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const order = await placeOrder();
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
      refreshCart();
    } catch (error) {
      showError(getErrorMessage(error));
      await refreshCart();
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Checkout</h1>

      <div className="cart-layout">
        <div className="table-wrap card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="num">Price</th>
                <th className="num">Qty</th>
                <th className="num">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td className="num">{formatPrice(item.unitPrice)}</td>
                  <td className="num">{item.quantity}</td>
                  <td className="num">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="card summary-card">
          <h2>Review your order</h2>
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
            onClick={handlePlaceOrder}
            disabled={submitting || hasStockProblem}
          >
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
          {hasStockProblem && (
            <p className="field-error">
              Some items exceed the available stock. <Link to="/cart">Fix your cart</Link>
            </p>
          )}
          <p className="notice">
            This is a demo checkout. No payment information is collected, and the final price
            is confirmed by the server when you place the order.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;