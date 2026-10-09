import api from "./api";

export const getAllNews = async (keyword = "") => {
  const response = await api.get("/news/", {
    params: {
      keyword: keyword || undefined,
    },
  });

  return response.data;
};

export const getNewsById = async (id) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};

export const addNews = async (article) => {
  const response = await api.post("/news/", article);
  return response.data;
};

export const updateNews = async (id, article) => {
  const response = await api.put(`/news/${id}`, article);
  return response.data;
};

export const deleteNews = async (id) => {
  const response = await api.delete(`/news/${id}`);
  return response.data;
};
