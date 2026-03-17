/**
 * data.ts – Supabase data-access layer & Mock Data
 */
import { supabase } from "@/lib/supabase/client";
import type {
  Product as ProductType,
  Service,
  Vehicle,
  Booking,
  Order,
  OrderItem,
  User,
  CartItem,
  BookingStatus,
} from "@/lib/supabase/types";

// Re-export types
export type {
  ProductType as Product,
  Service,
  Vehicle,
  Booking,
  Order,
  OrderItem,
  User,
  CartItem,
  BookingStatus,
};
export type { Role, OrderStatus } from "@/lib/supabase/types";

// ─── MOCK DATA (Fallback for UI components) ───────────────────────────────
export const products: ProductType[] = [
  {
    id: "1",
    name: "Heavy Duty Brake Pads",
    description: "Premium brake pads for all weather conditions.",
    price: 85.0,
    stock: 15,
    category: "Brakes",
    images: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
export const orders: Order[] = [];
export const bookings: Booking[] = [];
export const orderItems: OrderItem[] = [];

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────
// Note: These are often used in the Admin Dashboard to resolve IDs to names
export function getUserById(id: string) {
  // In a real app, you might fetch this, but for the dashboard list:
  return { name: "Client User", email: "user@example.com" };
}

export async function getProductById(id: string) {
  return (await getProducts()).find((p) => p.id === id) ?? null;
}

export function getServiceById(id: string) {
  const services = [
    { id: "1", name: "Towing" },
    { id: "2", name: "Oil Change" },
    { id: "3", name: "Battery Jump" },
  ];
  return services.find((s) => s.id === id) || { name: "General Service" };
}

export function getVehicleById(id: string) {
  return { make: "Generic", model: "Vehicle", plate: "ABC-123" };
}

// ─── LIVE DATA FUNCTIONS (Supabase) ──────────────────────────────────────────

// --- Products & Categories ---

/**
 * FIXED: Added getProductCategories to resolve your shop page error
 */
export async function getProductCategories(): Promise<string[]> {
  const { data, error } = await supabase.from("products").select("category");

  if (error) throw error;

  // Extract unique categories and filter out any null values
  const categories = Array.from(new Set(data?.map((p) => p.category))).filter(
    Boolean,
  ) as string[];
  return categories.sort();
}

export async function getProducts(
  category?: string | null,
): Promise<ProductType[]> {
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedProducts(limit = 4): Promise<ProductType[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

// --- Vehicles ---
export async function getVehiclesByUser(userId: string): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function createVehicle(
  vehicle: Omit<Vehicle, "id" | "created_at">,
): Promise<Vehicle> {
  const { data, error } = await supabase
    .from("vehicles")
    .insert(vehicle)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Bookings ---
export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createBooking(
  booking: Omit<Booking, "id" | "created_at">,
): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select()
    .single();

  if (error) {
    console.error("Supabase Error:", error);
    throw error;
  }
  return data;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

// ─── FORMATTERS ─────────────────────────────────────────────────────────────
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
