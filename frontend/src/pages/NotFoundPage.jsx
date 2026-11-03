import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div>
      <h1 className="page-title">Page not found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">
        Go to home
      </Link>
    </div>
  );
}

export default NotFoundPage;