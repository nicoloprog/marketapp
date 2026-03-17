export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          role: "ADMIN" | "CUSTOMER";
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          role?: "ADMIN" | "CUSTOMER";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          role?: "ADMIN" | "CUSTOMER";
          created_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          make: string;
          model: string;
          year: number;
          vin: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          make: string;
          model: string;
          year: number;
          vin?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          make?: string;
          model?: string;
          year?: number;
          vin?: string | null;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          base_price: number;
          duration_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          base_price: number;
          duration_minutes: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          base_price?: number;
          duration_minutes?: number;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          service_id: string;
          scheduled_at: string;
          status:
            | "PENDING"
            | "APPROVED"
            | "IN_PROGRESS"
            | "COMPLETED"
            | "CANCELLED";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vehicle_id: string;
          service_id: string;
          scheduled_at: string;
          status?:
            | "PENDING"
            | "APPROVED"
            | "IN_PROGRESS"
            | "COMPLETED"
            | "CANCELLED";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vehicle_id?: string;
          service_id?: string;
          scheduled_at?: string;
          status?:
            | "PENDING"
            | "APPROVED"
            | "IN_PROGRESS"
            | "COMPLETED"
            | "CANCELLED";
          notes?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          stock: number;
          category: string | null;
          images: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          stock?: number;
          category?: string | null;
          images?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          stock?: number;
          category?: string | null;
          images?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total: number;
          status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total: number;
          status?: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total?: number;
          status?: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
        };
      };
    };
  };
};

// Convenience row types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export type BookingStatus = Booking["status"];
export type OrderStatus = Order["status"];
export type Role = User["role"];

// Cart (client-only, not in DB)
export interface CartItem {
  product: any;
  productId: string;
  quantity: number;
}
