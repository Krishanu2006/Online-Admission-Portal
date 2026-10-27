
import { Link } from "react-router-dom";

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="brand" aria-label="IEM Kolkata home">
      <img
        src="/images/iem-logo.png"
        alt="Institute of Engineering & Management"
        className="brand-logo-image"
      />

      {!compact && (
        <span className="brand-text">
          <strong>IEM Kolkata</strong>
          <small>Admission System</small>
        </span>
      )}
    </Link>
  );
}
