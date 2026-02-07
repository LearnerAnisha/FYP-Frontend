import apiClient from "./client";

// Send chat message
export const sendChatMessage = async ({ session_id, message }) => {
  const response = await apiClient.post("/api/chatbot/chat/", {
    session_id,
    message,
  });
  return response.data;
};

// Get conversation history
export const getConversationHistory = async (sessionId) => {
  const response = await apiClient.get(
    `/api/chatbot/conversation/${sessionId}/`
  );
  return response.data;
};

// Get all user conversations
export const getUserConversations = async () => {
  const response = await apiClient.get("/api/chatbot/conversations/");
  return response.data;
};
