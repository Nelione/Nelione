/**
 * Tipos generados manualmente a partir de supabase/migrations/00000000000000_initial_schema.sql
 *
 * En producción, regenera este archivo con:
 *   npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > src/types/database.ts
 *
 * Mantenemos una versión manual aquí para que el proyecto compile sin
 * depender de la CLI de Supabase durante el desarrollo inicial.
 */

export type ProductType = "original" | "lamina" | "escultura";
export type ProductStatus = "draft" | "published" | "archived";
export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
export type AppRole = "admin" | "editor";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  product_type: ProductType;
  status: ProductStatus;
  price_amount: number;
  currency: string;
  stock_quantity: number | null;
  is_unique: boolean;
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
  weight_kg: number | null;
  medium: string | null;
  edition_info: string | null;
  year_created: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  width_px: number | null;
  height_px: number | null;
  created_at: string;
}

export interface Order {
  id: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: OrderStatus;
  customer_email: string;
  customer_name: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  subtotal_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price_amount: number;
  quantity: number;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

/** Producto con su categoría e imágenes embebidas (resultado típico de queries del catálogo). */
export interface ProductWithRelations extends Product {
  category: Category;
  product_images: ProductImage[];
}

// ----------------------------------------------------------------------------
// Supabase Database type (para tipar el cliente: createClient<Database>())
// ----------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Category, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Category, "id">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Product, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Product, "id">>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, "id" | "created_at"> &
          Partial<Pick<ProductImage, "id" | "created_at">>;
        Update: Partial<Omit<ProductImage, "id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Order, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Order, "id">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "created_at"> &
          Partial<Pick<OrderItem, "id" | "created_at">>;
        Update: Partial<Omit<OrderItem, "id">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> &
          Partial<Pick<Profile, "created_at" | "updated_at">>;
        Update: Partial<Omit<Profile, "id">>;
      };
    };
  };
}
