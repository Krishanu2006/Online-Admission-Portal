import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import StatusBadge from "../../components/common/StatusBadge";
import {
  getAdminApplication,
  updateAdminApplicationStatus,
} from "../../services/admin.api";

const STATUS_OPTIONS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
];

const COURSE_NAMES = {
  101: "B.Tech Computer Science & Engineering",
  102: "B.Tech Information Technology",
  103: "B.Tech Electronics & Communication Engineering",
  104: "B.Tech Electrical Engineering",
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString("en-IN");
}

function getCoursePreferences(application) {
  return [...(application.coursePreferences ?? [])]
    .sort((a, b) => (a.preference ?? 999) - (b.preference ?? 999))
    .map((course) => ({
      ...course,
      name:
        COURSE_NAMES[course.courseId] ??
        `Course ${course.courseId}`,
    }));
}

function getApplicationFromResponse(response) {
  return response?.data?.data ?? response?.data ?? null;
}

export default function AdminApplicationDetails() {
  const { id } = useParams();

  const [application, setApplication] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadApplication = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await getAdminApplication(id);
      const record = getApplicationFromResponse(response);

      if (!record?.applicationId) {
        throw new Error("The server did not return a valid application.");
      }

      setApplication(record);
      setNewStatus(record.status ?? "SUBMITTED");
      setRemarks(record.remarks ?? "");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load application details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  async function handleStatusUpdate(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!application) return;

    if (!STATUS_OPTIONS.includes(newStatus)) {
      setError("Select a valid application status.");
      return;
    }

    if (application.status === "DRAFT") {
      setError(
        "This application is still a draft. The student must submit it before it can be reviewed."
      );
      return;
    }

    if (["APPROVED", "REJECTED"].includes(application.status)) {
      setError(
        "This application has already reached a final decision. No further status changes are allowed from this page."
      );
      return;
    }

    if (
      ["APPROVED", "REJECTED"].includes(newStatus) &&
      !remarks.trim()
    ) {
      setError("Enter remarks before approving or rejecting an application.");
      return;
    }

    setSaving(true);

    try {
      const response = await updateAdminApplicationStatus(
        id,
        newStatus,
        remarks.trim() || null
      );

      if (response?.success === false) {
        throw new Error(
          response.message || "The server did not confirm the status update."
        );
      }

      await loadApplication();
      setMessage("Application status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to update application status."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <section className="content">
        <div className="page-header">
          <div>
            <div className="eyebrow">APPLICATION REVIEW</div>
            <h1>Application details</h1>
            <p>Review the submitted information and record your decision.</p>
          </div>

          <Link
            to="/admin/applications"
            className="button button-secondary"
          >
            <ArrowLeft size={17} />
            Back to applications
          </Link>
        </div>

        {error && (
          <div
            className="card"
            role="alert"
            style={{ color: "#dc2626", marginBottom: "1rem" }}
          >
            {error}
          </div>
        )}

        {message && (
          <p role="status" style={{ color: "#15803d" }}>
            {message}
          </p>
        )}

        {loading ? (
          <div className="card" role="status">
            Loading application details...
          </div>
        ) : !application ? (
          <div className="card">
            <h2>Application unavailable</h2>
            <p>
              The application could not be loaded. Check the application ID,
              backend response, and admin permissions.
            </p>
            <button
              type="button"
              className="button button-secondary"
              onClick={loadApplication}
            >
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">APPLICATION ID</span>
                  <h2>{application.applicationId}</h2>
                </div>
                <StatusBadge
                  status={(application.status ?? "DRAFT").replaceAll(
                    "_",
                    " "
                  )}
                />
              </div>

              <div className="detail-grid">
                <Detail
                  label="Created"
                  value={formatDate(application.createdAt)}
                />
                <Detail
                  label="Last updated"
                  value={formatDate(application.updatedAt)}
                />
                <Detail
                  label="Student account ID"
                  value={application.userId ?? "Not available"}
                />
                <Detail
                  label="Submitted"
                  value={formatDate(application.submittedAt)}
                />
              </div>
            </div>

            <div className="card">
              <h2>Personal details</h2>
              <div className="detail-grid">
                <Detail
                  label="Full name"
                  value={application.personalDetails?.fullName}
                />
                <Detail
                  label="Date of birth"
                  value={application.personalDetails?.dateOfBirth}
                />
                <Detail
                  label="Gender"
                  value={application.personalDetails?.gender}
                />
                <Detail
                  label="Category"
                  value={application.personalDetails?.category}
                />
              </div>
            </div>

            <div className="card">
              <h2>Contact details</h2>
              <div className="detail-grid">
                <Detail
                  label="Email"
                  value={application.contactDetails?.email}
                />
                <Detail
                  label="Phone"
                  value={application.contactDetails?.phone}
                />
                <Detail
                  label="Address"
                  value={application.contactDetails?.address}
                />
              </div>
            </div>

            <div className="card">
              <h2>Academic details</h2>
              <div className="detail-grid">
                <Detail
                  label="Class 10 board"
                  value={application.academicDetails?.class10?.board}
                />
                <Detail
                  label="Class 10 percentage"
                  value={
                    application.academicDetails?.class10?.percentage == null
                      ? undefined
                      : `${application.academicDetails.class10.percentage}%`
                  }
                />
                <Detail
                  label="Class 12 board"
                  value={application.academicDetails?.class12?.board}
                />
                <Detail
                  label="Class 12 percentage"
                  value={
                    application.academicDetails?.class12?.percentage == null
                      ? undefined
                      : `${application.academicDetails.class12.percentage}%`
                  }
                />
              </div>
            </div>

            <div className="card">
              <h2>Course preferences</h2>

              {getCoursePreferences(application).length === 0 ? (
                <p className="muted">No course preferences were provided.</p>
              ) : (
                <ol>
                  {getCoursePreferences(application).map((course) => (
                    <li key={`${course.courseId}-${course.preference}`}>
                      {course.name} — Preference {course.preference}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <form className="card stack-md" onSubmit={handleStatusUpdate}>
              <h2>Review decision</h2>

              <label className="field">
                <span>New status</span>
                <select
                  value={newStatus}
                  onChange={(event) => setNewStatus(event.target.value)}
                  disabled={
                    saving ||
                    ["APPROVED", "REJECTED"].includes(application.status)
                  }
                  required
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Review remarks</span>
                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={4}
                  placeholder="Record the reason for your decision or any follow-up required."
                  disabled={
                    saving ||
                    ["APPROVED", "REJECTED"].includes(application.status)
                  }
                />
              </label>

              {["APPROVED", "REJECTED"].includes(application.status) ? (
                <p className="muted">
                  This application has reached a final decision.
                </p>
              ) : (
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving || application.status === "DRAFT"}
                >
                  <Save size={17} />
                  {saving ? "Saving decision..." : "Save review decision"}
                </button>
              )}
            </form>
          </>
        )}
      </section>
    </AdminLayout>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}