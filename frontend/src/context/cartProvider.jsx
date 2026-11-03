import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartContext } from './cartContext';
import { useToast } from '../hooks/useToast';
import * as cartService from '../services/cartService';
import { getErrorMessage } from '../utils/errors';

const EMPTY_CART = { items: [], totalQuantity: 0, totalAmount: 0 };

export function CartProvider({ children }) {
  const { showError, showSuccess } = useToast();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
      setLoadError('');
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const runAction = useCallback(
    async (action, successMessage) => {
      setBusy(true);
      try {
        const data = await action();
        setCart(data);
        if (successMessage) {
          showSuccess(successMessage);
        }
        return true;
      } catch (error) {
        showError(getErrorMessage(error));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [showError, showSuccess]
  );

  const addItem = useCallback(
    (productId, quantity = 1) =>
      runAction(() => cartService.addToCart(productId, quantity), 'Added to cart'),
    [runAction]
  );

  const changeQuantity = useCallback(
    (productId, quantity) =>
      runAction(() => cartService.updateCartItem(productId, quantity)),
    [runAction]
  );

  const removeItem = useCallback(
    (productId) =>
      runAction(() => cartService.removeCartItem(productId), 'Item removed'),
    [runAction]
  );

  const emptyCart = useCallback(
    () => runAction(() => cartService.clearCart(), 'Cart cleared'),
    [runAction]
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      loadError,
      busy,
      refreshCart,
      addItem,
      changeQuantity,
      removeItem,
      emptyCart,
    }),
    [cart, loading, loadError, busy, refreshCart, addItem, changeQuantity, removeItem, emptyCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}