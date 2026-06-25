import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/helpers";
import { useState } from "react";
import { ShoppingBag, Trash2 } from 'lucide-react';

/**
 * CartItem – single item row in the shopping cart.
 */
const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.imageUrl && !imgError ? (
          <img src={item.imageUrl} alt={item.name} onError={() => setImgError(true)} />
        ) : (
          <span><ShoppingBag className="icon-sm" /></span>
        )}
      </div>

      <div className="cart-item-info">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-price">{formatCurrency(item.price)}</div>

        <div className="cart-item-controls">
          <button
            className="qty-btn"
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="qty-display">{item.quantity}</span>
          <button
            className="qty-btn"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>

          <button
            className="cart-item-remove"
            onClick={() => removeFromCart(item.productId)}
            aria-label="Remove item"
          >
            <Trash2 className="icon-sm" />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span className="cart-item-subtotal">
          Subtotal: <strong style={{ color: "var(--color-accent)" }}>
            {formatCurrency(item.price * item.quantity)}
          </strong>
        </span>
      </div>
    </div>
  );
};

export default CartItem;
