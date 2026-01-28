import apiClient from "./client";

export const sendChatMessage = async ({ session_id, message }) => {
  const response = await apiClient.post("/api/chatbot/chat/", {
    session_id,
    message,
  });

  return response.data;
};
