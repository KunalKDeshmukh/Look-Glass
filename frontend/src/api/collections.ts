import { client } from "./client";
import { CollectionItem } from "../types";

type ListKey = "wardrobe" | "wishlist";

export async function listCollection(key: ListKey): Promise<{ items: CollectionItem[] }> {
  const { data } = await client.get(`/${key}`);
  return data;
}

export async function addToCollection(key: ListKey, item: Partial<CollectionItem>): Promise<{ item: CollectionItem }> {
  const { data } = await client.post(`/${key}`, item);
  return data;
}

export async function removeFromCollection(key: ListKey, itemId: string): Promise<void> {
  await client.delete(`/${key}/${itemId}`);
}
