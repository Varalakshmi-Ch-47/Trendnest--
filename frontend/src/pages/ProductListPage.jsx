import { useSearchParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import { useAsyncData } from '../hooks/useAsyncData';
import { getProducts, searchProducts } from '../services/productService';
import './Pages.css';

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();

  const { data: products, error, loading, reload } = useAsyncData(
    () => (query ? searchProducts(query) : getProducts()),
    query
  );

  const handleSearch = (text) => {
    if (text) {
      setSearchParams({ q: text });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div>
      <h1 className="page-title">Products</h1>
      <SearchBar key={query} initialValue={query} onSearch={handleSearch} />

      {loading && <LoadingState message="Loading products..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
      {!loading && !error && products && (
        <>
          <p className="result-count">
            {products.length} product{products.length === 1 ? '' : 's'}
            {query ? ` found for "${query}"` : ''}
          </p>
          <ProductGrid
            products={products}
            emptyTitle="No products found"
            emptyText={query ? `Nothing matches "${query}". Try a different word.` : 'No products are available yet.'}
          />
        </>
      )}
    </div>
  );
}

export default ProductListPage;