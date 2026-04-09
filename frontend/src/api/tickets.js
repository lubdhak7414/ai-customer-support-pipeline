import apiClient from "./client";

export const listTicketsRequest = async (filters = {}) => {
  const { data } = await apiClient.get("/tickets", { params: filters });
  return data;
};

export const createTicketRequest = async (payload) => {
  const { data } = await apiClient.post("/tickets", payload);
  return data;
};

export const regenerateTicketAiRequest = async (ticketId) => {
  const { data } = await apiClient.post(`/tickets/${ticketId}/regenerate-ai`);
  return data;
};
