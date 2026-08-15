import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import productsRoutes from "./routes/products.routes";
import reviewsRoutes from "./routes/reviews.routes";
import ordersRoutes from "./routes/orders.routes";
import recommendationsRoutes from "./routes/recommendations.routes";
import { buildCollectionRouter } from "./routes/collections.routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan("dev"));
// Generous body limit — uploaded photos travel to /api/recommendations as base64.
app.use(express.json({ limit: "12mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "lookglass-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/products", reviewsRoutes); // adds /:productId/reviews under /api/products
app.use("/api/wardrobe", buildCollectionRouter("wardrobe"));
app.use("/api/wishlist", buildCollectionRouter("wishlist"));
app.use("/api/orders", ordersRoutes);
app.use("/api/recommendations", recommendationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`LOOKGLASS backend — by Kunal Deshmukh — running on http://localhost:${PORT}`);
});
