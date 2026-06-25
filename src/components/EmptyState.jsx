import { Inbox } from 'lucide-react';
const EmptyState = ({ icon = <Inbox className="icon-sm" />, title, message, action }) => (
  <div className="empty-state animate-fade">
    <div className="empty-state-icon">{icon}</div>
    <div>
      <h3>{title}</h3>
      {message && <p style={{ marginTop: 6 }}>{message}</p>}
    </div>
    {action && <div style={{ marginTop: 8 }}>{action}</div>}
  </div>
);

export default EmptyState;
