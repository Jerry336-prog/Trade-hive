import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import EmptyState from "../components/EmptyState";
import { formatCurrency } from "../utils/helpers";
import "../styles/pages.css";
import { Trash2, ShoppingCart, PartyPopper } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { items, totalAmount, emptyCart } = useCart();

  const shipping = totalAmount > 0 ? (totalAmount > 100 ? 0 : 9.99) : 0;
  const tax = totalAmount * 0.08;
  const grandTotal = totalAmount + shipping + tax;

  return (
    <div className="container section animate-fade">
      <div style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Shopping Cart</h1>
          <p>{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>
        {items.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={emptyCart}>
            <Trash2 className="icon-sm" /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="icon-sm" />}
          title="Your cart is empty"
          message="Explore our products and add items you love."
          action={
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/products")}>
              Browse Products
            </button>
          }
        />
      ) : (
        <div className="cart-layout">
          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3 style={{ marginBottom: 20 }}>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span style={{ color: "var(--color-success)" }}>Free</span> : formatCurrency(shipping)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {shipping === 0 && totalAmount > 0 && (
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: "0.8rem", color: "var(--color-success)", marginTop: 8 }}>
                <PartyPopper className="icon-sm" /> You qualify for free shipping!
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 20 }}
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout →
            </button>
            <button
              className="btn btn-ghost btn-full btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
