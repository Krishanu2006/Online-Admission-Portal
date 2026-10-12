export default function StatusBadge({ status }) {
  const cls = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-badge ${cls}`}>{status}</span>;
}