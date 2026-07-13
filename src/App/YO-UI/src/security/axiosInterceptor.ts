import axios from "axios";
import { unwrapApiResponse } from "./apiPayloadSecurity";
import { BaseEndpoints } from "../config/BaseEndpoints";

export const api = axios.create({
  baseURL: BaseEndpoints.base,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(async (response) => {
  response.data = await unwrapApiResponse(response.data);
  return response;
});
