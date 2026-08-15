import { Router } from "express";
import { readDB, writeDB } from "../db";
import { newId } from "../utils/ids";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { CollectionItem, Order } from "../types";

const router = Router();

router.get("/", requireAuth, (req: AuthedRequest, res) => {
  const db = readDB();
  const items = db.orders.filter((o) => o.userId === req.userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ items });
});

// Checkout directly from the wishlist: moves one saved item into an order.
router.post("/from-wishlist/:itemId", requireAuth, (req: AuthedRequest, res) => {
  const db = readDB();
  const item = db.wishlist.find((i) => i.id === req.params.itemId && i.userId === req.userId);
  if (!item) {
    res.status(404).json({ error: "That item isn't in your wishlist." });
    return;
  }
  const order: Order = {
    id: newId(),
    userId: req.userId as string,
    items: [item],
    total: item.price || 0,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  db.orders.unshift(order);
  db.wishlist = db.wishlist.filter((i) => i.id !== item.id);
  writeDB(db);
  res.status(201).json({ order });
});

// Direct checkout with an arbitrary cart of items (e.g. from the shop).
router.post("/", requireAuth, (req: AuthedRequest, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items) || !items.length) {
    res.status(400).json({ error: "Add at least one item before checking out." });
    return;
  }
  const db = readDB();
  const normalized: CollectionItem[] = items.map((i: any) => ({
    id: newId(),
    userId: req.userId as string,
    productId: i.productId,
    name: i.name,
    category: i.category,
    price: i.price ?? null,
    colorway: i.colorway || "Unspecified",
    occasion: i.occasion || "Everyday",
    source: i.source === "ai" ? "ai" : "catalog",
    image: i.image || undefined,
    savedAt: new Date().toISOString(),
  }));
  const order: Order = {
    id: newId(),
    userId: req.userId as string,
    items: normalized,
    total: normalized.reduce((sum, i) => sum + (i.price || 0), 0),
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  db.orders.unshift(order);
  writeDB(db);
  res.status(201).json({ order });
});

export default router;
