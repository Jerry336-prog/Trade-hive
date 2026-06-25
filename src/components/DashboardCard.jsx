/**
 * DashboardCard – Metric stat card for vendor dashboard.
 *
 * Props:
 *   icon   – emoji or icon character
 *   label  – metric name
 *   value  – main stat value
 *   sub    – optional sub-text
 *   color  – CSS color for the top accent bar and icon bg
 */
const DashboardCard = ({ icon, label, value, sub, color = "var(--color-primary)" }) => (
  <div
    className="dashboard-card animate-fade"
    style={{ "--card-color": color }}
  >
    <div
      className="dashboard-card-icon"
      style={{ background: color + "20", color }}
    >
      {icon}
    </div>
    <div className="dashboard-card-info">
      <div className="dashboard-card-label">{label}</div>
      <div className="dashboard-card-value">{value}</div>
      {sub && <div className="dashboard-card-sub">{sub}</div>}
    </div>
  </div>
);

export default DashboardCard;
