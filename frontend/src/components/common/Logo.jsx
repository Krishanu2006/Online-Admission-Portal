import { Link } from "react-router-dom";

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">IEM</span>
      {!compact && (
        <span className="brand-text">
          <strong>IEM Kolkata</strong>
          <small>Admission System</small>
        </span>
      )}
    </Link>
  );
}