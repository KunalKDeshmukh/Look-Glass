import { Router } from "express";
import products from "../data/products.json";
import { Product } from "../types";

const router = Router();
const CATALOG = products as Product[];

// GET /api/products?search=&category=&occasion=&colorway=&page=&limit=
router.get("/", (req, res) => {
  const { search, category, occasion, colorway, page = "1", limit = "12" } = req.query as Record<string, string>;
  let results = CATALOG;

  if (category && category !== "all") results = results.filter((p) => p.category === category);
  if (occasion && occasion !== "all") results = results.filter((p) => p.occasion === occasion);
  if (colorway && colorway !== "all") results = results.filter((p) => p.colorway === colorway);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)) || p.colorway.toLowerCase().includes(q)
    );
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(48, parseInt(limit, 10) || 12));
  const start = (pageNum - 1) * limitNum;
  const paged = results.slice(start, start + limitNum);

  res.json({ items: paged, total: results.length, page: pageNum, limit: limitNum, totalPages: Math.ceil(results.length / limitNum) || 1 });
});

router.get("/:id", (req, res) => {
  const product = CATALOG.find((p) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "That piece isn't in the catalog." });
    return;
  }
  res.json({ product });
});

router.get("/:id/similar", (req, res) => {
  const product = CATALOG.find((p) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "That piece isn't in the catalog." });
    return;
  }
  const similar = CATALOG.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.tags.some((t) => product.tags.includes(t)))
  ).slice(0, 8);
  res.json({ items: similar });
});

export default router;
