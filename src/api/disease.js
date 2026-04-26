import apiClient from "./client";

/**
 * Upload crop image and get disease detection result
 * @param {File} imageFile
 */
export async function detectDisease(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await apiClient.post("/api/disease/detect/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getRecentScans() {
  const response = await apiClient.get("/api/disease/recent-scans/");
  return response.data;
}

export async function getScanDetail(id) {
  const response = await apiClient.get(`/api/disease/scans/${id}/`);
  return response.data;
}
