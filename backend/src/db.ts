import fs from "fs";
import path from "path";
import { DBShape } from "./types";

// Lightweight JSON-file datastore. Good enough for a demo / portfolio
// project — swap this module out for Postgres/Mongo in production
// without touching any route handler, since everything goes through
// readDB()/writeDB().
const DB_PATH = path.join(__dirname, "data", "db.json");

function ensureFile(): void {
  if (!fs.existsSync(DB_PATH)) {
    const initial: DBShape = { users: [], wardrobe: [], wishlist: [], orders: [], reviews: [] };
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
  }
}

export function readDB(): DBShape {
  ensureFile();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DBShape;
}

export function writeDB(data: DBShape): void {
  ensureFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
