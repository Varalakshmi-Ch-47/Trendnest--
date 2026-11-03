import { useState } from 'react';
import './ProductForm.css';

const MAX_STOCK = 1000000;

function toFormValues(product) {
  if (!product) {
    return {
      name: '',
      description: '',
      price: '',
      category: '',
      stockQuantity: '',
      imageUrl: '',
    };
  }
  return {
    name: product.name || '',
    description: product.description || '',
    price: product.price != null ? String(product.price) : '',
    category: product.category || '',
    stockQuantity: product.stockQuantity != null ? String(product.stockQuantity) : '',
    imageUrl: product.imageUrl || '',
  };
}

function validate(values) {
  const errors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length > 150) {
    errors.name = 'Name must be at most 150 characters';
  }

  if (values.description.length > 2000) {
    errors.description = 'Description must be at most 2000 characters';
  }

  const price = values.price.trim();
  if (!price) {
    errors.price = 'Price is required';
  } else if (!/^\d{1,8}(\.\d{1,2})?$/.test(price)) {
    errors.price = 'Enter a valid price with at most 2 decimals';
  } else if (Number(price) < 0.01) {
    errors.price = 'Price must be at least 0.01';
  }

  const category = values.category.trim();
  if (!category) {
    errors.category = 'Category is required';
  } else if (category.length > 80) {
    errors.category = 'Category must be at most 80 characters';
  }

  const stock = values.stockQuantity.trim();
  if (!stock) {
    errors.stockQuantity = 'Stock quantity is required';
  } else if (!/^\d+$/.test(stock)) {
    errors.stockQuantity = 'Stock must be a whole number (0 or more)';
  } else if (Number(stock) > MAX_STOCK) {
    errors.stockQuantity = 'Stock cannot be more than 1,000,000';
  }

  const imageUrl = values.imageUrl.trim();
  if (imageUrl.length > 500) {
    errors.imageUrl = 'Image URL must be at most 500 characters';
  } else if (imageUrl && !/^https?:\/\/\S+$/i.test(imageUrl)) {
    errors.imageUrl = 'Image URL must start with http:// or https://';
  }

  return errors;
}

function ProductForm({ product = null, submitting = false, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(product));
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    onSubmit({
      name: values.name.trim(),
      description: values.description.trim() || null,
      price: Number(values.price.trim()),
      category: values.category.trim(),
      stockQuantity: parseInt(values.stockQuantity.trim(), 10),
      imageUrl: values.imageUrl.trim() || null,
    });
  };

  return (
    <form className="card product-form" onSubmit={handleSubmit} noValidate>
      <h2>{product ? `Edit product #${product.id}` : 'Add a new product'}</h2>

      <div className="form-grid">
        <div className="form-group full">
          <label htmlFor="name">Name *</label>
          <input id="name" name="name" value={values.name} onChange={handleChange} />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (INR) *</label>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            value={values.price}
            onChange={handleChange}
          />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stockQuantity">Stock quantity *</label>
          <input
            id="stockQuantity"
            name="stockQuantity"
            inputMode="numeric"
            value={values.stockQuantity}
            onChange={handleChange}
          />
          {errors.stockQuantity && <span className="field-error">{errors.stockQuantity}</span>}
        </div>

        <div className="form-group full">
          <label htmlFor="category">Category *</label>
          <input id="category" name="category" value={values.category} onChange={handleChange} />
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>

        <div className="form-group full">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            name="imageUrl"
            placeholder="https://..."
            value={values.imageUrl}
            onChange={handleChange}
          />
          {errors.imageUrl && <span className="field-error">{errors.imageUrl}</span>}
        </div>

        <div className="form-group full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={values.description}
            onChange={handleChange}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : product ? 'Save changes' : 'Add product'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ProductForm;