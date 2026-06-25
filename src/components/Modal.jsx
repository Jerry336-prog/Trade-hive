import { useEffect } from "react";
import { X } from 'lucide-react';

/**
 * Modal – Generic dialog overlay.
 *
 * Props:
 *   isOpen   – controls visibility
 *   onClose  – called when backdrop or X is clicked
 *   title    – modal heading
 *   children – modal content
 *   maxWidth – optional override (e.g. "640px")
 */
const Modal = ({ isOpen, onClose, title, children, maxWidth }) => {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box" style={maxWidth ? { maxWidth } : undefined}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal"><X className="icon-sm" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
