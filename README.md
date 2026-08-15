# LOOKGLASS — AI-Powered Fashion Store

**Developed by Kunal Deshmukh**

A full-stack, AI-powered fashion e-commerce app. Upload a photo, get real
outfit recommendations from Claude's vision model, build a virtual
wardrobe, and shop a full catalog with search, similar-item discovery,
reviews, wishlist, and order history — all backed by a real REST API
with JWT authentication.

## Features

- **Photo upload + AI outfit recommendations** — the backend sends your
  photo to the Anthropic API (Claude vision) and returns four tailored
  outfit recommendations as structured JSON.
- **Style profile / personalized suggestions** — vibe, colorway, and
  occasion preferences feed both the AI prompt and the "Personalized
  picks" section on the homepage.
- **Similar product search** — tag- and category-based similarity, both
  as a shop filter and a "You might also like" rail on product pages.
- **Virtual wardrobe** — save any catalog item or AI recommendation into
  a persistent, per-user closet.
- **Wishlist** — save for later, remove, or check out directly.
- **Order history** — checkout from the wishlist creates a real order
  record with a timestamp and confirmation status.
- **Product reviews & ratings** — star ratings and written reviews per
  product, posted by signed-in users.
- **Authentication** — register/login with hashed passwords (bcrypt) and
  JWT-protected routes for anything user-specific.
- **Search, filtering, and pagination** across the full catalog.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + React Router
- **3D / motion:** Three.js + React Three Fiber + @react-three/drei (hero scene), Framer Motion (page transitions, tilt cards, buttons, scroll reveal)
- **Backend:** Node.js + Express + TypeScript + JWT auth + a JSON-file
  datastore (swap for Postgres/Mongo later without touching route logic)
- **AI:** Anthropic Messages API (Claude), called server-side so the API
  key is never exposed to the browser

## 3D & motion layer

- `components/Hero3D.tsx` — a lazy-loaded React Three Fiber scene (distorted icosahedron + floating accents, soft lighting, mouse-based parallax). Loads only on non-mobile viewports without `prefers-reduced-motion`; everywhere else the original static plate renders instead, so there's zero 3D bundle cost for those users.
- `components/Tilt3DCard.tsx` — reusable pointer-tracked 3D tilt wrapper, used on every product card.
- `components/Button.tsx` — shared button with hover elevation and tap-press feedback.
- `components/ScrollReveal.tsx` — fade/rise-in-on-scroll wrapper, used on Home's section blocks.
- `hooks/useMotionPreference.ts` — single source of truth for "should rich motion run right now," combining `prefers-reduced-motion` and a mobile-width check.
- Nav is now glassmorphic (blur increases on scroll) with an animated active-link underline; routes cross-fade via `AnimatePresence`.

## Body measurements & 3D avatar preview (in The Glass)

Alongside the photo upload, **The Glass** now has an optional measurements
panel (height, chest/bust, waist, hip, shoulder — cm or in) and a **3D
preview** for each of the four AI recommendations:

- `components/Avatar3D.tsx` — a **parametric mannequin**, not a
  reconstruction of the uploaded photo. Its proportions scale from the
  entered measurements against average adult baselines, and it's
  "dressed" by tinting the relevant body zone with the recommendation's
  color palette (full-length wrap for dress/saree/kurta/lehenga/sherwani,
  torso only for top/jacket, legs for bottoms, a small accent piece for
  shoes/bag/accessory). It's intentionally stylized rather than
  photorealistic — actually reconstructing a real body/face from a photo
  is a hard, separate ML problem, and not one to fake.
- Drag to rotate, scroll to zoom (`OrbitControls`), an auto-rotate
  toggle, and a **Compare** mode that renders two independently
  selectable outfits side by side on matching mannequins.
- Like the hero scene, this is lazy-loaded and only renders on capable,
  non-mobile, motion-enabled devices — everywhere else you get a
  lightweight flat preview instead.
- **Privacy:** measurements are stored client-side only (`localStorage`)
  and sent to the backend solely as part of the `/api/recommendations`
  request, to give the AI fit/silhouette context — the backend does not
  persist them anywhere, and the prompt explicitly instructs the model
  never to comment on body size or weight.


## Project structure

```
lookglass/
├── backend/     Express + TypeScript API
└── frontend/    React + TypeScript + Vite app
```

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env      # then add your ANTHROPIC_API_KEY and a JWT_SECRET
npm install
npm run dev                # runs on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # defaults to http://localhost:4000/api
npm install
npm run dev                # runs on http://localhost:5173
```

Open http://localhost:5173, create an account, and try uploading a photo
under **The Glass** to see live AI recommendations.

## API overview

| Method | Route                              | Auth | Description                          |
|--------|-------------------------------------|------|---------------------------------------|
| POST   | /api/auth/register                  | –    | Create an account                     |
| POST   | /api/auth/login                     | –    | Sign in                               |
| GET    | /api/auth/me                        | ✓    | Current user                          |
| GET    | /api/products                       | –    | Search/filter/paginate catalog        |
| GET    | /api/products/:id                   | –    | Product detail                        |
| GET    | /api/products/:id/similar           | –    | Similar items                         |
| GET    | /api/products/:id/reviews           | –    | List reviews                          |
| POST   | /api/products/:id/reviews           | ✓    | Post a review                         |
| GET    | /api/wardrobe                       | ✓    | List saved wardrobe items             |
| POST   | /api/wardrobe                       | ✓    | Save an item                          |
| DELETE | /api/wardrobe/:itemId               | ✓    | Remove a saved item                   |
| GET    | /api/wishlist                       | ✓    | List wishlist                         |
| POST   | /api/wishlist                       | ✓    | Save an item                          |
| DELETE | /api/wishlist/:itemId               | ✓    | Remove a saved item                   |
| GET    | /api/orders                         | ✓    | Order history                         |
| POST   | /api/orders/from-wishlist/:itemId   | ✓    | Checkout one wishlist item            |
| POST   | /api/orders                         | ✓    | Checkout an arbitrary cart            |
| POST   | /api/recommendations                | –    | AI outfit recommendations from a photo|

## Product images

Every catalog item ships with an illustrated "lookbook plate" — a
generated SVG matched to that product's category, colorway, and name —
stored in `frontend/public/products/*.svg` and referenced by each
product's `image` field. They're bundled as real files (not hotlinked
to a third-party photo service), so there's nothing external to break
and no stock-photo licensing to worry about. Swap in real product
photography later by replacing the files at the same paths, or by
pointing `image` at your own CDN URLs.

## Notes

- The backend datastore is a single JSON file (`backend/src/data/db.json`,
  created automatically on first run) — perfect for a portfolio/demo
  project. For production, swap `src/db.ts` for a real database client.
- Never commit your `.env` file — `ANTHROPIC_API_KEY` and `JWT_SECRET`
  should stay private.

---
Built and designed by **Kunal Deshmukh**.
#   L o o k - G l a s s  
 