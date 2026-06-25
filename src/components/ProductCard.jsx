import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, truncateText } from "../utils/helpers";
import { ShoppingBag, ShoppingCart } from 'lucide-react';

/**
 * ProductCard – reusable product listing card.
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [imgError, setImgError] = useState(false);
  const outOfStock = Number(product.stock || 0) <= 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    if (!currentUser) {
      navigate("/login");
      return;
    }
    addToCart(product);
  };

  return (
    <div
      className="product-card animate-fade"
      onClick={() => navigate(`/product/${product.id}`)}
      role="article"
      aria-label={`Product: ${product.name}`}
    >
      <div className="product-card-image">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="product-card-image-fallback"><ShoppingBag className="icon-sm" /></div>
        )}
        <div className="product-card-badge">
          <span className="badge badge-primary">{product.category}</span>
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-card-category">{product.category}</div>
        <div className="product-card-name">{truncateText(product.name, 60)}</div>
        <div className="product-card-price">{formatCurrency(product.price)}</div>
        {product.stock <= 5 && product.stock > 0 && (
          <span className="badge badge-warning" style={{ width: "fit-content" }}>
            Only {product.stock} left
          </span>
        )}
        {outOfStock && (
          <span className="badge badge-error" style={{ width: "fit-content" }}>Out of stock</span>
        )}
      </div>

      <div className="product-card-footer">
        <button
          className="btn btn-primary btn-sm"
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          <ShoppingCart className="icon-sm" /> Add to Cart
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
        >
          View
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
