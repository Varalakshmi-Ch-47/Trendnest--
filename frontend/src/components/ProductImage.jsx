import { useState } from 'react';
import './ProductCard.css';

function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="product-image product-image-empty">No image</div>;
  }

  return (
    <img
      className="product-image"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default ProductImage;