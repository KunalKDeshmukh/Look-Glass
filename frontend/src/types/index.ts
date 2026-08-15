export type Category = "dress" | "top" | "jacket" | "bottoms" | "shoes" | "bag" | "accessory" | "saree" | "kurta" | "lehenga" | "sherwani";
export type Colorway = "Bone" | "Ink" | "Brass" | "Violet" | string;
export type Occasion = "Everyday" | "Office" | "Evening" | string;

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  colorway: Colorway;
  tags: string[];
  occasion: Occasion;
  description: string;
  rating: number;
  reviewCount: number;
  image: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  productId?: string;
  name: string;
  category: Category;
  price: number | null;
  colorway: string;
  occasion: string;
  source: "catalog" | "ai";
  image?: string;
  savedAt: string;
}

export interface Order {
  id: string;
  items: CollectionItem[];
  total: number;
  status: "confirmed";
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface StyleProfile {
  vibes: string[];
  colors: string[];
  occasions: string[];
}

export interface AIRecommendation {
  title: string;
  category: Category;
  description: string;
  colorPalette: string[];
  styleNote: string;
}

export type MeasurementUnit = "cm" | "in";

export interface BodyMeasurements {
  unit: MeasurementUnit;
  heightCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  shoulderCm: number | null;
}
