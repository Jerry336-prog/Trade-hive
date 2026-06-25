// ============================================================
// CartContext – Global shopping cart state
// Syncs with Firestore when user is authenticated
// ============================================================

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getCart, saveCart, clearCart } from "../services/cartService";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from Firestore when user logs in
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      getCart(currentUser.uid)
        .then((cart) => setItems(cart?.items || []))
        .finally(() => setLoading(false));
    } else {
      setItems([]);
    }
  }, [currentUser]);

  // Persist cart to Firestore whenever items change
  const persist = useCallback(
    async (newItems) => {
      if (currentUser) {
        await saveCart(currentUser.uid, newItems);
      }
    },
    [currentUser]
  );

  /**
   * Add a product to the cart, or increment its quantity.
   */
  const addToCart = async (product, quantity = 1) => {
    setItems((prev) => {
      const availableStock = Number(product.stock);
      const maxQuantity = Number.isFinite(availableStock) ? availableStock : Infinity;
      if (maxQuantity < 1) return prev;
      const exists = prev.find((i) => i.productId === product.id);
      let updated;
      if (exists) {
        updated = prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(maxQuantity, i.quantity + quantity) }
            : i
        );
      } else {
        updated = [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            vendorId: product.vendorId,
            storeId: product.storeId,
            quantity: Math.min(maxQuantity, quantity),
          },
        ];
      }
      persist(updated);
      return updated;
    });
  };

  /**
   * Remove a product from the cart.
   */
  const removeFromCart = async (productId) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      persist(updated);
      return updated;
    });
  };

  /**
   * Update the quantity of a cart item.
   */
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      persist(updated);
      return updated;
    });
  };

  /**
   * Empty the cart.
   */
  const emptyCart = async () => {
    setItems([]);
    if (currentUser) await clearCart(currentUser.uid);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        emptyCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

export default CartContext;
