
import api from "./api";

export const createApplication = async () => {
  const response = await api.post("/student/application");
  return response.data;
};

export const getStudentApplication = async () => {
  const response = await api.get("/student/application");
  return response.data;
};

export const updateStudentApplication = async (data) => {
  const response = await api.put("/student/application", data);
  return response.data;
};

export const submitStudentApplication = async () => {
  const response = await api.post("/student/application/submit");
  return response.data;
};
