import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import './Navbar.css';

function Navbar() {
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          TrendNest
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/products" onClick={closeMenu}>
            Products
          </NavLink>
          <NavLink to="/orders" onClick={closeMenu}>
            My Orders
          </NavLink>
          <NavLink to="/admin/products" onClick={closeMenu}>
            Admin
          </NavLink>
          <NavLink to="/cart" onClick={closeMenu}>
            Cart
            {cart.totalQuantity > 0 && (
              <span className="cart-badge">{cart.totalQuantity}</span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;