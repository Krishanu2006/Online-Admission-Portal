import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileText,
  Upload,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import StudentLayout from "../../components/layout/StudentLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { getStudentProfile, getStudentDocuments } from "../../services/student.api";
import { getStudentApplication } from "../../services/application.api";
import { getMyPayments } from "../../services/payment.api";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentStatusLoaded, setPaymentStatusLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const profileResponse = await getStudentProfile();

        if (cancelled) return;
        setProfile(profileResponse.data);

        try {
          const applicationResponse = await getStudentApplication();

          if (cancelled) return;
          setApplication(applicationResponse.data);
        } catch (err) {
          if (err.response?.status === 404) {
            setApplication(null);
          } else {
            throw err;
          }
        }

        try {
          const documentsResponse = await getStudentDocuments();

          if (cancelled) return;

          if (
            documentsResponse?.success &&
            Array.isArray(documentsResponse.data)
          ) {
            setDocuments(documentsResponse.data);
          } else {
            throw new Error("Invalid documents response.");
          }
        } catch (err) {
          console.error("Failed to load student documents:", err);

          if (!cancelled) {
            setError(
              err.response?.data?.message ||
                "Unable to load document verification status."
            );
          }
        }

        // Load payment status separately so a payment API error
        // does not prevent the rest of the dashboard from rendering.
        try {
          const paymentResponse = await getMyPayments();

          if (cancelled) return;

          if (
            paymentResponse?.success &&
            Array.isArray(paymentResponse.data)
          ) {
            setPayments(paymentResponse.data);
          } else {
            throw new Error("Invalid payment history response.");
          }
        } catch (err) {
          console.error("Failed to load payment history:", err);

          if (!cancelled) {
            setPaymentStatusLoaded(false);
          }
        } finally {
          if (!cancelled) {
            setPaymentStatusLoaded(true);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <section className="content">
          <p>Loading dashboard...</p>
        </section>
      </StudentLayout>
    );
  }

  const fullName = profile
    ? `${profile.fname} ${profile.lname}`
    : "Student";

  const applicationStatus = application?.status || "DRAFT";

  const course =
    application?.coursePreferences?.[0]?.courseName ||
    "Course not selected";

  const hasDocuments = documents.length > 0;

  const allDocumentsVerified =
    hasDocuments &&
    documents.every(
      (document) => document.verificationStatus === "VERIFIED"
    );

  const hasRejectedDocuments = documents.some(
    (document) => document.verificationStatus === "REJECTED"
  );

  const documentsChecklistStatus = !hasDocuments
    ? "No documents uploaded"
    : allDocumentsVerified
      ? "All documents verified"
      : hasRejectedDocuments
        ? "Some documents rejected"
        : "Documents pending review";

  const documentsChecklistDone = allDocumentsVerified;

  // Only trust the payment status saved by the backend.
  const feePaid = payments.some(
    (payment) => payment.status === "PAID"
  );

  const feePaymentStatus = !paymentStatusLoaded
    ? "Unable to check"
    : feePaid
      ? "Paid"
      : "Pending";

  return (
    <StudentLayout>
      <div className="topbar">
        <div>
          <span className="topbar-label">STUDENT PORTAL</span>
          <strong>{fullName}</strong>
        </div>

        <span className="avatar">
          {profile?.fname?.[0] || "S"}
          {profile?.lname?.[0] || ""}
        </span>
      </div>

      <section className="content">
        <div className="page-header">
          <div>
            <div className="eyebrow">ADMISSION 2026</div>
            <h1>Your admission dashboard</h1>
            <p>
              Complete the remaining steps to keep your application
              ready for review.
            </p>
          </div>

          <StatusBadge status={applicationStatus.replaceAll("_", " ")} />
        </div>

        {error && (
          <div
            className="card"
            role="alert"
            style={{ color: "#b45309", marginBottom: "1rem" }}
          >
            {error}
          </div>
        )}

        <div className="dashboard-grid">
          <div className="card application-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">APPLICATION</span>
                <h2>
                  {application
                    ? application.applicationId
                    : "No application yet"}
                </h2>
              </div>

              {application && (
                <StatusBadge
                  status={applicationStatus.replaceAll("_", " ")}
                />
              )}
            </div>

            <p className="muted">
              {application
                ? course
                : "Start your admission application to continue."}
            </p>

            <div className="progress-track">
              <div
                className="progress-value"
                style={{
                  width: application ? "80%" : "0%",
                }}
              />
            </div>

            <div className="progress-meta">
              <span>Application progress</span>
              <strong>{application ? "80%" : "0%"}</strong>
            </div>

            {application && application.status !== "DRAFT" && (
              <Link to="/student/application/view" className="text-link">
                View submitted application
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          <div className="card">
            <div className="card-heading">
              <h2>Application checklist</h2>
            </div>

            <div className="checklist">
              {[
                ["Account created", true],
                [
                  "Personal & academic details",
                  !!(
                    application?.personalDetails?.fullName &&
                    application?.academicDetails?.class10?.board &&
                    application?.academicDetails?.class12?.board
                  ),
                ],
                ["Documents uploaded", documentsChecklistDone],
                [
                  "Application submitted",
                  !!application && application.status !== "DRAFT",
                ],
                ["Fee payment", feePaid],
                [
                  "Admission decision",
                  application?.status === "APPROVED",
                ],
              ].map(([label, done]) => (
                <div className="check-row" key={label}>
                  {done ? (
                    <CheckCircle2 className="success-icon" size={19} />
                  ) : (
                    <CircleAlert className="pending-icon" size={19} />
                  )}

                  <span>{label}</span>

                  <small>
                    {label === "Documents uploaded"
                      ? documentsChecklistStatus
                      : label === "Fee payment"
                        ? feePaymentStatus
                        : done
                          ? "Done"
                          : "Pending"}
                  </small>
                </div>
              ))}
            </div>

            {!feePaid && (
              <Link
                to="/student/fees"
                className="text-link"
                style={{ marginTop: 16 }}
              >
                Go to fee payment
                <ArrowRight size={16} />
              </Link>
            )}

            {hasRejectedDocuments && (
              <p style={{ color: "#b91c1c", marginTop: 12 }}>
                One or more documents were rejected. Open Documents to
                review the rejection reasons and upload replacements if
                your application is still editable.
              </p>
            )}
          </div>
        </div>

        <div className="quick-grid">
          <Link to="/student/profile" className="quick-card">
            <UserRound />
            <div>
              <strong>Personal details</strong>
              <span>Review your information</span>
            </div>
            <ArrowRight />
          </Link>

          <Link to="/student/documents" className="quick-card">
            <Upload />
            <div>
              <strong>Documents</strong>
              <span>
                {hasDocuments
                  ? `${documents.length} uploaded · ${documentsChecklistStatus}`
                  : "Upload your required files"}
              </span>
            </div>
            <ArrowRight />
          </Link>

          <Link to="/student/status" className="quick-card">
            <FileText />
            <div>
              <strong>Application status</strong>
              <span>Track your application</span>
            </div>
            <ArrowRight />
          </Link>
        </div>
      </section>
    </StudentLayout>
  );
}