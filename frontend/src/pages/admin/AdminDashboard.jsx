import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import AdminLayout from "../../components/layout/AdminLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { getAdminApplications } from "../../services/admin.api";

const COURSE_NAMES = {
  101: "B.Tech CSE",
  102: "B.Tech IT",
  103: "B.Tech ECE",
  104: "B.Tech Electrical",
};

function getCourse(application) {
  const preferences = application.coursePreferences ?? [];

  if (!preferences.length) return "Not selected";

  const firstPreference = [...preferences].sort(
    (a, b) => (a.preference ?? 999) - (b.preference ?? 999)
  )[0];

  return (
    COURSE_NAMES[firstPreference.courseId] ??
    `Course ${firstPreference.courseId}`
  );
}

function getStudentName(application) {
  return (
    application.personalDetails?.fullName ||
    `Student #${application.userId}`
  );
}

function formatStatus(status = "DRAFT") {
  return status.replaceAll("_", " ");
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminApplications();

      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(
          response?.message || "The server returned an invalid application list."
        );
      }

      setApplications(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const total = applications.length;
  const pending = applications.filter((application) =>
    ["SUBMITTED", "UNDER_REVIEW"].includes(application.status)
  ).length;
  const approved = applications.filter(
    (application) => application.status === "APPROVED"
  ).length;
  const rejected = applications.filter(
    (application) => application.status === "REJECTED"
  ).length;

  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
        new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
    )
    .slice(0, 5);

  return (
    <AdminLayout>
      <section className="content">
        <div className="topbar">
          <div>
            <span className="topbar-label">ADMINISTRATION</span>
            <strong>Admission Management</strong>
          </div>

          <span className="avatar admin-avatar">AD</span>
        </div>

        <div className="page-header">
          <div>
            <div className="eyebrow">OVERVIEW</div>
            <h1>Admission dashboard</h1>
            <p>Monitor and process admission applications.</p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={loadApplications}
              disabled={loading}
            >
              <RefreshCw size={17} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/admin/applications"
              className="button button-primary"
            >
              View applications <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {error && (
          <div
            className="card"
            role="alert"
            style={{ color: "#dc2626", marginBottom: "1rem" }}
          >
            <p>{error}</p>
            <p>
              Check that you are logged in as an administrator and that the
              backend is running.
            </p>
          </div>
        )}

        <div className="stats-grid">
          <Stat
            icon={FileText}
            label="Total applications"
            value={loading ? "…" : total}
          />

          <Stat
            icon={Clock3}
            label="Pending review"
            value={loading ? "…" : pending}
          />

          <Stat
            icon={CheckCircle2}
            label="Approved"
            value={loading ? "…" : approved}
          />

          <Stat
            icon={XCircle}
            label="Rejected"
            value={loading ? "…" : rejected}
          />
        </div>

        <div className="card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">RECENT</span>
              <h2>Recent applications</h2>
            </div>

            <Link to="/admin/applications" className="text-link">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <p role="status">Loading applications from the server...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Updated</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {recentApplications.map((application) => (
                    <tr key={application.applicationId}>
                      <td>
                        <strong>{application.applicationId}</strong>
                      </td>

                      <td>{getStudentName(application)}</td>

                      <td>{getCourse(application)}</td>

                      <td>
                        {formatDate(
                          application.updatedAt ?? application.createdAt
                        )}
                      </td>

                      <td>
                        <StatusBadge
                          status={formatStatus(application.status)}
                        />
                      </td>

                      <td>
                        <Link
                          to={`/admin/applications/${encodeURIComponent(
                            application.applicationId
                          )}`}
                          className="table-link"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {recentApplications.length === 0 && (
                <div className="empty-state">
                  No applications were returned by the server.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>

      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}