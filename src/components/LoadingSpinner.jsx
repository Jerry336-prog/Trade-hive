import "../styles/components.css";

const LoadingSpinner = ({ fullscreen = false, text = "", size = "md" }) => (
  <div className={`spinner-overlay ${fullscreen ? "fullscreen" : ""} ${size === "sm" ? "spinner-sm" : ""}`}>
    <div className="spinner-ring" />
    {text && <span className="spinner-text">{text}</span>}
  </div>
);

export default LoadingSpinner;
