import { api, setAuthToken } from "./client";

type LoginResp = { accessToken: string; refreshToken?: string; user?: any };

export async function login(identifier: string, password: string) 
{
  const body = identifier.includes("@") ? { email: identifier, password } : { username: identifier, password };
  const { data } = await api.post<LoginResp>("/auth/login", body);
  setAuthToken(data.accessToken);

  return data;
}

export async function register(name: string, email: string, password: string) 
{
  const { data } = await api.post("/auth/register", { name, email, password });
  // @ts-ignore in case backend also returns tokens here
  if (data?.accessToken) setAuthToken(data.accessToken);
  
  return data;
}