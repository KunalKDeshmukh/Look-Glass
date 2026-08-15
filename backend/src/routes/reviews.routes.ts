import { Router } from "express";
import products from "../data/products.json";
import { Product } from "../types";
import { readDB, writeDB } from "../db";
import { newId } from "../utils/ids";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
const CATALOG = products as Product[];

router.get("/:productId/reviews", (req, res) => {
  const db = readDB();
  const items = db.reviews.filter((r) => r.productId === req.params.productId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ items });
});

router.post("/:productId/reviews", requireAuth, (req: AuthedRequest, res) => {
  const product = CATALOG.find((p) => p.id === req.params.productId);
  if (!product) {
    res.status(404).json({ error: "That piece isn't in the catalog." });
    return;
  }
  const { rating, comment } = req.body || {};
  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5." });
    return;
  }
  if (!comment || String(comment).trim().length < 3) {
    res.status(400).json({ error: "Say a little more in your review." });
    return;
  }
  const db = readDB();
  const user = db.users.find((u) => u.id === req.userId);
  const review = {
    id: newId(),
    productId: product.id,
    userId: req.userId as string,
    userName: user?.name || "Anonymous",
    rating: ratingNum,
    comment: String(comment).trim(),
    createdAt: new Date().toISOString(),
  };
  db.reviews.push(review);
  writeDB(db);
  res.status(201).json({ review });
});

export default router;
