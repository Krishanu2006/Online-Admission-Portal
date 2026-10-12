import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, UploadCloud, X, RefreshCw } from "lucide-react";

import StudentLayout from "../../components/layout/StudentLayout";
import PageHeader from "../../components/common/PageHeader";

import {
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
} from "../../services/student.api";

const documentTypes = [
  { value: "PHOTO", label: "Photograph" },
  { value: "SIGNATURE", label: "Signature" },
  { value: "AADHAAR", label: "Aadhaar / Identity proof" },
  { value: "CLASS_10_MARKSHEET", label: "Class 10 marksheet" },
  { value: "CLASS_12_MARKSHEET", label: "Class 12 marksheet" },
  { value: "OTHER", label: "Other document" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

function formatSize(bytes = 0) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

export default function StudentDocuments() {
  const [documents, setDocuments] = useState([]);
  const [documentType, setDocumentType] = useState(
    "CLASS_10_MARKSHEET"
  );
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getStudentDocuments();

      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(
          response?.message || "Unable to load saved documents."
        );
      }

      setDocuments(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;

    setError("");
    setMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      setSelectedFile(null);
      event.target.value = "";
      setError("Only PDF, JPG, and PNG files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      event.target.value = "";
      setError("The file exceeds the 5 MB upload limit.");
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedFile) {
      setError("Please choose a document to upload.");
      return;
    }

    if (!documentType) {
      setError("Please select a document type.");
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("documentType", documentType);

    setUploading(true);

    try {
      // Exactly one upload request per form submission.
      const response = await uploadStudentDocument(formData);

      if (!response?.success || !response.data) {
        throw new Error(
          response?.message || "The server did not confirm the upload."
        );
      }

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadDocuments();
      setMessage("Document uploaded successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(
        "Document upload failed:",
        err.response?.data || err
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(document) {
    const id = document._id;

    if (!id) {
      setError("This document does not have a valid database ID.");
      return;
    }

    if (document.verificationStatus === "VERIFIED") {
      setError("Verified documents cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${document.fileName}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(id);

    try {
      const response = await deleteStudentDocument(id);

      if (!response?.success) {
        throw new Error(
          response?.message || "The server did not confirm deletion."
        );
      }

      setDocuments((current) =>
        current.filter((item) => item._id !== id)
      );

      setMessage("Document deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId("");
    }
  }

  return (
    <StudentLayout>
      <section className="content">
        <PageHeader
          eyebrow="DOCUMENT MANAGEMENT"
          title="Required documents"
          description="Upload and manage the documents associated with your admission application."
        />

        <form className="card upload-zone" onSubmit={handleUpload}>
          <UploadCloud size={30} />

          <h2>Upload a document</h2>
          <p>PDF, JPG, or PNG. Maximum file size: 5 MB.</p>

          <label className="field">
            <span>Document type</span>

            <select
              value={documentType}
              onChange={(event) =>
                setDocumentType(event.target.value)
              }
              disabled={uploading}
              required
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploading}
          />

          {selectedFile && (
            <p>
              Selected: <strong>{selectedFile.name}</strong> (
              {formatSize(selectedFile.size)})
            </p>
          )}

          <button
            type="submit"
            className="button button-primary"
            disabled={uploading || loading || !selectedFile}
          >
            {uploading ? "Uploading..." : "Upload document"}
          </button>
        </form>

        {error && (
          <p role="alert" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: "#15803d" }}>
            {message}
          </p>
        )}

        <div className="card">
          <div className="card-heading">
            <h2>Uploaded documents</h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span className="muted">
                {documents.length} files
              </span>

              <button
                type="button"
                className="icon-button"
                onClick={loadDocuments}
                disabled={loading || uploading}
                title="Refresh documents"
                aria-label="Refresh documents"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {loading ? (
            <p role="status">Loading saved documents...</p>
          ) : documents.length === 0 ? (
            <p className="muted">
              No documents uploaded yet. Choose a document type and
              upload your first file above.
            </p>
          ) : (
            <div className="document-list">
              {documents.map((document) => {
                const typeLabel =
                  documentTypes.find(
                    (type) => type.value === document.documentType
                  )?.label ??
                  document.documentType ??
                  "Document";

                const verified =
                  document.verificationStatus === "VERIFIED";

                return (
                  <div
                    className="document-row"
                    key={document._id}
                  >
                    <div className="file-icon">
                      <FileText size={20} />
                    </div>

                    <div className="document-info">
                      <strong>{typeLabel}</strong>

                      <span>
                        {document.fileName} ·{" "}
                        {formatSize(document.fileSize)}
                      </span>

                      <span className="muted">
                        Status:{" "}
                        {document.verificationStatus ?? "PENDING"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => handleDelete(document)}
                      disabled={
                        verified || deletingId === document._id
                      }
                      title={
                        verified
                          ? "Verified documents cannot be deleted"
                          : "Delete document"
                      }
                      aria-label={`Delete ${document.fileName}`}
                    >
                      {deletingId === document._id ? (
                        "..."
                      ) : (
                        <X size={17} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </StudentLayout>
  );
}