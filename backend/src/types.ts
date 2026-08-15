export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: "dress" | "top" | "jacket" | "bottoms" | "shoes" | "bag" | "accessory" | "saree" | "kurta" | "lehenga" | "sherwani";
  price: number;
  colorway: "Bone" | "Ink" | "Brass" | "Violet" | "Maroon" | "Gold" | "Emerald" | "Ivory" | "Blush" | "Sage";
  tags: string[];
  occasion: "Everyday" | "Office" | "Evening" | "Festive";
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
  userId: string;
  productId?: string;
  name: string;
  category: Product["category"];
  price: number | null;
  colorway: string;
  occasion: string;
  source: "catalog" | "ai";
  image?: string;
  savedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CollectionItem[];
  total: number;
  status: "confirmed";
  createdAt: string;
}

export interface DBShape {
  users: User[];
  wardrobe: CollectionItem[];
  wishlist: CollectionItem[];
  orders: Order[];
  reviews: Review[];
}
