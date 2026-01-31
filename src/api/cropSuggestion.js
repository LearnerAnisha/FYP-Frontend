import apiClient from "./client";

export async function fetchCropSuggestion({
  location,
  cropName,
  growthStage,
}) {
  const response = await apiClient.post("/api/chatbot/crop-suggestion/", {
    location,
    crop_name: cropName,
    growth_stage: growthStage,
  });

  return response.data;
}
