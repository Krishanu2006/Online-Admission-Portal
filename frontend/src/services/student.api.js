import api from "./api";

export const getStudentProfile = async () => {
  const response = await api.get("/student/profile");
  return response.data;
};

export const updateStudentProfile = async (data) => {
  const response = await api.put("/student/profile", data);
  return response.data;
};

export const getStudentDocuments = async () => {
  const response = await api.get("/student/documents");
  return response.data;
};

export const uploadStudentDocument = async (formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error("Document upload requires a FormData object.");
  }

  // Remove the Axios instance's default JSON content type.
  // The browser will generate multipart/form-data with its boundary.
  const response = await api.post("/student/documents", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return response.data;
};

export const deleteStudentDocument = async (documentId) => {
  const response = await api.delete(
    `/student/documents/${encodeURIComponent(documentId)}`
  );

  return response.data;
};