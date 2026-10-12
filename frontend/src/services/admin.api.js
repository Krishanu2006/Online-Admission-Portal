
import api from "./api";

// -------------------- APPLICATION APIs --------------------

export const getAdminApplications = async () => {
  const response = await api.get("/admin/applications");
  return response.data;
};

export const getAdminApplication = async (applicationId) => {
  const response = await api.get(
    `/admin/applications/${encodeURIComponent(applicationId)}`
  );

  return response.data;
};

export const updateAdminApplicationStatus = async (
  applicationId,
  status,
  rejectionReason = null
) => {
  const response = await api.put(
    `/admin/applications/${encodeURIComponent(applicationId)}/status`,
    {
      status,
      rejectionReason,
    }
  );

  return response.data;
};

// -------------------- DOCUMENT APIs --------------------

export const getAdminDocuments = async () => {
  const response = await api.get("/admin/documents");
  return response.data;
};

export const reviewAdminDocument = async (
  documentId,
  decision,
  rejectionReason = null
) => {
  const response = await api.patch(
    `/admin/documents/${encodeURIComponent(documentId)}/review`,
    {
      decision,
      rejectionReason,
    }
  );

  return response.data;
};

// Fetch a document using the authenticated Axios client.
// responseType: "blob" lets the browser display PDFs and images.
export const getAdminDocumentPreview = async (documentId) => {
  const response = await api.get(
    `/admin/documents/${encodeURIComponent(documentId)}/view`,
    {
      responseType: "blob",
      timeout: 30000,
    }
  );

  return response.data;
};
