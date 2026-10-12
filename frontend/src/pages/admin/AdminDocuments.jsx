
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileText,
  RefreshCw,
  XCircle,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import StatusBadge from "../../components/common/StatusBadge";

import {
  getAdminDocuments,
  reviewAdminDocument,
  getAdminDocumentPreview,
} from "../../services/admin.api";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [reviewingId, setReviewingId] = useState("");
  const [previewingId, setPreviewingId] = useState("");
  const [rejectingId, setRejectingId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminDocuments();

      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(
          response?.message || "Invalid documents response."
        );
      }

      setDocuments(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load documents."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Preview using Axios so the Authorization header is included.
  const handlePreview = async (document) => {
    setError("");
    setMessage("");
    setPreviewingId(document._id);

    // Open a blank tab immediately to avoid popup blockers after await.
    const previewTab = window.open("about:blank", "_blank");

    if (!previewTab) {
      setPreviewingId("");
      setError(
        "Your browser blocked the preview tab. Allow pop-ups for this site and try again."
      );
      return;
    }

    previewTab.opener = null;
    previewTab.document.title = "Loading document...";
    previewTab.document.body.innerHTML =
      "<p style='font-family:Arial,sans-serif;padding:24px'>Loading document preview...</p>";

    let objectUrl;

    try {
      const blob = await getAdminDocumentPreview(document._id);

      // Handle JSON error responses that were returned as a Blob.
      if (blob.type === "application/json") {
        const errorBody = JSON.parse(await blob.text());
        throw new Error(
          errorBody.message || "Unable to load document preview."
        );
      }

      const supportedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];

      if (!supportedTypes.includes(blob.type)) {
        throw new Error(
          `Unsupported preview content type: ${blob.type || "unknown"}`
        );
      }

      objectUrl = URL.createObjectURL(blob);
      previewTab.location.replace(objectUrl);

      // Keep the object URL alive while the tab uses it.
      // Revoke it when this page is closed or refreshed.
      window.addEventListener(
        "pagehide",
        () => URL.revokeObjectURL(objectUrl),
        { once: true }
      );
    } catch (err) {
      previewTab.close();

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to preview this document."
      );
    } finally {
      setPreviewingId("");
    }
  };

  const handleReview = async (documentId, decision) => {
    setError("");
    setMessage("");

    let reason = null;

    if (decision === "REJECTED") {
      reason = rejectionReason.trim();

      if (!reason) {
        setError("Enter a rejection reason before rejecting the document.");
        return;
      }
    }

    try {
      setReviewingId(documentId);

      const response = await reviewAdminDocument(
        documentId,
        decision,
        reason
      );

      if (response?.success === false) {
        throw new Error(response.message || "Document review failed.");
      }

      setMessage(
        decision === "VERIFIED"
          ? "Document accepted successfully."
          : "Document rejected successfully."
      );

      setRejectingId("");
      setRejectionReason("");

      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to review document."
      );
    } finally {
      setReviewingId("");
    }
  };

  const pendingCount = documents.filter(
    (document) => document.verificationStatus === "PENDING"
  ).length;

  const verifiedCount = documents.filter(
    (document) => document.verificationStatus === "VERIFIED"
  ).length;

  const rejectedCount = documents.filter(
    (document) => document.verificationStatus === "REJECTED"
  ).length;

  return (
    <AdminLayout>
      <section className="content">
        <div className="page-header">
          <div>
            <div className="eyebrow">ADMINISTRATION</div>
            <h1>Document review</h1>
            <p>
              Inspect student uploads and record document verification
              decisions.
            </p>
          </div>

          <button
            type="button"
            className="button button-secondary"
            onClick={loadDocuments}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
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
          <div
            className="card"
            role="status"
            style={{ color: "#15803d", marginBottom: "1rem" }}
          >
            {message}
          </div>
        )}

        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-icon">
              <FileText size={20} />
            </div>
            <span>Total documents</span>
            <strong>{loading ? "…" : documents.length}</strong>
          </div>

          <div className="card stat-card">
            <div className="stat-icon">
              <RefreshCw size={20} />
            </div>
            <span>Pending review</span>
            <strong>{loading ? "…" : pendingCount}</strong>
          </div>

          <div className="card stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={20} />
            </div>
            <span>Verified</span>
            <strong>{loading ? "…" : verifiedCount}</strong>
          </div>

          <div className="card stat-card">
            <div className="stat-icon">
              <XCircle size={20} />
            </div>
            <span>Rejected</span>
            <strong>{loading ? "…" : rejectedCount}</strong>
          </div>
        </div>

        <div className="card">
          <div className="card-heading">
            <div>
              <h2>Uploaded documents</h2>
              <p className="muted">
                Preview each file before accepting or rejecting it.
              </p>
            </div>
          </div>

          {loading ? (
            <p role="status">Loading documents...</p>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              No uploaded documents were returned by the server.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Document type</th>
                    <th>File name</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((document) => {
                    const isReviewing =
                      reviewingId === document._id;
                    const isPreviewing =
                      previewingId === document._id;
                    const isRejecting =
                      rejectingId === document._id;
                    const isPending =
                      document.verificationStatus === "PENDING";

                    return (
                      <tr key={document._id}>
                        <td>{document.userId}</td>

                        <td>{document.documentType}</td>

                        <td>
                          <span title={document.fileName}>
                            {document.fileName}
                          </span>

                          {document.rejectionReason && (
                            <p
                              className="muted"
                              style={{ maxWidth: 240 }}
                            >
                              Reason: {document.rejectionReason}
                            </p>
                          )}
                        </td>

                        <td>
                          <StatusBadge
                            status={(
                              document.verificationStatus || "PENDING"
                            ).replaceAll("_", " ")}
                          />
                        </td>

                        <td>{formatDate(document.createdAt)}</td>

                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              minWidth: 180,
                            }}
                          >
                            <button
                              type="button"
                              className="button button-secondary"
                              disabled={isPreviewing}
                              onClick={() => handlePreview(document)}
                            >
                              <Eye size={15} />
                              {isPreviewing ? "Opening..." : "Preview"}
                            </button>

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  className="button button-primary"
                                  disabled={isReviewing}
                                  onClick={() =>
                                    handleReview(
                                      document._id,
                                      "VERIFIED"
                                    )
                                  }
                                >
                                  <CheckCircle2 size={15} />
                                  {isReviewing ? "Saving..." : "Accept"}
                                </button>

                                <button
                                  type="button"
                                  className="button button-secondary"
                                  disabled={isReviewing}
                                  onClick={() => {
                                    setError("");
                                    setMessage("");
                                    setRejectingId(document._id);
                                    setRejectionReason("");
                                  }}
                                >
                                  <XCircle size={15} />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>

                          {isRejecting && (
                            <div
                              style={{
                                marginTop: 12,
                                minWidth: 220,
                              }}
                            >
                              <label className="field">
                                <span>Rejection reason</span>
                                <textarea
                                  rows={3}
                                  value={rejectionReason}
                                  onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                  }
                                  placeholder="Explain why this document is rejected"
                                  required
                                />
                              </label>

                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  marginTop: 8,
                                }}
                              >
                                <button
                                  type="button"
                                  className="button button-primary"
                                  disabled={isReviewing}
                                  onClick={() =>
                                    handleReview(
                                      document._id,
                                      "REJECTED"
                                    )
                                  }
                                >
                                  {isReviewing
                                    ? "Saving..."
                                    : "Confirm rejection"}
                                </button>

                                <button
                                  type="button"
                                  className="button button-secondary"
                                  disabled={isReviewing}
                                  onClick={() => {
                                    setRejectingId("");
                                    setRejectionReason("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
