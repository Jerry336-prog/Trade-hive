import { useNavigate } from "react-router-dom";
import { stringToColor, getInitials } from "../utils/helpers";

/**
 * StoreCard – vendor store listing card.
 */
const StoreCard = ({ store }) => {
  const navigate = useNavigate();
  const initials = getInitials(store.storeName);
  const bgColor = stringToColor(store.storeName);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="store-card animate-fade"
      onClick={() => navigate(`/store/${store.id}`)}
      role="article"
      aria-label={`Store: ${store.storeName}`}
    >
      {store.logoUrl && !imgError ? (
        <img
          src={store.logoUrl}
          alt={store.storeName}
          className="store-card-logo"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="store-card-logo-initials"
          style={{ background: bgColor }}
        >
          {initials}
        </div>
      )}
      <div className="store-card-name">{store.storeName}</div>
      {store.description && (
        <div className="store-card-desc">{store.description}</div>
      )}
      <button className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>
        Visit Store
      </button>
    </div>
  );
};

import { useState } from "react";
export default StoreCard;
