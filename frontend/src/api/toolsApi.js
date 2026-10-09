import api from "./api";

export const getAllTools = async (
  search = "",
  category = "",
  page = 1,
  limit = 30
) => {
  const response = await api.get("/tools/", {
    params: {
      search: search || undefined,
      category: category || undefined,
      page,
      limit,
    },
  });

  return response.data;
};

export const getToolById = async (id) => {
  const response = await api.get(`/tools/${id}`);
  return response.data;
};

export const addTool = async (tool) => {
  const response = await api.post("/tools/", tool);
  return response.data;
};

export const updateTool = async (id, tool) => {
  const response = await api.put(`/tools/${id}`, tool);
  return response.data;
};

export const deleteTool = async (id) => {
  const response = await api.delete(`/tools/${id}`);
  return response.data;
};
