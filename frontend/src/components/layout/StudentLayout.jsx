import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  FileText,
  Upload,
  ClipboardCheck,
  LockKeyhole,
  LogOut,
  CreditCard,
} from "lucide-react";

import Logo from "../common/Logo";

const links = [
  {
    to: "/student/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/student/profile",
    label: "Personal Details",
    icon: UserRound,
  },
  {
    to: "/student/application",
    label: "Admission Application",
    icon: FileText,
  },
  {
    to: "/student/documents",
    label: "Documents",
    icon: Upload,
  },
  {
    to: "/student/status",
    label: "Application Status",
    icon: ClipboardCheck,
  },
  {
    to: "/student/fees",
    label: "Fee Payment",
    icon: CreditCard,
  },
  {
    to: "/student/change-password",
    label: "Change Password",
    icon: LockKeyhole,
  },
];

export default function StudentLayout({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />

        <div className="sidebar-section-label">
          Student Portal
        </div>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-link">
            <LogOut size={18} />
            <span>Exit Portal</span>
          </Link>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}