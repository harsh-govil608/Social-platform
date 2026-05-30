import { axiosInstance } from "./axios";

export const ingestWikiContent = async ({ source, content, url, title }) => {
  const res = await axiosInstance.post("/wiki/ingest", { source, content, url, title });
  return res.data;
};

export const getWikiArticles = async ({ page = 1, limit = 12, type, q } = {}) => {
  const params = { page, limit };
  if (type && type !== "all") params.type = type;
  if (q) params.q = q;
  const res = await axiosInstance.get("/wiki", { params });
  return res.data;
};

export const getWikiArticle = async (slug) => {
  const res = await axiosInstance.get(`/wiki/${slug}`);
  return res.data;
};

export const getWikiRawStatus = async (rawId) => {
  const res = await axiosInstance.get(`/wiki/status/${rawId}`);
  return res.data;
};

export const retryWikiRaw = async (rawId) => {
  const res = await axiosInstance.post(`/wiki/retry/${rawId}`);
  return res.data;
};
