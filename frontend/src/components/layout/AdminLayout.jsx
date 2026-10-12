
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Files,
  FileText,
  LogOut,
} from "lucide-react";

import Logo from "../common/Logo";

export default function AdminLayout({ children }) {
  const navClass = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  return (
    <div className="app-shell">
      <aside className="sidebar admin-sidebar">
        <Logo />

        <div className="sidebar-section-label">
          Administration
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admin/dashboard"
            className={navClass}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/applications"
            className={navClass}
          >
            <Files size={18} />
            <span>Applications</span>
          </NavLink>

          <NavLink
            to="/admin/documents"
            className={navClass}
          >
            <FileText size={18} />
            <span>Documents</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-link">
            <LogOut size={18} />
            <span>Exit Admin</span>
          </Link>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
