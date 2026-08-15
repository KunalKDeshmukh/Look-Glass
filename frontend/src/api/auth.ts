import { client } from "./client";
import { User } from "../types";

export async function register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await client.post("/auth/register", { name, email, password });
  return data;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await client.post("/auth/login", { email, password });
  return data;
}

export async function me(): Promise<{ user: User }> {
  const { data } = await client.get("/auth/me");
  return data;
}
