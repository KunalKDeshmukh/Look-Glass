import { client } from "./client";
import { CollectionItem, Order } from "../types";

export async function listOrders(): Promise<{ items: Order[] }> {
  const { data } = await client.get("/orders");
  return data;
}

export async function orderFromWishlist(itemId: string): Promise<{ order: Order }> {
  const { data } = await client.post(`/orders/from-wishlist/${itemId}`);
  return data;
}

export async function checkout(items: Partial<CollectionItem>[]): Promise<{ order: Order }> {
  const { data } = await client.post("/orders", { items });
  return data;
}
