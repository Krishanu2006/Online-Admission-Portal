import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, Search } from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { getAdminApplications } from "../../services/admin.api";

const STATUSES = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
];

function studentName(application) {
  return (
    application.personalDetails?.fullName ||
    `Student #${application.userId ?? "Unknown"}`
  );
}

function courseName(application) {
  const courses = application.coursePreferences ?? [];

  if (!courses.length) return "Not selected";

  const courseNames = {
    101: "B.Tech CSE",
    102: "B.Tech IT",
    103: "B.Tech ECE",
    104: "B.Tech Electrical",
  };

  const preferred = [...courses].sort(
    (a, b) => (a.preference ?? 999) - (b.preference ?? 999)
  )[0];

  return courseNames[preferred.courseId] ??
    `Course ${preferred.courseId}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminApplications();

      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(
          response?.message ||
            "The server returned an invalid applications response."
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

  const filteredApplications = useMemo(() => {
    const term = search.trim().toLowerCase();

    return applications.filter((application) => {
      const status = application.status ?? "DRAFT";

      if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
      }

      if (!term) return true;

      const searchable = [
        application.applicationId,
        application.userId,
        studentName(application),
        application.contactDetails?.email,
        application.contactDetails?.phone,
        courseName(application),
        status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [applications, search, statusFilter]);

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
            <div className="eyebrow">APPLICATIONS</div>
            <h1>Admission applications</h1>
            <p>Review applications stored in the admission database.</p>
          </div>

          <button
            type="button"
            className="button button-secondary"
            onClick={loadApplications}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div
            className="card"
            role="alert"
            style={{ color: "#dc2626", marginBottom: "1rem" }}
          >
            <p>{error}</p>
            <p>
              Verify your admin login, API authorization, and backend
              connection.
            </p>
          </div>
        )}

        <div className="card">
          <div className="filters">
            <label className="search-field">
              <Search size={18} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ID, student, email, or course..."
                aria-label="Search applications"
              />
            </label>

            <label className="filter-field">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL"
                      ? "All statuses"
                      : status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="card-heading">
            <div>
              <h2>Applications</h2>
              <p className="muted">
                {loading
                  ? "Loading records..."
                  : `${filteredApplications.length} of ${applications.length} applications`}
              </p>
            </div>
          </div>

          {loading ? (
            <p role="status">Fetching applications from the server...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Submitted / Updated</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application._id ?? application.applicationId}>
                      <td>
                        <strong>
                          {application.applicationId ?? "—"}
                        </strong>
                      </td>

                      <td>
                        <strong>{studentName(application)}</strong>
                        <div className="muted">
                          {application.contactDetails?.email ?? "Email unavailable"}
                        </div>
                      </td>

                      <td>{courseName(application)}</td>

                      <td>
                        {formatDate(
                          application.submittedAt ??
                            application.updatedAt ??
                            application.createdAt
                        )}
                      </td>

                      <td>
                        <StatusBadge
                          status={(application.status ?? "DRAFT").replaceAll(
                            "_",
                            " "
                          )}
                        />
                      </td>

                      <td>
                        <Link
                          className="table-link"
                          to={`/admin/applications/${encodeURIComponent(
                            application.applicationId
                          )}`}
                        >
                          Review <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredApplications.length === 0 && (
                <div className="empty-state">
                  {applications.length === 0
                    ? "The server returned no applications."
                    : "No applications match your search or selected status."}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}