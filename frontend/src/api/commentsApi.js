import api from "./api";

export const getComments = async (postId) => {
  const response = await api.get("/comments/", {
    params: {
      post_id: postId || undefined,
    },
  });

  return response.data;
};

export const getCommentById = async (id) => {
  const response = await api.get(`/comments/${id}`);
  return response.data;
};

export const addComment = async (comment) => {
  const response = await api.post("/comments/", comment);
  return response.data;
};

export const updateComment = async (id, comment) => {
  const response = await api.put(`/comments/${id}`, comment);
  return response.data;
};

export const removeComment = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};
