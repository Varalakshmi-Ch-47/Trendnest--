import { Link, useLocation, useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import { useAsyncData } from '../hooks/useAsyncData';
import { getOrder } from '../services/orderService';
import { formatDate, formatPrice } from '../utils/format';
import './Shop.css';

function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = Boolean(location.state && location.state.justPlaced);

  const { data: order, error, loading, reload } = useAsyncData(() => getOrder(id), id);

  if (loading) {
    return <LoadingState message="Loading order..." />;
  }

  if (error || !order) {
    return (
      <div>
        <Link to="/orders" className="back-link">
          ← Back to my orders
        </Link>
        <ErrorMessage message={error || 'Order not found'} onRetry={reload} />
      </div>
    );
  }

  return (
    <div>
      {justPlaced ? (
        <div className="success-banner">
          <h2>Thank you! Your order has been placed.</h2>
          <div>Your order number is #{order.id}.</div>
        </div>
      ) : (
        <h1 className="page-title">Order #{order.id}</h1>
      )}

      <div className="card order-header">
        <div>
          <span>Order number</span>#{order.id}
        </div>
        <div>
          <span>Date</span>
          {formatDate(order.orderDate)}
        </div>
        <div>
          <span>Status</span>
          <span className="status-badge">{order.status}</span>
        </div>
        <div>
          <span>Total</span>
          <strong>{formatPrice(order.totalAmount)}</strong>
        </div>
      </div>

      <div className="table-wrap card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th className="num">Price paid</th>
              <th className="num">Qty</th>
              <th className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId}>
                <td>{item.productName}</td>
                <td className="num">{formatPrice(item.purchasePrice)}</td>
                <td className="num">{item.quantity}</td>
                <td className="num">{formatPrice(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-row">
        <Link to="/products" className="btn btn-primary">
          Continue shopping
        </Link>
        <Link to="/orders" className="btn btn-secondary">
          View my orders
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;