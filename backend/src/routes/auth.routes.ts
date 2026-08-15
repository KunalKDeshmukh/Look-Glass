import { Router } from "express";
import bcrypt from "bcryptjs";
import { readDB, writeDB } from "../db";
import { signToken } from "../utils/jwt";
import { newId } from "../utils/ids";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email, and password are all required." });
    return;
  }
  if (String(password).length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }
  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (existing) {
    res.status(409).json({ error: "An account with that email already exists." });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: newId(), name, email: String(email).toLowerCase(), passwordHash, createdAt: new Date().toISOString() };
  db.users.push(user);
  writeDB(db);
  const token = signToken(user.id);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }
  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    res.status(401).json({ error: "No account matches that email." });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "That password doesn't match." });
    return;
  }
  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

export default router;
