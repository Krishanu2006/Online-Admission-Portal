import { Link } from "react-router-dom";
import Logo from "../common/Logo";

export default function PublicHeader() {
  return (
    <header className="public-header">
      <Logo />
      <nav>
        <Link to="/student/login" className="nav-link">Login</Link>
        <Link to="/student/register" className="button button-primary">Apply Now</Link>
      </nav>
    </header>
  );
}