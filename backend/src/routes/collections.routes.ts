import { Router } from "express";
import { readDB, writeDB } from "../db";
import { newId } from "../utils/ids";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { CollectionItem, DBShape } from "../types";

// Factory: builds a CRUD router for either the "wardrobe" or "wishlist"
// collection, scoped to the signed-in user. Both collections share the
// exact same shape, so one router implementation covers both.
export function buildCollectionRouter(listKey: "wardrobe" | "wishlist"): Router {
  const router = Router();

  router.get("/", requireAuth, (req: AuthedRequest, res) => {
    const db = readDB();
    const items = db[listKey].filter((i) => i.userId === req.userId);
    res.json({ items });
  });

  router.post("/", requireAuth, (req: AuthedRequest, res) => {
    const { productId, name, category, price, colorway, occasion, source, image } = req.body || {};
    if (!name || !category) {
      res.status(400).json({ error: "An item needs at least a name and a category." });
      return;
    }
    const db = readDB();
    const item: CollectionItem = {
      id: newId(),
      userId: req.userId as string,
      productId,
      name,
      category,
      price: price ?? null,
      colorway: colorway || "Unspecified",
      occasion: occasion || "Everyday",
      source: source === "ai" ? "ai" : "catalog",
      image: image || undefined,
      savedAt: new Date().toISOString(),
    };
    (db[listKey] as CollectionItem[]).push(item);
    writeDB(db);
    res.status(201).json({ item });
  });

  router.delete("/:itemId", requireAuth, (req: AuthedRequest, res) => {
    const db = readDB();
    const before = db[listKey].length;
    db[listKey] = db[listKey].filter((i) => !(i.id === req.params.itemId && i.userId === req.userId)) as DBShape[typeof listKey];
    if (db[listKey].length === before) {
      res.status(404).json({ error: "Item not found in your " + listKey + "." });
      return;
    }
    writeDB(db);
    res.json({ success: true });
  });

  return router;
}
