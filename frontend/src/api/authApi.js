import api from "./api";

export const registerUser = async (user) => {
  const response = await api.post("/auth/register", user);
  return response.data;
};

export const loginUser = async (user) => {
  const response = await api.post("/auth/login", user);
  return response.data;
};
