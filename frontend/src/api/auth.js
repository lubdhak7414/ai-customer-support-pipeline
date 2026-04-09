import apiClient from "./client";

export const registerRequest = async (payload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};

export const loginRequest = async (payload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};
