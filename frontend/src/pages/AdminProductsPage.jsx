import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import ProductForm from '../components/ProductForm';
import { useAsyncData } from '../hooks/useAsyncData';
import { useToast } from '../hooks/useToast';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/productService';
import { getErrorMessage } from '../utils/errors';
import { formatPrice } from '../utils/format';
import './Shop.css';
import './Admin.css';

function AdminProductsPage() {
  const { showError, showSuccess } = useToast();
  const { data: products, error, loading, reload } = useAsyncData(getProducts, 'admin');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
    scrollToTop();
  };

  const openEdit = (product) => {
    setEditing(product);
    setFormOpen(true);
    scrollToTop();
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        showSuccess('Product updated');
      } else {
        await createProduct(payload);
        showSuccess('Product added');
      }
      closeForm();
      reload();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      showSuccess(`Deleted "${deleteTarget.name}"`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      showError(getErrorMessage(err));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="admin-warning">
        <strong>Local development only.</strong> This admin page has no login, so anyone who can
        open it can change products. Do not deploy it publicly in this form.
      </div>

      <div className="admin-header">
        <h1 className="page-title">Manage products</h1>
        {!formOpen && (
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Add product
          </button>
        )}
      </div>

      {formOpen && (
        <div className="admin-form-wrap">
          <ProductForm
            key={editing ? editing.id : 'new'}
            product={editing}
            submitting={saving}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      {loading && <LoadingState message="Loading products..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && products && products.length === 0 && (
        <div className="empty-state">
          <h2>No products yet</h2>
          <p>Add your first product to start selling.</p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Add product
          </button>
        </div>
      )}

      {!loading && !error && products && products.length > 0 && (
        <div className="table-wrap card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th className="num">Price</th>
                <th className="num">Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td className="num">{formatPrice(product.price)}</td>
                  <td
                    className={`num ${
                      product.stockQuantity <= 0
                        ? 'out-stock'
                        : product.stockQuantity <= 5
                          ? 'low-stock'
                          : ''
                    }`}
                  >
                    {product.stockQuantity}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => openEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => setDeleteTarget(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this product?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed permanently. This cannot be undone.`
            : ''
        }
        confirmText="Delete"
        danger
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default AdminProductsPage;