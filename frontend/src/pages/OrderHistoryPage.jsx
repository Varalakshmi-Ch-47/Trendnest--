import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import { useAsyncData } from '../hooks/useAsyncData';
import { getOrderHistory } from '../services/orderService';
import { formatDate, formatPrice } from '../utils/format';
import './Shop.css';

function OrderHistoryPage() {
  const { data: orders, error, loading, reload } = useAsyncData(getOrderHistory, 'history');

  return (
    <div>
      <h1 className="page-title">My orders</h1>

      {loading && <LoadingState message="Loading your orders..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && orders && orders.length === 0 && (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>Orders you place from this browser will appear here.</p>
          <Link to="/products" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      )}

      {!loading && !error && orders && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <div key={order.id} className="card order-card">
                <div>
                  <strong>Order #{order.id}</strong>{' '}
                  <span className="status-badge">{order.status}</span>
                  <div className="muted">
                    {formatDate(order.orderDate)} · {itemCount} item{itemCount === 1 ? '' : 's'}
                  </div>
                </div>
                <div>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
                <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-small">
                  View details
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;