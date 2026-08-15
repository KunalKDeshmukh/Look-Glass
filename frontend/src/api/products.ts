import { client } from "./client";
import { Product, Review } from "../types";

export interface ProductQuery {
  search?: string;
  category?: string;
  occasion?: string;
  colorway?: string;
  page?: number;
  limit?: number;
}

export async function listProducts(query: ProductQuery = {}): Promise<{ items: Product[]; total: number; totalPages: number; page: number }> {
  const { data } = await client.get("/products", { params: query });
  return data;
}

export async function getProduct(id: string): Promise<{ product: Product }> {
  const { data } = await client.get(`/products/${id}`);
  return data;
}

export async function getSimilar(id: string): Promise<{ items: Product[] }> {
  const { data } = await client.get(`/products/${id}/similar`);
  return data;
}

export async function getReviews(productId: string): Promise<{ items: Review[] }> {
  const { data } = await client.get(`/products/${productId}/reviews`);
  return data;
}

export async function postReview(productId: string, rating: number, comment: string): Promise<{ review: Review }> {
  const { data } = await client.post(`/products/${productId}/reviews`, { rating, comment });
  return data;
}
