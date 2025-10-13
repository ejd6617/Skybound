import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:3000";

export const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

export function setAuthToken(token?: string) 
{
  if (token) 
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else 
    delete api.defaults.headers.common.Authorization;
}